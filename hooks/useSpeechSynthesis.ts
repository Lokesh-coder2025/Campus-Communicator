import { useState, useEffect, useCallback } from 'react';
import { VoiceOption } from '../types';

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [volume, setVolume] = useState(1); // Volume state from 0 to 1
  const [rate, setRate] = useState(1); // Speech rate from 0.5 to 2
  const [pitch, setPitch] = useState(1); // Speech pitch from 0 to 2

  const populateVoiceList = useCallback(() => {
    const allVoices = window.speechSynthesis.getVoices();
    if (allVoices.length === 0) return;

    const femaleVoices: VoiceOption[] = [];
    const maleVoices: VoiceOption[] = [];
    const addedVoices = new Set<string>();

    // A curated list of high-quality, professional voices often found in modern systems.
    // The names are lowercase for case-insensitive matching.
    const PREFERRED_FEMALE_VOICES = [
        'google uk english female',
        'google us english',
        'samantha', // Common on Apple devices
        'zira',     // Common on Windows devices
        'tessa',    // High-quality voice
    ];

    const PREFERRED_MALE_VOICES = [
        'google uk english male',
        'daniel',   // Common on Apple devices
        'david',    // Common on Windows devices
        'alex',     // High-quality Apple voice
    ];

    allVoices.forEach(voice => {
        if (voice.lang.startsWith('en') && !addedVoices.has(voice.name)) {
            const nameLower = voice.name.toLowerCase();

            // Check against the curated list of high-quality female voices
            if (PREFERRED_FEMALE_VOICES.some(preferred => nameLower.includes(preferred))) {
                femaleVoices.push({ voice, name: voice.name, gender: 'female' });
                addedVoices.add(voice.name);
            }
            // Check against the curated list of high-quality male voices
            else if (PREFERRED_MALE_VOICES.some(preferred => nameLower.includes(preferred))) {
                maleVoices.push({ voice, name: voice.name, gender: 'male' });
                addedVoices.add(voice.name);
            }
        }
    });

    const curatedVoices = [...femaleVoices, ...maleVoices];
    setVoices(curatedVoices);
    if (curatedVoices.length > 0) {
      setSelectedVoice(curatedVoices[0].voice);
    } else {
      // If no preferred voices are found, select the first available English voice as a fallback
      const fallbackVoice = allVoices.find(v => v.lang.startsWith('en'));
      if (fallbackVoice) {
          setVoices([{ voice: fallbackVoice, name: fallbackVoice.name, gender: 'female' }]);
          setSelectedVoice(fallbackVoice);
      }
    }
  }, []);

  useEffect(() => {
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, [populateVoiceList]);

  const cancel = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speak = useCallback((text: string) => {
    if (!text || !selectedVoice) return;
    
    cancel(); // Cancel any previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [selectedVoice, volume, rate, pitch]);

  const previewVoice = useCallback((voice: SpeechSynthesisVoice) => {
    if (!voice) return;
    cancel(); // Stop any currently speaking utterance

    const sampleText = 'Hello, this is a voice preview.';
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.voice = voice;
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [volume, rate, pitch]);

  return { voices, selectedVoice, setSelectedVoice, speak, cancel, speaking, volume, setVolume, rate, setRate, pitch, setPitch, previewVoice };
};
