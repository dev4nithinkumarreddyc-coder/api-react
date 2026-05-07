import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Playlist from './pages/Playlist';
import Player from './components/Player';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      {isAuthenticated() && <Navbar />}
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/playlists" element={
            <ProtectedRoute>
              <Playlist />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      {isAuthenticated() && <Player />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
