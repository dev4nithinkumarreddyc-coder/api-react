import React, { useState } from 'react';
import SongCard from '../components/SongCard';
import SongSkeleton from '../components/SongSkeleton';
import MusicScanner from '../components/MusicScanner';
import { usePlayer } from '../context/PlayerContext';
import './Home.css';

function Home() {
  const { songs, loading, error, currentSong, addSongs, clearSongs } = usePlayer();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  const handleSongsUpload = (newSongs) => {
    addSongs(newSongs);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    const songs = files.map((file, index) => ({
      id: Date.now() + index,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Unknown Artist',
      url: URL.createObjectURL(file),
      thumbnail: null
    }));

    addSongs(songs);
  };

  const handleClearSongs = () => {
    if (window.confirm('Are you sure you want to clear all songs?')) {
      clearSongs();
      setSelectedFiles([]);
      localStorage.removeItem('uploadedSongs');
    }
  };

  if (loading) {
    return (
      <div className="home">
        <div className="song-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <SongSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="home fade-in">
      <h1 className="fade-in-delay">Music Library</h1>
      
      <div className="home-tabs">
        <button className={`tab ${!showScanner ? 'active' : ''}`} onClick={() => setShowScanner(false)}>
          Library ({songs.length})
        </button>
        <button className={`tab ${showScanner ? 'active' : ''}`} onClick={() => setShowScanner(true)}>
          Scanner
        </button>
      </div>

      {!showScanner && (
        <>
          <div className="home-actions">
            <label htmlFor="file-upload" className="file-upload-label">
              <span className="upload-icon">📁</span>
              <span className="upload-text">Upload Songs</span>
              <input
                id="file-upload"
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileChange}
                className="file-upload-input"
              />
            </label>
            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <p className="file-count">{selectedFiles.length} song(s) selected</p>
              </div>
            )}
            {songs.length > 0 && (
              <button className="clear-songs-btn" onClick={handleClearSongs}>
                Clear All Songs
              </button>
            )}
          </div>
          <div className="song-grid stagger-fade-in">
            {songs.map((song, index) => (
              <SongCard 
                key={song.id} 
                song={song} 
                index={index}
                isActive={currentSong?.id === song.id}
              />
            ))}
          </div>
        </>
      )}

      {showScanner && <MusicScanner />}
    </div>
  );
}

export default Home;
