import React, { useState } from 'react';
import './Controls.css';
import { usePlayer } from '../context/PlayerContext';

function Controls() {
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    togglePlay, 
    nextSong, 
    previousSong, 
    seekTo,
    setIsDragging
  } = usePlayer();

  const [isDragging, setIsDraggingLocal] = useState(false);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    seekTo(newTime);
  };

  const handleMouseDown = () => {
    setIsDraggingLocal(true);
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDraggingLocal(false);
    setIsDragging(false);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="controls">
      <div className="control-buttons">
        <button className="control-btn" onClick={previousSong}>
          ⏮ Previous
        </button>
        <button className="control-btn play-pause" onClick={togglePlay}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button className="control-btn" onClick={nextSong}>
          ⏭ Next
        </button>
      </div>
      <div className="progress-container">
        <span className="time">{formatTime(currentTime)}</span>
        <input
          type="range"
          className="progress-bar"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          step="0.1"
        />
        <span className="time">{formatTime(duration)}</span>
      </div>
    </div>
  );
}

export default Controls;
