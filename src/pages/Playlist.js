import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import './Playlist.css';

function Playlist() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { songs } = usePlayer();

  useEffect(() => {
    // Load playlists from localStorage
    const savedPlaylists = localStorage.getItem('playlists');
    if (savedPlaylists) {
      try {
        const parsedPlaylists = JSON.parse(savedPlaylists);
        setPlaylists(parsedPlaylists);
      } catch (e) {
        console.error('Error loading playlists from localStorage:', e);
      }
    }
    setLoading(false);
  }, []);

  // Save playlists to localStorage whenever they change
  useEffect(() => {
    if (playlists.length > 0) {
      localStorage.setItem('playlists', JSON.stringify(playlists));
    }
  }, [playlists]);

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPlaylist = {
      id: Date.now(),
      name: newPlaylistName.trim(),
      songs: [],
      createdAt: new Date().toISOString()
    };

    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
    setShowCreateForm(false);
    setError('');
  };

  const handleAddSong = (playlistId, songId) => {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        // Check if song already exists in playlist
        if (!p.songs.find(s => s.id === songId)) {
          return { ...p, songs: [...p.songs, song] };
        }
      }
      return p;
    }));
    setError('');
  };

  const handleRemoveSong = (playlistId, songId) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== songId) };
      }
      return p;
    }));
    setError('');
  };

  const handleDeletePlaylist = (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;

    setPlaylists(playlists.filter(p => p.id !== playlistId));
    setError('');
  };

  if (loading) {
    return <div className="playlist">Loading playlists...</div>;
  }

  return (
    <div className="playlist">
      <div className="playlist-header">
        <h1>Your Playlists</h1>
        <button 
          className="create-playlist-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create Playlist'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-playlist-modal">
          <form onSubmit={handleCreatePlaylist}>
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              required
              autoFocus
            />
            <div className="modal-actions">
              <button type="button" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
              <button type="submit" className="primary">
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="playlist-grid">
        {playlists.length === 0 ? (
          <div className="empty-playlists">
            <div className="empty-icon">🎵</div>
            <h2>No playlists yet</h2>
            <p>Create your first playlist to organize your music</p>
          </div>
        ) : (
          playlists.map(playlist => (
            <div key={playlist.id} className="playlist-card">
              <div className="playlist-cover">
                <div className="playlist-cover-image">
                  {playlist.songs.length > 0 ? (
                    <div className="playlist-songs-preview">
                      {playlist.songs.slice(0, 4).map((song, index) => (
                        <div key={song.id} className="mini-song">
                          {song.thumbnail ? (
                            <img src={song.thumbnail} alt={song.title} />
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                  )}
                </div>
                <button 
                  className="play-playlist-btn"
                  onClick={() => {
                    if (playlist.songs.length > 0) {
                      // Play first song in playlist
                      const firstSong = playlist.songs[0];
                      // This would need to be connected to your player context
                    }
                  }}
                  disabled={playlist.songs.length === 0}
                >
                  ▶
                </button>
              </div>
              
              <div className="playlist-info">
                <h3>{playlist.name}</h3>
                <p className="song-count">{playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}</p>
              </div>

              <div className="playlist-actions">
                <button 
                  className="add-songs-btn"
                  onClick={() => {
                    // This would open a modal to add songs
                    const songToAdd = songs[0]; // For demo, add first available song
                    if (songToAdd) {
                      handleAddSong(playlist.id, songToAdd.id);
                    }
                  }}
                  disabled={songs.length === 0}
                >
                  Add Songs
                </button>
                <button 
                  className="delete-playlist-btn"
                  onClick={() => handleDeletePlaylist(playlist.id)}
                >
                  Delete
                </button>
              </div>

              {playlist.songs.length > 0 && (
                <div className="playlist-songs-list">
                  <h4>Songs:</h4>
                  <div className="songs-grid">
                    {playlist.songs.map(song => (
                      <div key={song.id} className="song-item">
                        <div className="song-thumbnail">
                          {song.thumbnail ? (
                            <img src={song.thumbnail} alt={song.title} />
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                            </svg>
                          )}
                        </div>
                        <div className="song-details">
                          <span className="song-title">{song.title}</span>
                          <span className="song-artist">{song.artist}</span>
                        </div>
                        <button 
                          className="remove-song-btn"
                          onClick={() => handleRemoveSong(playlist.id, song.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Playlist;
