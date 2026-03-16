import MidiWriter from 'midi-writer-js';
import JSZip from 'jszip';
import { DrumPattern } from '../types';

export type PatternLength = 4 | 8;
export type PatternVariation = 'A' | 'B';

export const generateDrumMidiBaseData = (
  currentPattern: DrumPattern,
  recipeTitle: string,
  activeSection: string,
  bpm: number,
  useVelocityHumanization: boolean
): Uint8Array => {
  if (!currentPattern) return new Uint8Array();
  const track = new MidiWriter.Track();
  track.addTrackName(`${recipeTitle} - ${activeSection} Drums`);
  track.setTempo(bpm);

  const addDrumEvents = (steps: number[], pitch: string, isDoubleTime: boolean) => {
    const totalSteps = isDoubleTime ? 32 : 16;
    const stepDuration = isDoubleTime ? '32' : '16';
    
    let currentWait = 0;
    
    for (let i = 1; i <= totalSteps; i++) {
      if (steps.includes(i)) {
        const velocity = useVelocityHumanization ? Math.floor(60 + (Math.sin(i * 12.5) * 20 + 20)) : 100;
        const waitStr = currentWait > 0 ? `T${currentWait * (isDoubleTime ? 16 : 32)}` : '0';
        track.addEvent(new MidiWriter.NoteEvent({ pitch: [pitch], duration: stepDuration, wait: waitStr, velocity }));
        currentWait = 0;
      } else {
        currentWait++;
      }
    }
  };

  // General MIDI Drum Map: Kick = C1 (36), Snare = D1 (38), Hi-Hat = F#1 (42)
  addDrumEvents(currentPattern.kick?.steps || [], 'C1', currentPattern.kick?.isDoubleTime || false);
  addDrumEvents(currentPattern.snare?.steps || [], 'D1', currentPattern.snare?.isDoubleTime || false);
  addDrumEvents(currentPattern.hiHat?.steps || [], 'F#1', currentPattern.hiHat?.isDoubleTime || false);

  const write = new MidiWriter.Writer(track);
  return write.buildFile();
};

export const isMidiCapable = (instrument: string, loopGuide: string): boolean => {
  const text = (instrument + ' ' + loopGuide).toLowerCase();
  const nonMidiKeywords = ['vocal', 'acapella', 'live guitar', 'live bass', 'acoustic guitar', 'sample loop', 'audio loop', 'real guitar', 'real bass'];
  return !nonMidiKeywords.some(keyword => text.includes(keyword));
};

export const generateAudioLoop = async (midiData: Uint8Array, bpm: number): Promise<Blob> => {
  const zip = new JSZip();
  
  // Audio.mid is used inside an audioloop for MIDI data
  zip.file("Audio.mid", midiData);
  
  // Basic AudioLoop.xml metadata with BPM context
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<AudioLoop version="1.1">
  <Audio>
    <File name="Audio.mid"/>
  </Audio>
  <Context>
    <BPM value="${bpm}"/>
  </Context>
</AudioLoop>`;
  
  zip.file("AudioLoop.xml", xmlContent);
  
  return await zip.generateAsync({ 
    type: "blob",
    compression: "STORE",
    mimeType: "application/octet-stream"
  });
};

export const generateMidiTrack = (
  instrument: string,
  loopGuide: string,
  bpm: number,
  bars: PatternLength,
  variation: PatternVariation
): MidiWriter.Track => {
  const track = new MidiWriter.Track();
  track.addTrackName(instrument);
  track.setTempo(bpm);

  const text = (instrument + ' ' + loopGuide).toLowerCase();
  
  let type = 'melody';
  if (text.includes('808') || text.includes('bass')) type = 'bass';
  else if (text.includes('chord') || text.includes('pad') || text.includes('keys') || text.includes('piano')) type = 'chords';
  else if (text.includes('arp')) type = 'arp';
  else if (text.includes('kick')) type = 'kick';
  else if (text.includes('snare') || text.includes('clap')) type = 'snare';
  else if (text.includes('hat')) type = 'hihat';
  else if (text.includes('drum') || text.includes('perc')) type = 'drums';

  const isFast = text.includes('fast') || text.includes('16th') || text.includes('32nd');
  const isSlow = text.includes('slow') || text.includes('sustained') || text.includes('long');
  const isSyncopated = text.includes('syncopat') || text.includes('bounce') || text.includes('groove');

  const events: MidiWriter.NoteEvent[] = [];

  const pushNote = (pitch: string | string[], duration: string, wait: string | string[] = '0') => {
    events.push(new MidiWriter.NoteEvent({ pitch: Array.isArray(pitch) ? pitch : [pitch], duration, wait, velocity: 80 + Math.floor(Math.random() * 20) }));
  };

  if (type === 'chords') {
    const chordsA = [['C4', 'E4', 'G4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4']];
    const chordsB = [['D4', 'F4', 'A4'], ['G3', 'B3', 'D4'], ['C4', 'E4', 'G4'], ['A3', 'C4', 'E4']];
    const chords = variation === 'A' ? chordsA : chordsB;
    
    for (let i = 0; i < bars; i++) {
      const chord = chords[i % chords.length];
      if (isFast) {
        pushNote(chord, '4'); pushNote(chord, '4'); pushNote(chord, '4'); pushNote(chord, '4');
      } else if (isSyncopated) {
        pushNote(chord, '4'); pushNote(chord, '8', '8'); pushNote(chord, '4', '4');
      } else {
        pushNote(chord, '1');
      }
    }
  } else if (type === 'bass') {
    const rootNotesA = ['C2', 'A1', 'F1', 'G1'];
    const rootNotesB = ['D2', 'G1', 'C2', 'A1'];
    const notes = variation === 'A' ? rootNotesA : rootNotesB;
    
    for (let i = 0; i < bars; i++) {
      const note = notes[i % notes.length];
      if (isSyncopated) {
        pushNote(note, '8'); pushNote(note, '8', '8'); pushNote(note, '4', '8'); pushNote(note, '8', '8');
      } else if (isFast) {
        for(let j=0; j<8; j++) pushNote(note, '8');
      } else {
        pushNote(note, '1');
      }
    }
  } else if (type === 'arp') {
    const scale = ['C4', 'E4', 'G4', 'C5'];
    for (let i = 0; i < bars * 4; i++) {
      if (isFast) {
        pushNote(scale[0], '16'); pushNote(scale[1], '16'); pushNote(scale[2], '16'); pushNote(scale[3], '16');
      } else {
        pushNote(scale[0], '8'); pushNote(scale[1], '8');
      }
    }
  } else if (type === 'hihat') {
    for (let i = 0; i < bars * 4; i++) {
      if (isFast || variation === 'B') {
        pushNote('F#3', '16'); pushNote('F#3', '16'); pushNote('F#3', '16'); pushNote('F#3', '16');
      } else {
        pushNote('F#3', '8'); pushNote('F#3', '8');
      }
    }
  } else if (type === 'kick') {
    for (let i = 0; i < bars; i++) {
      if (variation === 'A') {
        pushNote('C1', '4'); pushNote('C1', '8', '8'); pushNote('C1', '4', '4');
      } else {
        pushNote('C1', '4'); pushNote('C1', '4', '4'); pushNote('C1', '4');
      }
    }
  } else if (type === 'snare') {
    for (let i = 0; i < bars; i++) {
      pushNote('D1', '4', '4'); pushNote('D1', '4', '4');
    }
  } else {
    // Melody
    const scale = variation === 'A' ? ['C4', 'D4', 'E4', 'G4'] : ['A4', 'G4', 'E4', 'C4'];
    for (let i = 0; i < bars; i++) {
      if (isFast) {
        pushNote(scale[0], '8'); pushNote(scale[1], '8'); pushNote(scale[2], '8'); pushNote(scale[3], '8');
        pushNote(scale[3], '8'); pushNote(scale[2], '8'); pushNote(scale[1], '8'); pushNote(scale[0], '8');
      } else if (isSyncopated) {
        pushNote(scale[0], '8'); pushNote(scale[1], '8', '8'); pushNote(scale[2], '4', '4');
      } else {
        pushNote(scale[0], '4'); pushNote(scale[1], '4'); pushNote(scale[2], '4'); pushNote(scale[3], '4');
      }
    }
  }

  track.addEvent(events);
  return track;
};
