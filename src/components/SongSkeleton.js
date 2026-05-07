import React from 'react';
import './SongSkeleton.css';

function SongSkeleton() {
  return (
    <div className="song-skeleton">
      <div className="skeleton-art">
        <div className="skeleton-image"></div>
      </div>
      <div className="skeleton-info">
        <div className="skeleton-title"></div>
        <div className="skeleton-artist"></div>
      </div>
    </div>
  );
}

export default SongSkeleton;
