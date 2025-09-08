import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { humanizeTextWithAI } from './services/geminiService';
import { VoiceSelector } from './components/VoiceSelector';
import { Icon } from './components/Icon';
import { saveAnnouncementSettings, loadAnnouncementSettings, hasSavedSettings, saveToHistory, loadHistory, AnnouncementHistoryEntry } from './services/storageService';

const App: React.FC = () => {
  const [text, setText] = useState<string>('Hello students and staff, this is a test announcement. Please disregard.');
  const [isLoading, setIsLoading] = useState(false);
  
  const [savedSettingsExist, setSavedSettingsExist] = useState(false);
  const initialLoadRef = useRef(false);
  
  const [history, setHistory] = useState<AnnouncementHistoryEntry[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const { voices, selectedVoice, setSelectedVoice, speak, cancel, speaking, volume, setVolume, rate, setRate, pitch, setPitch, previewVoice } = useSpeechSynthesis();

  // Load initial data on mount
  useEffect(() => {
    setSavedSettingsExist(hasSavedSettings());
    setHistory(loadHistory());
  }, []);
  
  // Effect to load settings once voices are populated
  useEffect(() => {
    if (voices.length > 0 && !initialLoadRef.current) {
        const settings = loadAnnouncementSettings();
        if (settings) {
            setText(settings.text);
            setVolume(settings.volume);
            setRate(settings.rate ?? 1.0);
            setPitch(settings.pitch ?? 1.0);
            const voiceToSelect = voices.find(v => v.voice.name === settings.voiceName);
            if (voiceToSelect) {
                setSelectedVoice(voiceToSelect.voice);
            }
        }
        initialLoadRef.current = true; // Mark that initial load has been attempted
    }
  }, [voices, setSelectedVoice, setVolume, setRate, setPitch]);


  const handleImproveText = async () => {
    setIsLoading(true);
    try {
      const humanizedText = await humanizeTextWithAI(text);
      setText(humanizedText);
    } catch (error) {
      console.error("Failed to humanize text:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    saveAnnouncementSettings({
        text,
        volume,
        rate,
        pitch,
        voiceName: selectedVoice?.name ?? null,
    });
    setSavedSettingsExist(true);
  };

  const handleLoad = () => {
      const settings = loadAnnouncementSettings();
      if (settings && voices.length > 0) {
          setText(settings.text);
          setVolume(settings.volume);
          setRate(settings.rate ?? 1.0);
          setPitch(settings.pitch ?? 1.0);
          const voiceToSelect = voices.find(v => v.voice.name === settings.voiceName);
          if (voiceToSelect) {
              setSelectedVoice(voiceToSelect.voice);
          }
      }
  };

  const handleAnnounce = () => {
      if (!text.trim()) return;
      const currentSettings = { text, volume, rate, pitch, voiceName: selectedVoice?.name ?? null };
      saveToHistory(currentSettings);
      setHistory(loadHistory());
      speak(text);
  };
  
  const handleLoadFromHistory = (item: AnnouncementHistoryEntry) => {
      setText(item.text);
      setVolume(item.volume);
      setRate(item.rate);
      setPitch(item.pitch);
      const voiceToSelect = voices.find(v => v.voice.name === item.voiceName);
      if (voiceToSelect) {
          setSelectedVoice(voiceToSelect.voice);
      }
      setIsHistoryVisible(false);
  };

  const buttonBaseStyles = "flex items-center justify-center gap-2 font-semibold rounded-lg shadow-sm ring-1 ring-slate-900/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const secondaryButtonStyles = `${buttonBaseStyles} px-4 py-2 text-sm bg-white/30 hover:bg-white/50 text-slate-800`;
  const primaryButtonStyles = `${buttonBaseStyles} px-8 py-3 text-lg`;


  return (
    <>
      <div className="bg-gradient-to-t from-[#fbc2eb] to-[#a6c1ee] min-h-screen flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="w-full max-w-4xl bg-white/50 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30 space-y-8">
          <header className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Campus Communicator</h1>
            <p className="text-slate-600 mt-2">Craft, improve, and deliver announcements with AI assistance.</p>
          </header>

          <main className="space-y-6">
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your announcement here..."
                className="w-full h-40 bg-white/40 p-4 rounded-lg border-2 border-transparent focus:border-blue-400 focus:ring-blue-400 focus:outline-none transition-all duration-300 resize-none text-lg text-slate-900"
                disabled={speaking || isLoading}
              />
              <button
                onClick={handleImproveText}
                disabled={isLoading || speaking}
                className={`${secondaryButtonStyles} absolute bottom-3 right-3`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-500/50 border-t-slate-600 rounded-full animate-spin"></div>
                    <span>Humanizing...</span>
                  </>
                ) : (
                  <>
                    <Icon type="magic" className="w-5 h-5"/>
                    <span>Humanize Text</span>
                  </>
                )}
              </button>
            </div>
            
            <VoiceSelector 
              voices={voices}
              selectedVoice={selectedVoice}
              onSelectVoice={(voice) => setSelectedVoice(voice)}
              onPreviewVoice={previewVoice}
              speaking={speaking}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-slate-800/90 flex items-center gap-2">
                    <Icon type="volume" className="w-5 h-5" />
                    Volume
                </h3>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-pink-500 disabled:opacity-50"
                        disabled={speaking}
                    />
                    <span className="font-bold text-lg w-16 text-center bg-white/20 py-1 rounded-md">
                        {Math.round(volume * 100)}%
                    </span>
                </div>
              </div>

              <div className="p-4 bg-white/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-slate-800/90 flex items-center gap-2">
                    <Icon type="rate" className="w-5 h-5" />
                    Speech Rate
                </h3>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-pink-500 disabled:opacity-50"
                        disabled={speaking}
                    />
                    <span className="font-bold text-lg w-16 text-center bg-white/20 py-1 rounded-md">
                        {rate.toFixed(1)}x
                    </span>
                </div>
              </div>

              <div className="p-4 bg-white/20 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-slate-800/90 flex items-center gap-2">
                    <Icon type="pitch" className="w-5 h-5" />
                    Pitch
                </h3>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={pitch}
                        onChange={(e) => setPitch(parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-pink-500 disabled:opacity-50"
                        disabled={speaking}
                    />
                    <span className="font-bold text-lg w-16 text-center bg-white/20 py-1 rounded-md">
                        {pitch.toFixed(1)}
                    </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/20 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className='text-center sm:text-left'>
                    <h3 className="text-lg font-semibold text-slate-800/90">Announcement Storage</h3>
                    <p className="text-sm text-slate-600">Save your current draft or view announcement history.</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={() => setIsHistoryVisible(true)}
                        className={secondaryButtonStyles}
                    >
                        <Icon type="history" className="w-5 h-5" />
                        <span>History</span>
                    </button>
                    <button
                        onClick={handleSave}
                        className={secondaryButtonStyles}
                    >
                        <Icon type="save" className="w-5 h-5" />
                        <span>Save</span>
                    </button>
                    <button
                        onClick={handleLoad}
                        disabled={!savedSettingsExist}
                        className={secondaryButtonStyles}
                    >
                        <Icon type="load" className="w-5 h-5" />
                        <span>Load</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={handleAnnounce}
                disabled={speaking || !text.trim()}
                className={`${primaryButtonStyles} bg-blue-500/80 hover:bg-blue-500 text-white w-full sm:w-auto`}
              >
                <Icon type="play" className="w-7 h-7"/>
                <span>Announce</span>
              </button>
              <button
                onClick={cancel}
                disabled={!speaking}
                className={`${primaryButtonStyles} bg-pink-500/80 hover:bg-pink-500 text-white w-full sm:w-auto`}
              >
                <Icon type="stop" className="w-7 h-7"/>
                <span>Stop</span>
              </button>
            </div>
          </main>
        </div>
      </div>
      
      {isHistoryVisible && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                <header className="p-4 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Icon type="history" className="w-6 h-6" />
                        Announcement History
                    </h2>
                    <button 
                      onClick={() => setIsHistoryVisible(false)}
                      className="text-slate-600 hover:text-slate-900 transition-colors p-1 rounded-full hover:bg-slate-200/50"
                      aria-label="Close history"
                    >
                      <Icon type="close" className="w-7 h-7"/>
                    </button>
                </header>
                <div className="p-4 overflow-y-auto">
                    {history.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Your announcement history is empty.</p>
                    ) : (
                        <ul className="space-y-4">
                            {history.map(item => (
                                <li key={item.id} className="bg-slate-100/70 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-slate-800/90 truncate font-medium" title={item.text}>
                                        {item.text}
                                      </p>
                                      <p className="text-xs text-slate-500 mt-1">
                                        {new Date(item.timestamp).toLocaleString()} &bull; {item.voiceName}
                                      </p>
                                    </div>
                                    <button 
                                      onClick={() => handleLoadFromHistory(item)}
                                      className={`${secondaryButtonStyles} flex-shrink-0`}
                                    >
                                      <Icon type="load" className="w-5 h-5" />
                                      <span>Load</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default App;
