import React, { useState, useRef, useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';
import * as musicMetadata from 'music-metadata';
import './MusicScanner.css';

function MusicScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedFiles, setScannedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const { addSongs, songs } = usePlayer();
  const fileInputRef = useRef(null);

  // Check for saved directory handle on mount
  React.useEffect(() => {
    const savedDirectoryHandle = localStorage.getItem('musicDirectoryHandle');
    if (savedDirectoryHandle) {
      setHasPermission(true);
    }
  }, []);

  const extractMetadata = async (file) => {
    try {
      const metadata = await musicMetadata.parseBlob(file);
      let thumbnail = null;
      
      // Extract cover art if available
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const blob = new Blob([picture.data], { type: picture.format });
        thumbnail = URL.createObjectURL(blob);
      }
      
      return {
        title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: metadata.common.artist || 'Unknown Artist',
        album: metadata.common.album || 'Unknown Album',
        duration: Math.floor(metadata.format.duration || 0),
        thumbnail: thumbnail
      };
    } catch (error) {
      console.error('Error extracting metadata:', error);
      return {
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: 0,
        thumbnail: null
      };
    }
  };

  const processFile = async (file, existingSongs) => {
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    
    // Check for duplicates by comparing file name and size
    const isDuplicate = existingSongs.some(song => 
      song.title === fileName && song.fileSize === file.size
    );

    if (isDuplicate) {
      return null;
    }

    const metadata = await extractMetadata(file);
    const song = {
      id: Date.now() + Math.random(),
      title: metadata.title,
      artist: metadata.artist,
      album: metadata.album,
      duration: metadata.duration,
      thumbnail: metadata.thumbnail,
      url: URL.createObjectURL(file),
      fileSize: file.size,
      fileName: fileName
    };

    return song;
  };

  const scanDirectory = async (directoryHandle, existingSongs) => {
    const songs = [];
    const mp3Files = [];

    // Recursively scan for MP3 files
    const scanRecursive = async (dirHandle, path = '') => {
      try {
        for await (const entry of dirHandle.values()) {
          const currentPath = path ? `${path}/${entry.name}` : entry.name;
          
          if (entry.kind === 'file') {
            if (entry.name.toLowerCase().endsWith('.mp3')) {
              mp3Files.push({ handle: entry, path: currentPath });
              setTotalFiles(prev => prev + 1);
            }
          } else if (entry.kind === 'directory') {
            await scanRecursive(entry, currentPath);
          }
        }
      } catch (error) {
        console.error('Error scanning directory:', error);
        // Continue scanning other directories
      }
    };

    await scanRecursive(directoryHandle);

    // Process files with progress tracking
    for (let i = 0; i < mp3Files.length; i++) {
      try {
        const fileHandle = mp3Files[i];
        const file = await fileHandle.handle.getFile();
        setScannedFiles(i + 1);
        setScanProgress(Math.round(((i + 1) / mp3Files.length) * 100));

        const song = await processFile(file, existingSongs);
        if (song) {
          songs.push(song);
        }

        // Allow UI to update every 5 files
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      } catch (error) {
        console.error('Error processing file:', error);
        // Continue with next file
      }
    }

    return songs;
  };

  const requestDirectoryAccess = async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await window.showDirectoryPicker({
          mode: 'read',
          startIn: 'music'
        });

        // Save directory handle for future use
        localStorage.setItem('musicDirectoryHandle', 'granted');
        setHasPermission(true);

        return directoryHandle;
      } else {
        throw new Error('File System Access API not supported in this browser');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Directory selection cancelled');
      }
      throw error;
    }
  };

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setError('');
      setScanProgress(0);
      setScannedFiles(0);
      setTotalFiles(0);

      const directoryHandle = await requestDirectoryAccess();
      const newSongs = await scanDirectory(directoryHandle, songs);
      
      if (newSongs.length > 0) {
        addSongs(newSongs);
        localStorage.setItem('musicDirectoryHandle', 'granted');
      }

    } catch (error) {
      setError(error.message || 'Failed to scan music directory');
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRescan = async () => {
    if (!hasPermission) {
      await handleScan();
      return;
    }

    try {
      setIsScanning(true);
      setError('');
      setScanProgress(0);
      setScannedFiles(0);

      if ('showDirectoryPicker' in window) {
        const directoryHandle = await window.showDirectoryPicker({
          mode: 'read'
        });

        const newSongs = await scanDirectory(directoryHandle, songs);
        
        if (newSongs.length > 0) {
          addSongs(newSongs);
        }
      }
    } catch (error) {
      setError(error.message || 'Failed to rescan music directory');
      console.error('Rescan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleClearPermission = () => {
    localStorage.removeItem('musicDirectoryHandle');
    setHasPermission(false);
  };

  return (
    <div className="music-scanner">
      <h2>Music Scanner</h2>
      
      {error && (
        <div className="scanner-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="scanner-actions">
        {!hasPermission ? (
          <button 
          className="scan-btn primary"
          onClick={handleScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <span className="spinner"></span>
              Scanning...
            </>
          ) : (
            'Scan Music Folder'
          )}
        </button>
        ) : (
          <>
            <button 
              className="scan-btn secondary"
              onClick={handleRescan}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <span className="spinner"></span>
                  Rescanning...
                </>
              ) : (
                'Rescan Music'
              )}
            </button>
            <button 
              className="clear-btn"
              onClick={handleClearPermission}
              disabled={isScanning}
            >
              Clear Permission
            </button>
          </>
        )}
      </div>

      {isScanning && (
        <div className="scan-progress">
          <div className="progress-info">
            <span>Scanning: {scannedFiles} / {totalFiles} files</span>
            <span>{scanProgress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="scanner-info">
        <h3>How it works:</h3>
        <ul>
          <li>Click "Scan Music Folder" to select your music directory</li>
          <li>The app will recursively scan for MP3 files</li>
          <li>Extracts metadata: title, artist, album, duration</li>
          <li>Automatically adds songs to your library</li>
          <li>Permission is saved for future scans</li>
          <li>Use "Rescan" to detect new songs</li>
        </ul>
        
        <div className="browser-support">
          <h4>Browser Support:</h4>
          <p>Works best in Chrome/Edge with File System Access API</p>
          <p>Other browsers may have limited functionality</p>
        </div>
      </div>
    </div>
  );
}

export default MusicScanner;
