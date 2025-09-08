
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface ReminderProps {
  onSetReminder: (minutes: number) => void;
  onClearReminder: () => void;
  activeReminder: boolean;
  timeLeft: number | null;
}

export const Reminder: React.FC<ReminderProps> = ({ onSetReminder, onClearReminder, activeReminder, timeLeft }) => {
  const [minutes, setMinutes] = useState(1);

  const handleSetReminder = () => {
    if (minutes > 0) {
      onSetReminder(minutes);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-white/10 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-white/90 flex items-center gap-2">
        <Icon type="bell" className="w-5 h-5" />
        Set a Reminder
      </h3>
      {activeReminder && timeLeft !== null ? (
        <div className="flex items-center justify-between">
          <p className="text-white">Announcement in: <span className="font-bold text-xl">{formatTime(timeLeft)}</span></p>
          <button 
            onClick={onClearReminder}
            className="flex items-center gap-2 bg-red-500/50 hover:bg-red-500/70 text-white font-semibold py-2 px-4 rounded-full transition-all duration-300"
          >
            <Icon type="close" className="w-5 h-5"/>
            <span>Cancel</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="1"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 1)}
            className="w-24 bg-transparent border-2 border-white/50 rounded-lg p-2 text-center focus:outline-none focus:ring-2 focus:ring-white/80"
          />
          <span className="font-medium">minutes</span>
          <button
            onClick={handleSetReminder}
            className="bg-white/30 hover:bg-white/40 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 flex-grow"
          >
            Set Reminder
          </button>
        </div>
      )}
    </div>
  );
};
