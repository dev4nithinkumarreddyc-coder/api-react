import { useState, useRef, useEffect, useCallback } from 'react';

export function useAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Set up event listeners first
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isDraggingRef.current) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e) => {
      console.error('Audio error:', audio.error);
      setIsPlaying(false);
    };

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      // Clean up event listeners
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Initialize audio element after event listeners are set up
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const setSong = useCallback((url) => {
    if (audioRef.current) {
      // Reset state for new song
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      
      audioRef.current.src = url;
      audioRef.current.load();
    }
  }, []);

  const seekTo = useCallback((time) => {
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = time;
      if (!isDraggingRef.current) {
        setCurrentTime(time);
      }
    }
  }, []);

  const setIsDragging = useCallback((isDragging) => {
    isDraggingRef.current = isDragging;
  }, []);

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    setSong,
    seekTo,
    setIsDragging
  };
}
