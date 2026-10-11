import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Download, Bookmark, Check } from 'lucide-react';
import { likePhotoApi, trackDownloadApi, getCurrentUser } from '../services/api';

export default function MasonryGrid({ photos, onPhotoClick, onPhotoUpdate }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const navigate = useNavigate();

  const toggleLike = async (e, photo) => {
    e.stopPropagation();
    const user = getCurrentUser();
    if (!user) {
      if (window.confirm('Sign in to like photos and save them to your account. Go to sign in now?')) {
        navigate('/Login');
      }
      return;
    }

    try {
      const res = await likePhotoApi(photo.id);
      if (onPhotoUpdate) {
        onPhotoUpdate({
          id: photo.id,
          isLiked: res.liked,
          likes: res.likes,
        });
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const handleQuickDownload = async (e, photo) => {
    e.stopPropagation();
    setDownloadingId(photo.id);

    try {
      // 1. Record authentic download in database
      const trackRes = await trackDownloadApi(photo.id, 'original');
      if (onPhotoUpdate && trackRes.downloads !== undefined) {
        onPhotoUpdate({
          id: photo.id,
          downloads: trackRes.downloads,
        });
      }

      // 2. Fetch image blob and trigger download
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${photo.title.replace(/\s+/g, '-').toLowerCase()}-hashtag.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      window.open(photo.url, '_blank');
    } finally {
      setTimeout(() => setDownloadingId(null), 1200);
    }
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400 text-lg">No photos found matching your criteria.</p>
        <p className="text-sm text-gray-500 mt-2">Try searching for other keywords or select a different hashtag.</p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      {photos.map((photo) => {
        const isDownloading = downloadingId === photo.id;

        return (
          <div
            key={photo.id}
            onClick={() => onPhotoClick(photo)}
            className="group relative break-inside-avoid rounded-2xl overflow-hidden cursor-zoom-in bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            {/* Image */}
            <img
              src={photo.thumbnail}
              alt={photo.title}
              loading="lazy"
              className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
            />

            {/* Dark Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 flex flex-col justify-between pointer-events-none">
              
              {/* Top Row: Real Like & Save Buttons */}
              <div className="flex justify-end gap-2 pointer-events-auto">
                <button
                  onClick={(e) => toggleLike(e, photo)}
                  title={photo.isLiked ? 'Unlike photo' : 'Like photo'}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full backdrop-blur-md transition-all active:scale-90 shadow-md ${
                    photo.isLiked
                      ? 'bg-red-500 text-white font-bold'
                      : 'bg-white/85 hover:bg-white text-gray-800'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${photo.isLiked ? 'fill-current text-white' : 'text-gray-700'}`} />
                  <span className="text-xs font-bold">{photo.likes || 0}</span>
                </button>

                <button
                  onClick={(e) => e.stopPropagation()}
                  title="Bookmark"
                  className="p-2.5 rounded-full bg-white/85 hover:bg-white text-gray-800 backdrop-blur-md transition-all active:scale-90 shadow-md"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Row: Photographer Info & Quick Download with real counter */}
              <div className="flex items-center justify-between pointer-events-auto">
                <Link
                  to={`/profile/${photo.photographer.username}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2.5 min-w-0 group/author hover:opacity-90"
                  title={`View ${photo.photographer.name}'s profile`}
                >
                  <img
                    src={photo.photographer.avatarUrl}
                    alt={photo.photographer.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/80 shadow-sm flex-shrink-0 group-hover/author:scale-105 transition-transform"
                  />
                  <div className="truncate">
                    <p className="text-white text-xs font-semibold truncate leading-tight drop-shadow group-hover/author:underline">
                      {photo.photographer.name}
                    </p>
                    <p className="text-gray-300 text-[10px] truncate leading-tight">
                      @{photo.photographer.username}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={(e) => handleQuickDownload(e, photo)}
                  disabled={isDownloading}
                  title="Download Free"
                  className="flex items-center gap-1.5 bg-white hover:bg-gray-100 text-gray-900 text-xs font-bold px-3 py-2 rounded-full shadow-md transition-all active:scale-95"
                >
                  {isDownloading ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600 animate-bounce" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-gray-700" />
                      <span>{photo.downloads || 0}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
