import React from 'react';
import './SongList.css';
import { usePlayer } from '../context/PlayerContext';

function SongList() {
  const { songs, loading, error, playSong } = usePlayer();

  if (loading) {
    return (
      <div className="song-list">
        <h2>Song List</h2>
        <div className="loading">Loading songs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="song-list">
        <h2>Song List</h2>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="song-list">
      <h2>Song List</h2>
      <ul>
        {songs.map((song, index) => (
          <li key={song.id} className="song-item">
            <div className="song-info">
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
            </div>
            <button className="play-button" onClick={() => playSong(song, index)}>
              Play
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SongList;
