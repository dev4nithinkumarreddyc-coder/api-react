import React, { useState, useRef, useEffect } from 'react';
import './Player.css';
import { usePlayer } from '../context/PlayerContext';

function Player() {
  const { 
    currentSong, 
    audioRef, 
    isPlaying, 
    currentTime, 
    duration, 
    togglePlay, 
    previousSong, 
    nextSong, 
    seekTo,
    songs,
    setIsDragging
  } = usePlayer();
  
  const [volume, setVolume] = useState(70);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const volumeControlRef = useRef(null);
  const progressBarRef = useRef(null);

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // Handle volume drag start
  const handleVolumeMouseDown = (e) => {
    setIsDraggingVolume(true);
    e.preventDefault();
  };

  
  // Toggle volume slider visibility
  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingVolume && volumeControlRef.current) {
        const slider = volumeControlRef.current.querySelector('input');
        if (slider) {
          const rect = slider.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
          const newVolume = Math.round(percentage);
          setVolume(newVolume);
          if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
          }
        }
      }
      
      // Use the new simple drag handler
      handleProgressDrag(e);
    };

    const handleMouseUp = () => {
      // Stop dragging but let audio continue from new position
      setIsDraggingVolume(false);
      setIsDraggingProgress(false);
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingVolume, isDraggingProgress, volume, duration, setIsDragging]);

  // Close volume slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (volumeControlRef.current && !volumeControlRef.current.contains(event.target)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format time
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Simple progress bar click handler
  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration || isNaN(duration)) {
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    
    // Direct seek
    audioRef.current.currentTime = newTime;
  };

  // Simple progress bar drag handler
  const handleProgressDrag = (e) => {
    if (!isDraggingProgress || !audioRef.current || !duration || isNaN(duration)) {
      return;
    }
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const dragX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, dragX / rect.width));
    const newTime = percentage * duration;
    
    // Direct seek during drag
    audioRef.current.currentTime = newTime;
  };

  // Mouse down handler
  const handleProgressMouseDown = (e) => {
    setIsDraggingProgress(true);
    setIsDragging(true);
    handleProgressClick(e);
    e.preventDefault();
  };

  const progress = duration && !isNaN(duration) && isFinite(duration) ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player">
      {/* Audio element is created in useAudio hook, this is just a ref */}
      <audio 
        ref={audioRef} 
        style={{ display: 'none' }}
      />
      
      {/* LEFT SECTION - Song Info */}
      <div className="player-left">
        <div className="song-thumbnail">
          {currentSong ? (
            <img 
              src={`https://picsum.photos/seed/${currentSong.id}/56/56.jpg`} 
              alt={`${currentSong.title} thumbnail`}
            />
          ) : (
            <div className="no-thumbnail"></div>
          )}
        </div>
        <div className="song-details">
          <div className="song-title">
            {currentSong ? currentSong.title : 'No song selected'}
          </div>
          <div className="song-artist">
            {currentSong ? currentSong.artist : ''}
          </div>
        </div>
      </div>

      {/* CENTER SECTION - Playback Controls */}
      <div className="player-center">
        <div className="player-controls">
          <button className="control-btn skip-btn player-control-btn" onClick={previousSong} disabled={!songs.length}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 5l-5 5 5-5z"/>
            </svg>
          </button>
          <button className={`control-btn play-pause-btn player-control-btn ${isPlaying ? 'playing' : ''}`} onClick={togglePlay} disabled={!currentSong}>
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="3" height="12" rx="0.5"/>
                <rect x="11" y="4" width="3" height="12" rx="0.5"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4l8 6-8 6z"/>
              </svg>
            )}
          </button>
          <button className="control-btn skip-btn player-control-btn" onClick={nextSong} disabled={!songs.length}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 5l5 5 5-5z"/>
            </svg>
          </button>
        </div>
        <div className="player-progress">
          <span className="time">{formatTime(currentTime)}</span>
          <div 
            className={`progress-bar-container ${isDraggingProgress ? 'dragging' : ''}`}
            ref={progressBarRef}
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
          >
            <div className="progress-bar progress-animated" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT SECTION - Volume & Icons */}
      <div className="player-right">
        <button className="control-btn icon-btn" title="Add to playlist">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12a1 1 0 0 0 1-1V5a1 1 0 1 0-2 0v6a1 1 0 0 0 1 1z"/>
          </svg>
        </button>
        <button className="control-btn icon-btn" title="More options">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11a.5.5 0 0 0-.5.5zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11a.5.5 0 0 0-.5.5zm0 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11a.5.5 0 0 0-.5.5z"/>
          </svg>
        </button>
        <div className="volume-control" ref={volumeControlRef}>
          <button 
            className="control-btn icon-btn volume-btn" 
            onClick={toggleVolumeSlider}
            title="Volume"
          >
            {volume === 0 ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
              </svg>
            ) : volume < 50 ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8.707 11.182A4.476 4.476 0 0 0 10.025 8a4.476 4.476 0 0 0-1.318-3.182l-.707.707A3.485 3.485 0 0 1 9.025 8a3.485 3.485 0 0 1-1.025 2.475l.707.707z"/>
                <path d="M6.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
                <path d="M8.707 11.182A4.476 4.476 0 0 0 10.025 8a4.476 4.476 0 0 0-1.318-3.182l-.707.707A3.485 3.485 0 0 1 9.025 8a3.485 3.485 0 0 1-1.025 2.475l.707.707z"/>
                <path d="M6.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
            )}
          </button>
          <div 
            className={`volume-slider ${showVolumeSlider ? 'show' : ''}`}
            style={{ '--volume-percent': `${volume}%` }}
          >
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume}
              onChange={handleVolumeChange}
              onMouseDown={handleVolumeMouseDown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Player;
