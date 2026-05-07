const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Enable CORS with specific options
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Mock user database
let users = [];

// Mock playlist database
let playlists = [];

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Mock song data
const songs = [
  {
    id: 1,
    title: "Sample Song 1",
    artist: "Artist 1",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Sample Song 2",
    artist: "Artist 2",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Sample Song 3",
    artist: "Artist 3",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 4,
    title: "Sample Song 4",
    artist: "Artist 4",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: 5,
    title: "Sample Song 5",
    artist: "Artist 5",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  }
];

// POST /register endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, username: newUser.username }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /songs endpoint (protected)
app.get('/songs', authenticateToken, (req, res) => {
  res.json(songs);
});

// GET /playlists endpoint (protected)
app.get('/playlists', authenticateToken, (req, res) => {
  const userPlaylists = playlists.filter(playlist => playlist.userId === req.user.id);
  res.json(userPlaylists);
});

// POST /playlists endpoint (protected)
app.post('/playlists', authenticateToken, (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const newPlaylist = {
      id: playlists.length + 1,
      name,
      userId: req.user.id,
      songs: [],
      createdAt: new Date().toISOString()
    };

    playlists.push(newPlaylist);

    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// PUT /playlists/:id/songs endpoint (protected)
app.put('/playlists/:id/songs', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;

    const playlist = playlists.find(p => p.id == id && p.userId == req.user.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const song = songs.find(s => s.id == songId);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    if (!playlist.songs.find(s => s.id == songId)) {
      playlist.songs.push(song);
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add song to playlist' });
  }
});

// DELETE /playlists/:id/songs/:songId endpoint (protected)
app.delete('/playlists/:id/songs/:songId', authenticateToken, (req, res) => {
  try {
    const { id, songId } = req.params;

    const playlist = playlists.find(p => p.id == id && p.userId == req.user.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    playlist.songs = playlist.songs.filter(song => song.id != songId);

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove song from playlist' });
  }
});

// DELETE /playlists/:id endpoint (protected)
app.delete('/playlists/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const playlistIndex = playlists.findIndex(p => p.id == id && p.userId == req.user.id);
    if (playlistIndex === -1) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    playlists.splice(playlistIndex, 1);

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
