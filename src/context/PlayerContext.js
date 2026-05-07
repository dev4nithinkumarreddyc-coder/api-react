import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAudio } from '../hooks/useAudio';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { audioRef, isPlaying, play, pause, setSong, currentTime, duration, seekTo: audioSeekTo, setIsDragging } = useAudio();

  // Load songs from localStorage on mount
  useEffect(() => {
    const savedSongs = localStorage.getItem('uploadedSongs');
    if (savedSongs) {
      try {
        const parsedSongs = JSON.parse(savedSongs);
        // Filter out songs with invalid blob URLs (they don't persist across reloads)
        const validSongs = parsedSongs.filter(song => song.url && !song.url.startsWith('blob:'));
        setSongs(validSongs);
        
        // If current song was a blob URL, clear it since it won't work after refresh
        if (currentSong && currentSong.url && currentSong.url.startsWith('blob:')) {
          setCurrentSong(null);
          setCurrentIndex(-1);
          pause(); // Stop audio playback
          if (audioRef.current) {
            audioRef.current.src = '';
            audioRef.current.load();
          }
        }
        
        setLoading(false);
      } catch (e) {
        console.error('Error loading songs from localStorage:', e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Don't save songs with blob URLs to localStorage
  useEffect(() => {
    if (songs.length > 0) {
      const songsToSave = songs.filter(song => !song.url.startsWith('blob:'));
      if (songsToSave.length > 0) {
        localStorage.setItem('uploadedSongs', JSON.stringify(songsToSave));
      }
    }
  }, [songs]);

  const playSong = (song, index) => {
    if (!song.url) {
      console.error('No song URL provided!');
      return;
    }
    
    setCurrentSong(song);
    setCurrentIndex(index);
    
    // Use the useAudio hook's setSong function
    setSong(song.url);
    
    // Play using the hook's play function
    play();
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const nextSong = () => {
    if (songs.length === 0) return;
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex], nextIndex);
  };

  const previousSong = () => {
    if (songs.length === 0) return;
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    playSong(songs[prevIndex], prevIndex);
  };

  const addSongs = (newSongs) => {
    setSongs(prevSongs => [...prevSongs, ...newSongs]);
  };

  const clearSongs = () => {
    setSongs([]);
    setCurrentSong(null);
    setCurrentIndex(-1);
    localStorage.removeItem('uploadedSongs');
  };

  const seekTo = (time) => {
    audioSeekTo(time);
  };

  return (
    <PlayerContext.Provider value={{ 
      currentSong, 
      currentIndex, 
      isPlaying, 
      audioRef, 
      currentTime, 
      duration,
      songs,
      loading,
      error,
      playSong, 
      togglePlay,
      nextSong,
      previousSong,
      seekTo,
      setIsDragging,
      addSongs,
      clearSongs
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
