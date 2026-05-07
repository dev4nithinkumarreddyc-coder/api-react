import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import './SongCard.css';

function SongCard({ song, index, isActive }) {
  const { playSong } = usePlayer();

  const handlePlay = () => {
    console.log('=== SONG CARD CLICKED ===');
    console.log('Song title:', song.title);
    console.log('Song URL:', song.url);
    console.log('Song index:', index);
    console.log('Song object:', song);
    
    // Test if URL is valid
    if (song.url) {
      console.log('URL type:', typeof song.url);
      console.log('URL starts with blob:', song.url.startsWith('blob:'));
      console.log('URL length:', song.url.length);
    } else {
      console.error('Song URL is null or undefined!');
    }
    
    playSong(song, index);
  };

  return (
    <div 
      className={`song-card fade-in ${isActive ? 'active' : ''}`}
      onClick={handlePlay}
      style={{ cursor: 'pointer' }}
    >
      <div className="song-card-content">
        <div className="album-art">
          {song.thumbnail ? (
            <img 
              src={song.thumbnail} 
              alt={`${song.title} album art`}
              className="album-image"
            />
          ) : (
            <div className="album-placeholder">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          )}
          <div className="play-overlay">
            <button 
              className="play-button btn-hover"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
              aria-label={`Play ${song.title}`}
            >
              ▶
            </button>
          </div>
        </div>
        <div className="song-info">
          <h3 className="song-title">{song.title}</h3>
          <p className="artist-name">{song.artist}</p>
        </div>
      </div>
    </div>
  );
}

export default SongCard;
