import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import "dotenv/config";
import { google } from "googleapis";
import cookieSession from "cookie-session";
import crypto from "crypto";
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error("CRITICAL: Turso database configuration is missing!");
} else {
  console.log("Turso database configuration detected.");
}

db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    photo TEXT,
    terms_accepted BOOLEAN DEFAULT FALSE
  )
`).catch(console.error);

const pendingSessions = new Map<string, any>();

import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || "").trim();
const GOOGLE_CLIENT_SECRET = (process.env.GOOGLE_CLIENT_SECRET || "").trim();
const SESSION_SECRET = process.env.SESSION_SECRET || "beatgangsta-secret-123";
const APP_URL = (process.env.APP_URL || "").trim();

console.log(`Startup: APP_URL is set to "${APP_URL}"`);

if (GOOGLE_CLIENT_ID) {
  console.log(`Google OAuth Client ID detected: ${GOOGLE_CLIENT_ID.substring(0, 10)}...`);
  if (!GOOGLE_CLIENT_ID.includes(".apps.googleusercontent.com")) {
    console.warn("WARNING: GOOGLE_CLIENT_ID does not look like a valid Google Client ID (should end with .apps.googleusercontent.com)");
  }
} else {
  console.warn("Google OAuth Client ID is missing!");
}

if (GOOGLE_CLIENT_SECRET) {
  if (GOOGLE_CLIENT_SECRET.includes(".apps.googleusercontent.com")) {
    console.error("CRITICAL ERROR: GOOGLE_CLIENT_SECRET looks like a Client ID! You might have swapped them.");
  }
}

const getRedirectUri = (req: express.Request) => {
  // 1. Detect from request headers (most accurate for custom domains)
  const host = req.headers["x-forwarded-host"] || req.get("host") || "";
  let protocol = req.headers["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");
  
  // Force HTTPS if not localhost
  if (host && !host.includes("localhost")) {
    protocol = "https";
  }

  if (host) {
    return `${protocol}://${host}/api/auth/google/callback`;
  }

  // 2. Fallback: If APP_URL is set and headers are missing
  if (APP_URL && APP_URL.startsWith("http")) {
    let cleanUrl = APP_URL.replace(/\/$/, "");
    // Force HTTPS if not localhost
    if (!cleanUrl.includes("localhost") && cleanUrl.startsWith("http:")) {
      cleanUrl = cleanUrl.replace("http:", "https:");
    }
    return `${cleanUrl}/api/auth/google/callback`;
  }

  return `https://beatgangsta.com/api/auth/google/callback`;
};

export async function createServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', true);

  // Force secure protocol for cookie-session (fixes Cloudflare Flexible SSL issues)
  app.use((req, res, next) => {
    // req.secure and req.protocol are getters, so we set the header instead
    // combined with 'trust proxy', this makes req.secure === true
    req.headers['x-forwarded-proto'] = 'https';
    
    // Append Partitioned attribute to all Set-Cookie headers for iframe support
    const originalSetHeader = res.setHeader;
    res.setHeader = function(name: string, value: any) {
      if (name.toLowerCase() === 'set-cookie') {
        const cookies = Array.isArray(value) ? value : [value];
        const partitionedCookies = cookies.map(v => {
          if (typeof v === 'string' && !v.includes('Partitioned')) {
            return `${v}; Partitioned`;
          }
          return v;
        });
        return originalSetHeader.call(this, name, partitionedCookies);
      }
      return originalSetHeader.call(this, name, value);
    };
    next();
  });

  app.use(cookieSession({
    name: 'session',
    keys: [SESSION_SECRET],
    maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
    secure: true,
    sameSite: 'none',
    httpOnly: true,
  }));

  // API routes go here
  app.use(express.json({ limit: '50mb' }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", appUrl: APP_URL });
  });

  app.post("/api/verify-passcode", (req, res) => {
    const { passcode } = req.body;
    const correctPasscode = process.env.BIRD_PHONE_PASSCODE || "420420";
    
    if (passcode === correctPasscode) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid passcode" });
    }
  });

  app.post("/api/verify-master", (req, res) => {
    const { key } = req.body;
    const correctKey = process.env.MASTER_KEY || "420420";
    
    if (key === correctKey) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Invalid key" });
    }
  });

  app.post("/api/check-unlocks", (req, res) => {
    const { grillStyle, knifeStyle } = req.body;
    
    // Hustle Mode Unlock Logic
    const hustleUnlocked = (grillStyle === 'gold' && knifeStyle === 'gold');
    
    res.json({
      hustleUnlocked,
      // We can add more logic here later if needed
    });
  });

  app.get("/api/debug-env", (req, res) => {
    res.json({
      APP_URL: APP_URL,
      GOOGLE_CLIENT_ID_EXISTS: !!GOOGLE_CLIENT_ID,
      NODE_ENV: process.env.NODE_ENV,
      detected_redirect_uri: getRedirectUri(req)
    });
  });

  // --- OAuth Routes ---
  app.get("/api/auth/google/url", (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ error: "Google OAuth credentials are not configured in environment variables." });
    }

    // Create a fresh client to ensure we use the latest environment variables
    const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    const redirectUri = getRedirectUri(req);
    console.log(`Generating Auth URL with redirect_uri: ${redirectUri}`);
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/drive.file'
      ],
      prompt: 'consent',
      redirect_uri: redirectUri
    });
    res.json({ url });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    const redirectUri = getRedirectUri(req);
    console.log(`Handling Callback with redirect_uri: ${redirectUri}`);

    try {
      console.log("OAuth callback received. Code present:", !!code);
      const client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
      const { tokens } = await client.getToken({
        code: code as string,
        redirect_uri: redirectUri
      });
      
      console.log("Tokens received successfully");
      client.setCredentials(tokens);
      
      const oauth2 = google.oauth2({ version: 'v2', auth: client });
      const userInfo = await oauth2.userinfo.get();
      console.log("User info fetched:", userInfo.data.email);

      if (!userInfo.data.id) {
        throw new Error("Google User ID missing from userinfo response");
      }

      // Create or update user in Turso
      await db.execute({
        sql: `INSERT INTO users (uid, email, name, photo) VALUES (?, ?, ?, ?) ON CONFLICT(uid) DO UPDATE SET email = ?, name = ?, photo = ?`,
        args: [userInfo.data.id, userInfo.data.email, userInfo.data.name, userInfo.data.picture, userInfo.data.email, userInfo.data.name, userInfo.data.picture]
      });

      const syncToken = crypto.randomBytes(32).toString('hex');
      const sessionUser = {
        uid: userInfo.data.id,
        email: userInfo.data.email,
        name: userInfo.data.name,
        photo: userInfo.data.picture
      };

      const minimalTokens = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date
      };

      // Set session directly for top-level windows (like production)
      if (req.session) {
        req.session.tokens = minimalTokens;
        req.session.user = sessionUser;
      }

      // Also store in pendingSessions for iframe sync (like preview)
      pendingSessions.set(syncToken, {
        tokens: minimalTokens,
        user: sessionUser
      });
      
      // Clean up after 5 minutes
      setTimeout(() => pendingSessions.delete(syncToken), 5 * 60 * 1000);

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', syncToken: '${syncToken}' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. You can close this window.</p>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("OAuth error:", error);
      res.status(500).send(`Authentication failed: ${error.message || "Unknown error"}`);
    }
  });

  app.post("/api/auth/sync", (req, res) => {
    const { syncToken } = req.body;
    if (!syncToken) {
      return res.status(400).json({ error: "No sync token provided" });
    }

    const sessionData = pendingSessions.get(syncToken);
    if (sessionData) {
      if (req.session) {
        req.session.tokens = sessionData.tokens;
        req.session.user = sessionData.user;
      }
      pendingSessions.delete(syncToken);
      res.json({ success: true, user: sessionData.user });
    } else {
      res.status(400).json({ error: "Invalid or expired sync token" });
    }
  });

  app.get("/api/auth/status", async (req, res) => {
    console.log("Request to /api/auth/status");
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    if (req.session && req.session.user) {
      if (!req.session.user.uid) {
        console.error("Session user missing UID, clearing session");
        req.session.user = null;
        return res.json({ authenticated: false });
      }
      console.log("User authenticated:", req.session.user.uid);
      try {
        const uid = String(req.session.user.uid);
        console.log("Fetching user from DB for UID:", uid, "Type:", typeof uid);
        // Fetch terms_accepted from Turso
        const userResult = await db.execute({
          sql: `SELECT terms_accepted FROM users WHERE uid = ?`,
          args: [uid]
        });
        const termsAccepted = userResult.rows[0]?.terms_accepted === 1;
        const userWithConsent = { ...req.session.user, termsAccepted };
        
        res.json({ authenticated: true, user: userWithConsent });
      } catch (err) {
        console.error("Error fetching user from DB:", err);
        res.status(500).json({ authenticated: false, error: "Database error" });
      }
    } else {
      console.log("User not authenticated");
      res.json({ authenticated: false });
    }
  });

  app.get("/api/auth/check-backup", async (req, res) => {
    if (!req.session || !req.session.tokens) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    auth.setCredentials(req.session.tokens);
    const drive = google.drive({ version: 'v3', auth });
    try {
      const rootFolderRes = await drive.files.list({
        q: "name = 'Beatgangsta Backups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: 'files(id, createdTime)',
        spaces: 'drive'
      });
      
      if (rootFolderRes.data.files && rootFolderRes.data.files.length > 0) {
        const rootFolder = rootFolderRes.data.files[0];
        res.json({ hasBackup: true, backupDate: rootFolder.createdTime });
      } else {
        res.json({ hasBackup: false });
      }
    } catch (error: any) {
      console.error("Check backup failed", error);
      res.status(500).json({ error: "Failed to check backup" });
    }
  });

  app.get("/api/cloud/url", async (req, res) => {
    if (!req.session || !req.session.tokens) {
      console.log("Cloud URL request: Not authenticated");
      return res.status(401).json({ error: "Not authenticated" });
    }
    const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    auth.setCredentials(req.session.tokens);
    const drive = google.drive({ version: 'v3', auth });
    try {
      // Force token refresh if needed
      const { token } = await auth.getAccessToken();
      if (token && req.session.tokens.access_token !== token) {
        req.session.tokens.access_token = token;
      }

      console.log("Cloud URL request: Fetching/Creating 'Beatgangsta Backups' folder...");
      const rootFolderId = await getOrCreateFolder(drive, 'Beatgangsta Backups');
      await ensureFolderPublic(drive, rootFolderId);
      console.log("Cloud URL request: Success, folder ID:", rootFolderId);
      res.json({ url: `https://drive.google.com/drive/folders/${rootFolderId}` });
    } catch (error: any) {
      console.error("Cloud URL request: Failed", error.message || error);
      res.status(500).json({ error: "Failed to get folder URL", details: error.message });
    }
  });

  app.delete("/api/cloud/data", async (req, res) => {
    if (!req.session || !req.session.tokens) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    auth.setCredentials(req.session.tokens);
    const drive = google.drive({ version: 'v3', auth });

    try {
      // Force token refresh if needed
      const { token } = await auth.getAccessToken();
      if (token && req.session.tokens.access_token !== token) {
        req.session.tokens.access_token = token;
      }

      const list = await drive.files.list({
        q: `name = 'Beatgangsta Backups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)'
      });

      if (list.data.files && list.data.files.length > 0) {
        for (const file of list.data.files) {
          if (file.id) {
            await drive.files.delete({ fileId: file.id });
          }
        }
      }
      res.json({ success: true, message: "Cloud data deleted successfully" });
    } catch (error) {
      console.error("Failed to delete cloud data", error);
      res.status(500).json({ error: "Failed to delete cloud data" });
    }
  });

  app.delete("/api/auth/account", async (req, res) => {
    if (!req.session || !req.session.tokens) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    auth.setCredentials(req.session.tokens);
    const drive = google.drive({ version: 'v3', auth });

    try {
      // Force token refresh if needed
      const { token } = await auth.getAccessToken();
      if (token && req.session.tokens.access_token !== token) {
        req.session.tokens.access_token = token;
      }

      // 1. Delete all Beatgangsta Backups folders
      const list = await drive.files.list({
        q: `name = 'Beatgangsta Backups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)'
      });

      if (list.data.files && list.data.files.length > 0) {
        for (const file of list.data.files) {
          if (file.id) {
            await drive.files.delete({ fileId: file.id });
          }
        }
      }

      // 2. Revoke token
      try {
        await auth.revokeCredentials();
      } catch (e) {
        console.error("Failed to revoke credentials", e);
      }

      // 3. Clear session
      req.session = null;

      res.json({ success: true, message: "Account and data deleted successfully" });
    } catch (error) {
      console.error("Failed to delete account", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  app.post("/api/auth/accept-terms", async (req, res) => {
    if (!req.session || !req.session.user || !req.session.user.uid) {
      console.error("Accept terms: Not authenticated or missing UID");
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      await db.execute({
        sql: `UPDATE users SET terms_accepted = 1 WHERE uid = ?`,
        args: [req.session.user.uid]
      });
      console.log(`Accept terms: Success for user ${req.session.user.uid}`);
      res.json({ success: true });
    } catch (err) {
      console.error("Accept terms: Database error", err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // --- Static Policy Routes for Google OAuth Compliance ---
  app.get("/privacy", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Privacy Policy - BeatGangsta</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 60px 24px; background: #fcfcfc; }
              h1 { font-size: 2.5rem; font-weight: 900; letter-spacing: -0.05em; border-bottom: 4px solid #f97316; padding-bottom: 20px; margin-bottom: 40px; text-transform: uppercase; }
              h2 { font-size: 1.5rem; font-weight: 900; margin-top: 50px; border-bottom: 1px solid #eee; padding-bottom: 10px; color: #f97316; text-transform: uppercase; letter-spacing: 0.05em; }
              h3 { font-size: 1.1rem; font-weight: 800; margin-top: 30px; color: #444; }
              p { margin-bottom: 20px; color: #555; }
              ul { padding-left: 24px; margin-bottom: 24px; list-style-type: square; }
              li { margin-bottom: 12px; color: #555; }
              a { color: #f97316; text-decoration: none; font-weight: 600; }
              a:hover { text-decoration: underline; }
              strong { color: #222; }
              footer { margin-top: 80px; font-size: 0.9rem; color: #999; border-top: 1px solid #eee; padding-top: 40px; text-align: center; }
          </style>
      </head>
      <body>
          <h1>PRIVACY POLICY</h1>
          <p>Last updated March 09, 2026</p>
          <p>This Privacy Notice for BeatGangsta ("<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>"), describes how and why we might access, collect, store, use, and/or share ("<strong>process</strong>") your personal information when you use our services ("<strong>Services</strong>"), including when you:</p>
          <ul>
            <li>Visit our website at <a href="http://www.beatgangsta.com" target="_blank">http://www.beatgangsta.com</a> or any website of ours that links to this Privacy Notice</li>
            <li>Use BeatGangsta. Generate a personalized guide that utilizes your owned music plugins. Providing parameters for plugins, vocal and instrumental creation guidance with midi files and beat patterns.</li>
            <li>Engage with us in other related ways, including any marketing or events</li>
          </ul>
          <p><strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:privacy@beatgangsta.com">privacy@beatgangsta.com</a>.</p>

          <h2>SUMMARY OF KEY POINTS</h2>
          <p><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.</p>
          <p><strong>Do we process any sensitive personal information?</strong> We do not process sensitive personal information.</p>
          <p><strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.</p>
          <p><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so.</p>
          <p><strong>In what situations and with which types of parties do we share personal information?</strong> We may share information in specific situations and with specific categories of third parties.</p>
          <p><strong>How do we keep your information safe?</strong> We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.</p>
          <p><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.</p>
          <p><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by visiting <a href="http://www.beatgangsta.com" target="_blank">http://www.beatgangsta.com</a>, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</p>

          <h2>1. WHAT INFORMATION DO WE COLLECT?</h2>
          <h3>Personal information you disclose to us</h3>
          <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</p>
          <p><strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:</p>
          <ul>
            <li>names</li>
            <li>email addresses</li>
            <li>contact or authentication data</li>
            <li>plugin list</li>
          </ul>
          <p><strong>Sensitive Information.</strong> We do not process sensitive information.</p>
          <p><strong>Social Media Login Data.</strong> We may provide you with the option to register with us using your existing social media account details, like your Facebook, X, or other social media account. If you choose to register in this way, we will collect certain profile information about you from the social media provider.</p>

          <h3>Information automatically collected</h3>
          <p>We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.</p>
          <p>Like many businesses, we also collect information through cookies and similar technologies. You can find out more about this in our Cookie Notice.</p>

          <h2>2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
          <p>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</p>
          <ul>
            <li>To facilitate account creation and authentication and otherwise manage user accounts via Google Sign-In.</li>
            <li>To provide cloud backup and restore capabilities via Google Drive integration.</li>
            <li>To deliver and facilitate delivery of services to the user.</li>
            <li>To respond to user inquiries/offer support to users.</li>
            <li>To send administrative information to you.</li>
            <li>To request feedback.</li>
            <li>To send you marketing and promotional communications.</li>
            <li>To deliver targeted advertising to you.</li>
            <li>To protect our Services.</li>
            <li>To identify usage trends.</li>
            <li>To determine the effectiveness of our marketing and promotional campaigns.</li>
            <li>To save or protect an individual's vital interest.</li>
          </ul>

          <h2>3. GOOGLE API SERVICES USER DATA POLICY</h2>
          <p>BeatGangsta's use and transfer to any other app of information received from Google APIs will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" target="_blank">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
          <p><strong>Google Sign-In:</strong> We use Google Sign-In to authenticate you and create your account. We access your name, email address, and profile picture to personalize your experience.</p>
          <p><strong>Google Drive:</strong> We use the <code>drive.file</code> scope to allow you to backup and restore your music plugin configurations and beat recipes. We only access files created or opened by BeatGangsta. We do not scan or access your other private files on Google Drive.</p>

          <h2>4. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</h2>
          <p>We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e., legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to fulfill our legitimate business interests.</p>

          <h2>5. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
          <p>We may share your data with third-party vendors, service providers, contractors, or agents ("third parties") who perform services for us or on our behalf and require access to such information to do that work. We have contracts in place with our third parties, which are designed to help safeguard your personal information.</p>
          <p>The categories of third parties we may share personal information with are as follows:</p>
          <ul>
            <li>Ad Networks</li>
            <li>User Account Registration & Authentication Services</li>
            <li>Website Hosting & Security Providers (Cloudflare)</li>
            <li>Data Analytics Services</li>
            <li>Cloud Computing Services</li>
            <li>AI Platforms</li>
            <li>Data Storage Service Providers</li>
            <li>Retargeting Platforms</li>
            <li>Performance Monitoring Tools</li>
            <li>Social Networks</li>
            <li>Payment Processors</li>
            <li>Affiliate Marketing Programs</li>
          </ul>

          <h2>6. WHAT IS OUR STANCE ON THIRD-PARTY WEBSITES?</h2>
          <p>The Services may link to third-party websites, online services, or mobile applications and/or contain advertisements from third parties that are not affiliated with us and which may link to other websites, services, or applications. We are not responsible for the content or privacy and security practices and policies of any third parties.</p>

          <h2>7. ADVERTISING AND COOKIES</h2>
          <p>We use third-party advertising companies to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
          <ul>
            <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites.</li>
            <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</li>
            <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank">Ads Settings</a>. (Alternatively, you can direct users to opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="http://www.aboutads.info" target="_blank">www.aboutads.info</a>.)</li>
          </ul>

          <h2>8. BOT PROTECTION AND SECURITY</h2>
          <p>We use Cloudflare Turnstile, a bot protection service, to protect our Services from spam and abuse. Turnstile works by collecting certain information from your browser and device to determine if you are a human or a bot. This processing is necessary for our legitimate interest in maintaining the security of our Services.</p>
          <p>By using our Services, you acknowledge that your data may be processed by Cloudflare in accordance with their <a href="https://www.cloudflare.com/privacypolicy/" target="_blank">Privacy Policy</a>.</p>

          <h2>9. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
          <p>We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.</p>

          <h2>10. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2>
          <p>As part of our Services, we offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies ("AI Products").</p>
          <p><strong>Use of AI Technologies:</strong> We provide the AI Products through third-party service providers, including Google Gemini API. Your input, output, and personal information will be shared with and processed by these AI Service Providers (Google) to provide the service. This application is hosted on Google Cloud Run.</p>
          <p><strong>How to Opt Out:</strong> Users can opt out of AI-based processing by choosing not to use the 'Generate Recipe' or 'Deep Dive' features. Users may also request the deletion of their account and all associated data by contacting us at coldestconcept@beatgangsta.com.</p>

          <h2>11. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
          <p>If you choose to register or log in to our Services using a social media account, we may have access to certain information about you, such as your name, email address, friends list, and profile picture.</p>

          <h2>12. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</h2>
          <p>Our servers are located in the United States. Regardless of your location, please be aware that your information may be transferred to, stored by, and processed by us in our facilities and in the facilities of the third parties with whom we may share your personal information.</p>
          <p>We use the European Commission's Standard Contractual Clauses for transfers of personal information. Our Data Processing Agreements are available here: <a href="https://cloud.google.com/terms/data-processing-addendum" target="_blank">https://cloud.google.com/terms/data-processing-addendum</a>.</p>

          <h2>13. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
          <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law.</p>

          <h2>14. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
          <p>We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process.</p>

          <h2>15. DO WE COLLECT INFORMATION FROM MINORS?</h2>
          <p>We do not knowingly collect data from or market to children under 18 years of age.</p>

          <h2>16. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
          <p>In some regions (like the EEA, UK, Switzerland, and Canada), you have certain rights under applicable data protection laws, including the right to request access, rectification, or erasure of your personal information.</p>

          <h2>17. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
          <p>Most web browsers include a Do-Not-Track ("DNT") feature. We do not currently respond to DNT browser signals. However, we recognize and honor Global Privacy Control (GPC) signals.</p>

          <h2>18. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
          <p>If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia, you may have specific rights regarding your personal information.</p>

          <h2>19. API KEY RESPONSIBILITY & LIABILITY</h2>
          <p>BeatGangsta provides a "Bring Your Own Key" (BYOK) feature that allows users to provide their own third-party API keys (e.g., Google Gemini API) to access certain AI-powered features.</p>
          <p><strong>User Responsibility:</strong> You are solely responsible for the security, confidentiality, and usage of any API key you provide to the application.</p>
          <p><strong>Local Storage:</strong> Your API key is stored locally within your browser's storage (localStorage) and is used solely as a pass-through to the respective AI service provider. BeatGangsta does not store your API key on its own servers.</p>
          <p><strong>No Liability for Costs:</strong> You are solely responsible for any costs, fees, or charges incurred on your third-party API account resulting from the use of your key within this application.</p>

          <h2>20. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
          <p>Yes, we will update this notice as necessary to stay compliant with relevant laws.</p>

          <h2>21. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
          <p>If you have questions or comments about this notice, you may email us at <a href="mailto:privacy@beatgangsta.com">privacy@beatgangsta.com</a>.</p>

          <h2>22. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
          <p>To request to review, update, or delete your personal information, please visit: <a href="http://www.beatgangsta.com" target="_blank">http://www.beatgangsta.com</a>.</p>

          <footer>
              <p>&copy; 2026 BeatGangsta. All rights reserved.</p>
          </footer>
      </body>
      </html>
    `);
  });

  app.get("/terms", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Terms of Service - BeatGangsta</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 60px 24px; background: #fcfcfc; }
              h1 { font-size: 2.5rem; font-weight: 900; letter-spacing: -0.05em; border-bottom: 4px solid #f97316; padding-bottom: 20px; margin-bottom: 40px; text-transform: uppercase; }
              h2 { font-size: 1.5rem; font-weight: 900; margin-top: 50px; border-bottom: 1px solid #eee; padding-bottom: 10px; color: #f97316; text-transform: uppercase; letter-spacing: 0.05em; }
              h3 { font-size: 1.1rem; font-weight: 800; margin-top: 30px; color: #444; }
              p { margin-bottom: 20px; color: #555; }
              ul { padding-left: 24px; margin-bottom: 24px; list-style-type: square; }
              li { margin-bottom: 12px; color: #555; }
              a { color: #f97316; text-decoration: none; font-weight: 600; }
              a:hover { text-decoration: underline; }
              strong { color: #222; }
              footer { margin-top: 80px; font-size: 0.9rem; color: #999; border-top: 1px solid #eee; padding-top: 40px; text-align: center; }
              .toc { background: #f9f9f9; padding: 30px; border-radius: 12px; border: 1px solid #eee; margin-bottom: 40px; }
              .toc h2 { margin-top: 0; border-bottom: none; font-size: 1.2rem; }
              .toc-link { display: block; margin-bottom: 8px; font-size: 0.95rem; }
          </style>
      </head>
      <body>
          <h1>TERMS OF USE</h1>
          <p>Last updated March 09, 2026</p>
          
          <h2>AGREEMENT TO OUR LEGAL TERMS</h2>
          <p>We are BeatGangsta. We operate the website at <a href="http://www.beatgangsta.com" target="_blank">http://www.beatgangsta.com</a>, as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").</p>
          <p>You can contact us by email at <a href="mailto:legal@beatgangsta.com">legal@beatgangsta.com</a> or by using the contact us form located at the bottom of the webpage <a href="http://www.beatgangsta.com" target="_blank">www.beatgangsta.com</a>.</p>
          <p>These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and BeatGangsta, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</p>
          <p>Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.</p>
          <p>We recommend that you print a copy of these Legal Terms for your records.</p>
          
          <div class="toc">
            <h2>TABLE OF CONTENTS</h2>
            <a class="toc-link" href="#services">1. OUR SERVICES</a>
            <a class="toc-link" href="#ip">2. INTELLECTUAL PROPERTY RIGHTS</a>
            <a class="toc-link" href="#userreps">3. USER REPRESENTATIONS</a>
            <a class="toc-link" href="#prohibited">4. PROHIBITED ACTIVITIES</a>
            <a class="toc-link" href="#ugc">5. USER GENERATED CONTRIBUTIONS</a>
            <a class="toc-link" href="#license">6. CONTRIBUTION LICENSE</a>
            <a class="toc-link" href="#google">7. GOOGLE SERVICES INTEGRATION</a>
            <a class="toc-link" href="#sitemanage">8. SERVICES MANAGEMENT</a>
            <a class="toc-link" href="#terms">9. TERM AND TERMINATION</a>
            <a class="toc-link" href="#modifications">10. MODIFICATIONS AND INTERRUPTIONS</a>
            <a class="toc-link" href="#law">10. GOVERNING LAW</a>
            <a class="toc-link" href="#disputes">11. DISPUTE RESOLUTION</a>
            <a class="toc-link" href="#corrections">12. CORRECTIONS</a>
            <a class="toc-link" href="#ai">13. AI-GENERATED CONTENT AND ADVERTISING</a>
            <a class="toc-link" href="#security">14. SECURITY AND BOT PROTECTION</a>
            <a class="toc-link" href="#disclaimer">15. DISCLAIMER</a>
            <a class="toc-link" href="#liability">16. LIMITATIONS OF LIABILITY</a>
            <a class="toc-link" href="#indemnification">17. INDEMNIFICATION</a>
            <a class="toc-link" href="#userdata">18. USER DATA</a>
            <a class="toc-link" href="#electronic">19. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</a>
            <a class="toc-link" href="#misc">20. MISCELLANEOUS</a>
            <a class="toc-link" href="#contact">21. CONTACT US</a>
          </div>

          <h2 id="services">1. OUR SERVICES</h2>
          <p>The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.</p>

          <h2 id="ip">2. INTELLECTUAL PROPERTY RIGHTS</h2>
          <h3>Our intellectual property</h3>
          <p>We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").</p>
          <p>Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties around the world.</p>
          <p>The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.</p>
          <h3>Your use of our Services</h3>
          <p>Subject to your compliance with these Legal Terms, including the "PROHIBITED ACTIVITIES" section below, we grant you a non-exclusive, non-transferable, revocable license to:</p>
          <ul>
            <li>access the Services; and</li>
            <li>download or print a copy of any portion of the Content to which you have properly gained access,</li>
          </ul>
          <p>solely for your personal, non-commercial use or internal business purpose.</p>

          <h2 id="userreps">3. USER REPRESENTATIONS</h2>
          <p>By using the Services, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Legal Terms; (2) you are not a minor in the jurisdiction in which you reside; (3) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (4) you will not use the Services for any illegal or unauthorized purpose; and (5) your use of the Services will not violate any applicable law or regulation.</p>

          <h2 id="prohibited">4. PROHIBITED ACTIVITIES</h2>
          <p>You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>

          <h2 id="ugc">5. USER GENERATED CONTRIBUTIONS</h2>
          <p>The Services does not offer users to submit or post content. We may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions").</p>

          <h2 id="license">6. CONTRIBUTION LICENSE</h2>
          <p>You and Services agree that we may access, store, process, and use any information and personal data that you provide and your choices (including settings).</p>
          <p>By submitting suggestions or other feedback regarding the Services, you agree that we can use and share such feedback for any purpose without compensation to you.</p>

          <h2 id="google">7. GOOGLE SERVICES INTEGRATION</h2>
          <p><strong>Google Sign-In:</strong> By using Google Sign-In, you authorize us to access your basic profile information (name, email, profile picture) for authentication purposes.</p>
          <p><strong>Google Drive:</strong> Our backup feature uses the Google Drive API. We only request access to files created by our application (<code>drive.file</code> scope). You maintain full ownership of your data. You can revoke access at any time through your Google Account security settings.</p>

          <h2 id="sitemanage">8. SERVICES MANAGEMENT</h2>
          <p>We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.</p>

          <h2 id="terms">9. TERM AND TERMINATION</h2>
          <p>These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON.</p>

          <h2 id="modifications">10. MODIFICATIONS AND INTERRUPTIONS</h2>
          <p>We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.</p>

          <h2 id="law">11. GOVERNING LAW</h2>
          <p>These Legal Terms shall be governed by and defined following the laws of the United States. BeatGangsta and yourself irrevocably consent that the courts of the United States shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.</p>

          <h2 id="disputes">12. DISPUTE RESOLUTION</h2>
          <h3>Informal Negotiations</h3>
          <p>To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a "Dispute" and collectively, the "Disputes"), the Parties agree to first attempt to negotiate any Dispute informally for at least 30 days before initiating arbitration.</p>

          <h2 id="corrections">13. CORRECTIONS</h2>
          <p>There may be information on the Services that contains typographical errors, inaccuracies, or omissions. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.</p>

          <h2 id="ai">14. AI-GENERATED CONTENT AND ADVERTISING</h2>
          <p><strong>AI Content:</strong> Our Services utilize the Google Gemini API to generate content. You acknowledge that AI-generated content may be inaccurate, incomplete, or biased. We do not guarantee the accuracy of any AI-generated output.</p>
          <p><strong>Advertising:</strong> We use Google AdSense to serve advertisements. Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our sites and/or other sites on the Internet.</p>

          <h2 id="security">15. SECURITY AND BOT PROTECTION</h2>
          <p>We utilize Cloudflare Turnstile to protect our Services from automated abuse and spam. By accessing our Services, you agree to comply with Cloudflare's security measures and acknowledge that your interaction with the verification process is subject to Cloudflare's terms and privacy policies.</p>

          <h2 id="disclaimer">16. DISCLAIMER</h2>
          <p>THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF.</p>

          <h2 id="liability">17. LIMITATIONS OF LIABILITY</h2>
          <p>IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES.</p>

          <h2 id="indemnification">18. INDEMNIFICATION</h2>
          <p>You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand.</p>

          <h2 id="userdata">19. USER DATA</h2>
          <p>We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services.</p>

          <h2 id="electronic">20. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2>
          <p>Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications.</p>

          <h2 id="misc">21. MISCELLANEOUS</h2>
          <p>These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us.</p>

          <h2 id="contact">22. CONTACT US</h2>
          <p>In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:</p>
          <p>
            <strong>BeatGangsta</strong><br>
            Email: <a href="mailto:legal@beatgangsta.com">legal@beatgangsta.com</a><br>
            Web: <a href="http://www.beatgangsta.com" target="_blank">www.beatgangsta.com</a> (Contact form at bottom of page)
          </p>

          <footer>
              <p>&copy; 2026 BeatGangsta. All rights reserved.</p>
          </footer>
      </body>
      </html>
    `);
  });

  app.get("/cookies", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cookie Policy - BeatGangsta</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
              h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
              h2 { margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              footer { margin-top: 50px; font-size: 0.8em; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
      </head>
      <body>
          <h1>Cookie Policy</h1>
          <p>Last updated: March 09, 2026</p>
          <p>BeatGangsta uses cookies and similar technologies to provide and improve our services. This policy explains how we use these technologies.</p>
          
          <h2>1. What are Cookies?</h2>
          <p>Cookies are small text files that are stored on your device when you visit a website. They help the website recognize your device and remember information about your visit.</p>

          <h2>2. How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul>
              <li><strong>Authentication:</strong> To keep you logged in via Google OAuth.</li>
              <li><strong>Preferences:</strong> To remember your theme settings and UI preferences.</li>
              <li><strong>Security:</strong> To protect your account and our services.</li>
          </ul>

          <h2>3. Managing Cookies</h2>
          <p>Most web browsers allow you to control cookies through their settings. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience.</p>

          <footer>
              <p>&copy; 2026 BeatGangsta. All rights reserved.</p>
          </footer>
      </body>
      </html>
    `);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
  });

  // --- Cloud Backup/Restore Routes ---
  
  async function getOrCreateFolder(drive: any, folderName: string, parentId?: string) {
    try {
      // Escape single quotes for Google Drive query
      const escapedName = folderName.replace(/'/g, "\\'");
      const query = parentId 
        ? `name = '${escapedName}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
        : `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        
      console.log(`getOrCreateFolder: Searching for folder "${folderName}" (parentId: ${parentId || 'root'})`);
      const res = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive'
      });
      
      if (res.data.files && res.data.files.length > 0) {
        console.log(`getOrCreateFolder: Found existing folder "${folderName}" with ID: ${res.data.files[0].id}`);
        return res.data.files[0].id;
      }
      
      console.log(`getOrCreateFolder: Folder "${folderName}" not found, creating it...`);
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined
      };
      
      const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id'
      });
      
      console.log(`getOrCreateFolder: Created folder "${folderName}" with ID: ${folder.data.id}`);
      return folder.data.id;
    } catch (error: any) {
      console.error(`getOrCreateFolder: Error for "${folderName}":`, error.message || error);
      throw error;
    }
  }

  async function ensureFolderPublic(drive: any, folderId: string) {
    try {
      await drive.permissions.create({
        fileId: folderId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
      console.log(`ensureFolderPublic: Folder ${folderId} is now public`);
    } catch (error: any) {
      console.error("ensureFolderPublic: Failed", error.message || error);
    }
  }

  async function uploadFileToFolder(drive: any, fileName: string, mimeType: string, content: string, parentId: string) {
    try {
      const escapedName = fileName.replace(/'/g, "\\'");
      const res = await drive.files.list({
        q: `name = '${escapedName}' and '${parentId}' in parents and trashed = false`,
        fields: 'files(id)'
      });
      
      const media = {
        mimeType: mimeType,
        body: content
      };
      
      if (res.data.files && res.data.files.length > 0) {
        console.log(`uploadFileToFolder: Updating existing file "${fileName}" (ID: ${res.data.files[0].id})`);
        await drive.files.update({
          fileId: res.data.files[0].id,
          media: media
        });
      } else {
        console.log(`uploadFileToFolder: Creating new file "${fileName}" in folder ${parentId}`);
        await drive.files.create({
          requestBody: {
            name: fileName,
            parents: [parentId]
          },
          media: media
        });
      }
    } catch (error: any) {
      console.error(`uploadFileToFolder: Error for "${fileName}":`, error.message || error);
      throw error;
    }
  }

  async function getFileFromFolder(drive: any, fileName: string, parentId: string) {
    const res = await drive.files.list({
      q: `name = '${fileName}' and '${parentId}' in parents and trashed = false`,
      fields: 'files(id)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    if (res.data.files && res.data.files.length > 0) {
      const fileId = res.data.files[0].id;
      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media',
        supportsAllDrives: true
      });
      return response.data;
    }
    return null;
  }

  // Helper to format Google API errors for BYOK users
  const handleGoogleError = (res: any, error: any, context: string) => {
    console.error(`${context}: Failed`, error.message || error);
    
    let message = `Failed to ${context.toLowerCase()}.`;
    let details = error.message || "Unknown error";
    
    // Check for "API not enabled" error
    if (details.includes("disabled") || details.includes("not been used in project")) {
      message = "Google Drive API is not enabled for your project.";
      details = "As the App Owner, you must enable the Drive API in your Google Cloud Console. Regular users will not see this error once you enable it. " + details;
    }

    res.status(500).json({ error: message, details });
  };

  app.post("/api/cloud/backup", async (req, res) => {
    if (!req.session || !req.session.tokens) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { data, preferences } = req.body;
    const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    auth.setCredentials(req.session.tokens);
    const drive = google.drive({ version: 'v3', auth });

    try {
      // Force token refresh if needed
      const { token } = await auth.getAccessToken();
      if (token && req.session.tokens.access_token !== token) {
        req.session.tokens.access_token = token;
      }

      console.log("Manual Backup: Starting...");
      const rootFolderId = await getOrCreateFolder(drive, 'Beatgangsta Backups');
      await ensureFolderPublic(drive, rootFolderId);
      
      // If preferences aren't provided, assume full backup
      const backupPrefs = preferences || { gear: true, settings: true, recipes: true, critiques: true };

      if (backupPrefs.settings && data.ui) {
        console.log("Manual Backup: Saving settings...");
        const settingsFolderId = await getOrCreateFolder(drive, 'Settings', rootFolderId);
        await uploadFileToFolder(drive, 'settings.json', 'application/json', JSON.stringify(data.ui, null, 2), settingsFolderId);
      }

      if (backupPrefs.gear && data.gear) {
        console.log("Manual Backup: Saving gear...");
        const gearFolderId = await getOrCreateFolder(drive, 'Gear', rootFolderId);
        await uploadFileToFolder(drive, 'gear.json', 'application/json', JSON.stringify(data.gear, null, 2), gearFolderId);
      }

      if (backupPrefs.recipes && data.vault && data.vault.recipes) {
        console.log("Manual Backup: Saving recipes...");
        const recipesFolderId = await getOrCreateFolder(drive, 'Recipes', rootFolderId);
        for (const recipe of data.vault.recipes) {
          const safeName = recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const recipeFolderId = await getOrCreateFolder(drive, safeName, recipesFolderId);
          await uploadFileToFolder(drive, 'recipe.json', 'application/json', JSON.stringify(recipe, null, 2), recipeFolderId);
        }
      }

      if (backupPrefs.critiques && data.vault && data.vault.critiques) {
        console.log("Manual Backup: Saving critiques...");
        const critiquesFolderId = await getOrCreateFolder(drive, 'Critiques', rootFolderId);
        for (const critique of data.vault.critiques) {
          const safeName = critique.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const critiqueFolderId = await getOrCreateFolder(drive, safeName, critiquesFolderId);
          await uploadFileToFolder(drive, 'critique.json', 'application/json', JSON.stringify(critique, null, 2), critiqueFolderId);
        }
      }

      console.log("Manual Backup: Success!");
      res.json({ success: true, folderUrl: `https://drive.google.com/drive/folders/${rootFolderId}` });
    } catch (error: any) {
      handleGoogleError(res, error, "Manual Backup");
    }
  });

  app.get("/api/cloud/fetch-rig", async (req, res) => {
    const { folderId } = req.query;
    if (!folderId || typeof folderId !== 'string') {
      return res.status(400).json({ error: "Folder ID is required" });
    }

    if (!req.session || !req.session.tokens) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    auth.setCredentials(req.session.tokens);
    const drive = google.drive({ version: 'v3', auth });

    try {
      // Helper to find a subfolder by name
      const findSubFolder = async (pid: string, name: string) => {
        const res = await drive.files.list({
          q: `name = '${name}' and '${pid}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
          fields: 'files(id)',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });
        return res.data.files && res.data.files.length > 0 ? res.data.files[0].id : null;
      };

      // 1. Get metadata for the provided folder to see what we're dealing with
      let currentFolderMeta: any = null;
      try {
        const metaRes = await drive.files.get({ 
          fileId: folderId, 
          fields: 'id, name, mimeType',
          supportsAllDrives: true
        });
        currentFolderMeta = metaRes.data;
      } catch (e) {
        console.error("Error fetching folder metadata:", e);
      }

      // 2. Find the Gear folder or gear.json file
      let gearFolderId: string | null = null;
      let gearFileId: string | null = null;
      
      // Case A: The provided folder IS named 'Gear'
      if (currentFolderMeta && currentFolderMeta.name === 'Gear' && currentFolderMeta.mimeType === 'application/vnd.google-apps.folder') {
        gearFolderId = folderId;
      } else if (currentFolderMeta && currentFolderMeta.name === 'gear.json') {
        // Case B: They shared the gear.json file directly
        gearFileId = folderId;
      } else {
        // Case C: Check if gear.json exists directly in the provided folder
        const gearJsonCheck = await drive.files.list({
          q: `name = 'gear.json' and '${folderId}' in parents and trashed = false`,
          fields: 'files(id)',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });

        if (gearJsonCheck.data.files && gearJsonCheck.data.files.length > 0) {
          gearFileId = gearJsonCheck.data.files[0].id;
        } else {
          // Case D: Look for a folder named 'Gear' inside the provided folder
          gearFolderId = await findSubFolder(folderId, 'Gear') || await findSubFolder(folderId, 'gear');
          
          if (!gearFolderId) {
            // Case E: Maybe they shared a folder containing 'Beatgangsta Backups'
            let backupsId = null;
            if (currentFolderMeta && (currentFolderMeta.name === 'Beatgangsta Backups' || currentFolderMeta.name === 'beatgangsta backups')) {
              backupsId = folderId;
            } else {
              backupsId = await findSubFolder(folderId, 'Beatgangsta Backups') || await findSubFolder(folderId, 'beatgangsta backups');
            }

            if (backupsId) {
              gearFolderId = await findSubFolder(backupsId, 'Gear') || await findSubFolder(backupsId, 'gear');
              if (!gearFolderId) {
                // Check if gear.json is directly in Beatgangsta Backups
                const backupsGearCheck = await drive.files.list({
                  q: `(name = 'gear.json' or name = 'Gear.json') and '${backupsId}' in parents and trashed = false`,
                  fields: 'files(id)',
                  supportsAllDrives: true,
                  includeItemsFromAllDrives: true
                });
                if (backupsGearCheck.data.files && backupsGearCheck.data.files.length > 0) {
                  gearFileId = backupsGearCheck.data.files[0].id;
                }
              }
            }
          }
        }
      }

      if (!gearFolderId && !gearFileId) {
        return res.status(404).json({ error: "Gear data not found. Make sure the link is correct and contains your 'Gear' folder or 'gear.json' file." });
      }

      let gearData = null;
      if (gearFileId) {
        const response = await drive.files.get({
          fileId: gearFileId,
          alt: 'media',
          supportsAllDrives: true
        });
        gearData = response.data;
      } else if (gearFolderId) {
        gearData = await getFileFromFolder(drive, 'gear.json', gearFolderId) || await getFileFromFolder(drive, 'Gear.json', gearFolderId);
      }
      
      if (!gearData) {
        return res.status(404).json({ error: "gear.json not found in the gear folder." });
      }

      const recipes: any[] = [];
      let recipesFolderId: string | null = null;

      // 3. Find the Recipes folder
      // Case A: The provided folder IS named 'Recipes'
      if (currentFolderMeta && (currentFolderMeta.name === 'Recipes' || currentFolderMeta.name === 'recipes') && currentFolderMeta.mimeType === 'application/vnd.google-apps.folder') {
        recipesFolderId = folderId;
      } else {
        // Case B: Look for 'Recipes' folder inside the provided folder
        recipesFolderId = await findSubFolder(folderId, 'Recipes') || await findSubFolder(folderId, 'recipes');
        
        if (!recipesFolderId) {
          // Case C: Check inside 'Beatgangsta Backups' if we found it earlier or find it now
          let backupsId = null;
          if (currentFolderMeta && (currentFolderMeta.name === 'Beatgangsta Backups' || currentFolderMeta.name === 'beatgangsta backups')) {
            backupsId = folderId;
          } else {
            backupsId = await findSubFolder(folderId, 'Beatgangsta Backups') || await findSubFolder(backupsId, 'beatgangsta backups');
          }
          
          if (backupsId) {
            recipesFolderId = await findSubFolder(backupsId, 'Recipes') || await findSubFolder(backupsId, 'recipes');
          }
        }
      }

      if (recipesFolderId) {
        const recipeFolders = await drive.files.list({ 
          q: `'${recipesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`, 
          fields: 'files(id)',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });
        
        for (const folder of recipeFolders.data.files || []) {
          const recipeData = await getFileFromFolder(drive, 'recipe.json', folder.id!);
          if (recipeData) recipes.push(recipeData);
        }
      }

      res.json({ success: true, gear: gearData, recipes });
    } catch (error: any) {
      handleGoogleError(res, error, "Fetch Friend Rig");
    }
  });

  app.post("/api/cloud/backup/recipe", async (req, res) => {
    if (!req.session || !req.session.tokens) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { recipe, midiFiles, loopFiles } = req.body;
    const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    auth.setCredentials(req.session.tokens);
    const drive = google.drive({ version: 'v3', auth });

    try {
      // Force token refresh if needed
      const { token } = await auth.getAccessToken();
      if (token && req.session.tokens.access_token !== token) {
        req.session.tokens.access_token = token;
      }

      const rootFolderId = await getOrCreateFolder(drive, 'Beatgangsta Backups');
      const recipesFolderId = await getOrCreateFolder(drive, 'Recipes', rootFolderId);
      const safeName = recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const recipeFolderId = await getOrCreateFolder(drive, safeName, recipesFolderId);

      await uploadFileToFolder(drive, 'recipe.json', 'application/json', JSON.stringify(recipe, null, 2), recipeFolderId);

      if (midiFiles && midiFiles.length > 0) {
        const midiFolderId = await getOrCreateFolder(drive, 'MIDI', recipeFolderId);
        for (const file of midiFiles) {
          await uploadFileToFolder(drive, file.name, 'audio/midi', Buffer.from(file.data, 'base64').toString('binary'), midiFolderId);
        }
      }

      if (loopFiles && loopFiles.length > 0) {
        const loopsFolderId = await getOrCreateFolder(drive, 'Musicloops', recipeFolderId);
        for (const file of loopFiles) {
          await uploadFileToFolder(drive, file.name, 'application/octet-stream', Buffer.from(file.data, 'base64').toString('binary'), loopsFolderId);
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      handleGoogleError(res, error, "Recipe Backup");
    }
  });

  app.post("/api/cloud/backup/critique", async (req, res) => {
    if (!req.session || !req.session.tokens) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { critique } = req.body;
    const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    auth.setCredentials(req.session.tokens);
    const drive = google.drive({ version: 'v3', auth });

    try {
      // Force token refresh if needed
      const { token } = await auth.getAccessToken();
      if (token && req.session.tokens.access_token !== token) {
        req.session.tokens.access_token = token;
      }

      const rootFolderId = await getOrCreateFolder(drive, 'Beatgangsta Backups');
      const critiquesFolderId = await getOrCreateFolder(drive, 'Critiques', rootFolderId);
      const safeName = critique.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const critiqueFolderId = await getOrCreateFolder(drive, safeName, critiquesFolderId);

      await uploadFileToFolder(drive, 'critique.json', 'application/json', JSON.stringify(critique, null, 2), critiqueFolderId);

      res.json({ success: true });
    } catch (error: any) {
      handleGoogleError(res, error, "Critique Backup");
    }
  });

  app.get("/api/cloud/restore", async (req, res) => {
    if (!req.session || !req.session.tokens) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
    auth.setCredentials(req.session.tokens);
    const drive = google.drive({ version: 'v3', auth });

    try {
      // Force token refresh if needed
      const { token } = await auth.getAccessToken();
      if (token && req.session.tokens.access_token !== token) {
        req.session.tokens.access_token = token;
      }

      const rootRes = await drive.files.list({
        q: `name = 'Beatgangsta Backups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)'
      });

      if (!rootRes.data.files || rootRes.data.files.length === 0) {
        return res.status(404).json({ error: "No backup found in cloud." });
      }

      const rootFolderId = rootRes.data.files[0].id;
      const restoredData: any = { version: "1.0", timestamp: Date.now(), vault: { recipes: [], critiques: [] } };

      // Get Settings
      const settingsFolderRes = await drive.files.list({ q: `name = 'Settings' and '${rootFolderId}' in parents and trashed = false`, fields: 'files(id)' });
      if (settingsFolderRes.data.files && settingsFolderRes.data.files.length > 0) {
        const settingsData = await getFileFromFolder(drive, 'settings.json', settingsFolderRes.data.files[0].id!);
        if (settingsData) restoredData.uiSettings = settingsData;
      }

      // Get Gear
      const gearFolderRes = await drive.files.list({ q: `name = 'Gear' and '${rootFolderId}' in parents and trashed = false`, fields: 'files(id)' });
      if (gearFolderRes.data.files && gearFolderRes.data.files.length > 0) {
        const gearData = await getFileFromFolder(drive, 'gear.json', gearFolderRes.data.files[0].id!);
        if (gearData) restoredData.gear = gearData;
      }

      // Get Recipes
      const recipesFolderRes = await drive.files.list({ q: `name = 'Recipes' and '${rootFolderId}' in parents and trashed = false`, fields: 'files(id)' });
      if (recipesFolderRes.data.files && recipesFolderRes.data.files.length > 0) {
        const recipesFolderId = recipesFolderRes.data.files[0].id!;
        const recipeFolders = await drive.files.list({ q: `'${recipesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`, fields: 'files(id, name)' });
        
        if (recipeFolders.data.files) {
          for (const folder of recipeFolders.data.files) {
            const recipeData = await getFileFromFolder(drive, 'recipe.json', folder.id!);
            if (recipeData) restoredData.vault.recipes.push(recipeData);
          }
        }
      }

      // Get Critiques
      const critiquesFolderRes = await drive.files.list({ q: `name = 'Critiques' and '${rootFolderId}' in parents and trashed = false`, fields: 'files(id)' });
      if (critiquesFolderRes.data.files && critiquesFolderRes.data.files.length > 0) {
        const critiquesFolderId = critiquesFolderRes.data.files[0].id!;
        const critiqueFolders = await drive.files.list({ q: `'${critiquesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`, fields: 'files(id, name)' });
        
        if (critiqueFolders.data.files) {
          for (const folder of critiqueFolders.data.files) {
            const critiqueData = await getFileFromFolder(drive, 'critique.json', folder.id!);
            if (critiqueData) restoredData.vault.critiques.push(critiqueData);
          }
        }
      }

      res.json({ data: restoredData });
    } catch (error: any) {
      handleGoogleError(res, error, "Cloud Restore");
    }
  });

  app.post("/api/gemini", async (req, res) => {
    const { model, contents, config, userApiKey } = req.body;
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    console.log("Received request for model:", model);
    console.log("apiKey source:", userApiKey ? "User provided" : (process.env.GEMINI_API_KEY ? "Server fallback" : "None"));

    if (!apiKey) {
      return res.status(500).json({ error: "API_KEY_MISSING: API key is missing. Please provide your own Gemini API key in the settings to use this feature." });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable NGINX buffering
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Send headers immediately
    
    // Send a space and newline every 10 seconds to prevent Cloudflare/NGINX timeouts
    const heartbeat = setInterval(() => {
      res.write(' \n');
      // @ts-ignore
      if (res.flush) res.flush(); // Flush if compression middleware is added later
    }, 10000);

    try {
      // Since we only allow user keys, we MUST set vertexai: false.
      // We explicitly set the baseUrl to the public API to bypass any environment-level proxies.
      // We also forward the Referer header so that API key restrictions (like *.beatgangsta.com/*) work.
      const genAI = new GoogleGenAI({ 
        apiKey,
        vertexai: false,
        project: undefined,
        location: undefined,
        httpOptions: { 
          baseUrl: 'https://generativelanguage.googleapis.com',
          headers: {
            'Referer': req.headers.referer || 'https://beatgangsta.com/'
          }
        }
      });
      
      const response = await genAI.models.generateContent({
        model,
        contents,
        config
      });
      
      clearInterval(heartbeat);
      
      // The Gemini SDK uses a getter for the .text property, which doesn't automatically
      // show up in standard JSON.stringify. We explicitly extract and send this text.
      const responseData = {
        ...response,
        text: response.text
      };
      
      res.write(JSON.stringify(responseData));
      res.end();
    } catch (error: any) {
      clearInterval(heartbeat);
      console.error("Gemini API error:", error);
      
      let errorMessage = error.message || "Error calling Gemini API";
      let statusCode = 500;

      // Detect Rate Limit (429) errors from Google
      if (error.status === 429 || JSON.stringify(error).includes("429") || errorMessage.toLowerCase().includes("rate limit")) {
        errorMessage = "GEMINI_RATE_LIMIT: You have exceeded your Google AI API quota. If you are on the Free Tier, wait 60 seconds and try again. Consider upgrading to a Pay-as-you-go plan in Google AI Studio for higher limits.";
        statusCode = 429;
      }

      res.status(statusCode).write(JSON.stringify({ 
        error: errorMessage,
        details: error.details || []
      }));
      res.end();
    }
  });

  app.post("/api/verify-turnstile", async (req, res) => {
    const token = req.body["cf-turnstile-response"];
    const secretKey = (process.env.TURNSTILE_SECRET_KEY || "").trim();
    const siteKey = (process.env.VITE_TURNSTILE_SITE_KEY || "").trim();

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    if (!secretKey) {
      console.warn("TURNSTILE_SECRET_KEY is not set. Skipping verification (DEV ONLY).");
      return res.json({ success: true });
    }

    if (siteKey && secretKey === siteKey) {
      console.error("CRITICAL: TURNSTILE_SECRET_KEY is identical to VITE_TURNSTILE_SITE_KEY. You likely swapped them in the settings.");
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', token);

      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const data = await response.json();

      if (data.success) {
        res.json({ success: true });
      } else {
        console.error("Turnstile verification failed:", data);
        res.status(403).json({ 
          error: "Security verification failed.", 
          details: data['error-codes'] ? data['error-codes'].join(', ') : 'Unknown error'
        });
      }
    } catch (error) {
      console.error("Turnstile verification error:", error);
      res.status(500).json({ error: "Internal server error during verification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*splat", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

// For local development
if (process.env.NODE_ENV !== "production") {
  createServer().then(app => {
    app.listen(3000, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:3000`);
    });
  });
}

// For Vercel
export default async (req: any, res: any) => {
  const app = await createServer();
  return app(req, res);
};
