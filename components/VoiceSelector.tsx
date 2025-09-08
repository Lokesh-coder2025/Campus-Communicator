import React from 'react';
import { VoiceOption } from '../types';
import { Icon } from './Icon';

interface VoiceSelectorProps {
  voices: VoiceOption[];
  selectedVoice: SpeechSynthesisVoice | null;
  onSelectVoice: (voice: SpeechSynthesisVoice) => void;
  onPreviewVoice: (voice: SpeechSynthesisVoice) => void;
  speaking: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoice,
  onSelectVoice,
  onPreviewVoice,
  speaking,
}) => {
  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceName = event.target.value;
    const voiceOption = voices.find(v => v.voice.name === voiceName);
    if (voiceOption) {
      onSelectVoice(voiceOption.voice);
    }
  };

  const handlePreview = () => {
    if (selectedVoice) {
      onPreviewVoice(selectedVoice);
    }
  };

  return (
    <div className="p-4 bg-white/20 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-slate-800/90">Voice Selection</h3>
      <div className="flex items-center gap-4">
        <select
          value={selectedVoice?.name || ''}
          onChange={handleVoiceChange}
          disabled={speaking || voices.length === 0}
          className="w-full bg-transparent border-2 border-slate-400 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {voices.length === 0 ? (
            <option>Loading voices...</option>
          ) : (
            voices.map(({ voice, name, gender }) => (
              <option key={name} value={name} className="bg-white text-slate-800">
                {name} ({gender})
              </option>
            ))
          )}
        </select>
        <button
          onClick={handlePreview}
          disabled={speaking || !selectedVoice}
          className="flex items-center gap-2 font-semibold py-2 px-4 rounded-lg bg-white/30 hover:bg-white/50 text-slate-800 shadow-sm ring-1 ring-slate-900/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon type="play" className="w-5 h-5" />
          <span>Preview</span>
        </button>
      </div>
    </div>
  );
};