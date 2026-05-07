const API_BASE_URL = 'http://localhost:5000';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const fetchSongs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/songs`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch songs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching songs:', error);
    throw error;
  }
};

export const fetchSongById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/songs/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch song');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching song:', error);
    throw error;
  }
};

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const register = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    return data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

export const fetchPlaylists = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }
};

export const createPlaylist = async (name) => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create playlist');
    }
    return data;
  } catch (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }
};

export const addSongToPlaylist = async (playlistId, songId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/songs`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ songId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to add song to playlist');
    }
    return data;
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    throw error;
  }
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}/songs/${songId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to remove song from playlist');
    }
    return data;
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    throw error;
  }
};

export const deletePlaylist = async (playlistId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete playlist');
    }
    return data;
  } catch (error) {
    console.error('Error deleting playlist:', error);
    throw error;
  }
};
