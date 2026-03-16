import React from 'react';
import { Music } from 'lucide-react';
import MidiWriter from 'midi-writer-js';
import { generateMidiTrack, PatternLength, PatternVariation, generateAudioLoop } from '../utils/midiGenerator';
import { AppTheme } from '../types';

interface MidiDraggableButtonProps {
  instrument: string;
  loopGuide: string;
  bpm: number;
  bars: PatternLength;
  variation: PatternVariation;
  recipeTitle: string;
  theme: AppTheme;
  dawType?: string | null;
}

export const MidiDraggableButton: React.FC<MidiDraggableButtonProps> = ({
  instrument,
  loopGuide,
  bpm,
  bars,
  variation,
  recipeTitle,
  theme,
  dawType
}) => {
  const [preparedData, setPreparedData] = React.useState<{ url: string, fileName: string, mimeType: string } | null>(null);

  const prepareMidiData = async () => {
    try {
      const track = generateMidiTrack(instrument, loopGuide, bpm, bars, variation);
      const write = new MidiWriter.Writer(track);
      const midiBytes = write.buildFile();
      
      const isStudioOne = dawType === 'Studio One';
      const extension = isStudioOne ? 'audioloop' : 'mid';
      const fileName = `${recipeTitle.replace(/\s+/g, '_')}_${instrument.replace(/\s+/g, '_')}_${bars}Bar_${variation}_${bpm}BPM.${extension}`;
      
      let downloadUrl: string;
      let mimeType: string;
      
      if (isStudioOne) {
        const blob = await generateAudioLoop(midiBytes, bpm);
        downloadUrl = URL.createObjectURL(blob);
        mimeType = 'application/octet-stream';
      } else {
        const blob = new Blob([midiBytes], { type: 'audio/midi' });
        downloadUrl = URL.createObjectURL(blob);
        mimeType = 'audio/midi';
      }

      setPreparedData({ url: downloadUrl, fileName, mimeType });
    } catch (error) {
      console.error("Failed to prepare MIDI data:", error);
    }
  };

  // Clean up URL on unmount
  React.useEffect(() => {
    return () => {
      if (preparedData) {
        URL.revokeObjectURL(preparedData.url);
      }
    };
  }, [preparedData]);

  const handleDownload = async () => {
    if (!preparedData) {
      await prepareMidiData();
    }
    
    // We need to check again because prepareMidiData is async
    const data = preparedData || await (async () => {
      const track = generateMidiTrack(instrument, loopGuide, bpm, bars, variation);
      const write = new MidiWriter.Writer(track);
      const midiBytes = write.buildFile();
      const isStudioOne = dawType === 'Studio One';
      const extension = isStudioOne ? 'audioloop' : 'mid';
      const fileName = `${recipeTitle.replace(/\s+/g, '_')}_${instrument.replace(/\s+/g, '_')}_${bars}Bar_${variation}_${bpm}BPM.${extension}`;
      const blob = isStudioOne ? await generateAudioLoop(midiBytes, bpm) : new Blob([midiBytes], { type: 'audio/midi' });
      const url = URL.createObjectURL(blob);
      return { url, fileName, mimeType: isStudioOne ? 'application/octet-stream' : 'audio/midi' };
    })();

    const link = document.createElement('a');
    link.href = data.url;
    link.download = data.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (preparedData) {
      // Fix: Don't prepend window.location.origin to blob URLs
      e.dataTransfer.setData('DownloadURL', `${preparedData.mimeType}:${preparedData.fileName}:${preparedData.url}`);
      // Some DAWs also like the file name in plain text
      e.dataTransfer.setData('text/plain', preparedData.fileName);
    }
  };

  return (
    <button
      onClick={handleDownload}
      onMouseEnter={prepareMidiData}
      draggable={!!preparedData}
      onDragStart={handleDragStart}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all hover:scale-105 cursor-grab active:cursor-grabbing text-[10px] font-bold uppercase tracking-widest ${
        theme === 'coldest' ? 'bg-sky-100 text-sky-700 hover:bg-sky-200 border border-sky-200' : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10'
      }`}
      title={`Download or Drag ${bars}-Bar MIDI (Pattern ${variation}) for ${instrument}`}
    >
      <Music className="w-3 h-3" />
      <span>{bars} Bar {variation}</span>
    </button>
  );
};
