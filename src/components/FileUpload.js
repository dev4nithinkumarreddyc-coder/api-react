import React, { useState } from 'react';
import './FileUpload.css';

function FileUpload({ onSongsUpload, showSelectedCount = true }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    const songs = await Promise.all(files.map(async (file, index) => {
      const song = {
        id: Date.now() + index,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        artist: 'Unknown Artist',
        url: URL.createObjectURL(file),
        thumbnail: null
      };

      // Try to extract metadata from audio file
      await extractMetadata(file, song);
      return song;
    }));

    onSongsUpload(songs);
  };

  const extractMetadata = (file, song) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(audio.src);
        resolve(); // Resolve with no thumbnail if timeout
      }, 2000); // 2 second timeout

      audio.addEventListener('loadedmetadata', () => {
        clearTimeout(timeout);
        // Try to get metadata if available (limited browser support)
        // Note: Most browsers don't expose embedded artwork via standard APIs
        // This is a placeholder for future implementation with metadata libraries
        URL.revokeObjectURL(audio.src);
        resolve();
      });

      audio.addEventListener('error', () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(audio.src);
        resolve(); // Fallback to default icon if metadata extraction fails
      });
    });
  };

  return (
    <div className="file-upload">
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
      {showSelectedCount && selectedFiles.length > 0 && (
        <div className="selected-files">
          <p className="file-count">{selectedFiles.length} song(s) selected</p>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
