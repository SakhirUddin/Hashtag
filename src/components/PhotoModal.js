import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  X, Heart, Download, Share2, MapPin, 
  Camera, Eye, ArrowDownToLine, Check, ChevronDown, Bookmark, Sparkles 
} from 'lucide-react';
import { 
  likePhotoApi, trackDownloadApi, recordViewApi, getCurrentUser, getRelatedPhotos 
} from '../services/api';

export default function PhotoModal({ photo, onClose, onSelectHashtag, onPhotoUpdate, onSaveToCollection }) {
  const [photoData, setPhotoData] = useState(photo);
  const [relatedPhotos, setRelatedPhotos] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const viewedPhotoIdRef = useRef(null);
  const modalScrollRef = useRef(null);

  useEffect(() => {
    if (!photo) {
      viewedPhotoIdRef.current = null;
      setPhotoData(null);
      setRelatedPhotos([]);
      return;
    }

    setPhotoData(photo);

    // Guard: Record authentic view impression strictly ONCE per photo modal open
    if (photo.id && viewedPhotoIdRef.current !== photo.id) {
      viewedPhotoIdRef.current = photo.id;
      recordViewApi(photo.id).then((res) => {
        if (res && res.views !== undefined) {
          setPhotoData((prev) => (prev ? { ...prev, views: res.views } : prev));
          if (onPhotoUpdate) {
            onPhotoUpdate({ id: photo.id, views: res.views });
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo?.id]);

  useEffect(() => {
    if (photoData?.id) {
      getRelatedPhotos(photoData.id).then((items) => {
        setRelatedPhotos(items || []);
      });
    }
  }, [photoData?.id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!photoData) return null;

  const handleLikeClick = async () => {
    const user = getCurrentUser();
    if (!user) {
      if (window.confirm('Sign in to like photos and save them to your account. Go to sign in now?')) {
        navigate('/Login');
      }
      return;
    }

    try {
      const res = await likePhotoApi(photoData.id);
      setPhotoData((prev) => ({
        ...prev,
        isLiked: res.liked,
        likes: res.likes,
      }));
      if (onPhotoUpdate) {
        onPhotoUpdate({
          id: photoData.id,
          isLiked: res.liked,
          likes: res.likes,
        });
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    }
  };

  const downloadImage = async (sizeLabel = 'Original') => {
    setDownloading(true);
    setDropdownOpen(false);

    try {
      // 1. Record authentic download in database
      const trackRes = await trackDownloadApi(photoData.id, sizeLabel.toLowerCase());
      if (trackRes && trackRes.downloads !== undefined) {
        setPhotoData((prev) => ({ ...prev, downloads: trackRes.downloads }));
        if (onPhotoUpdate) {
          onPhotoUpdate({ id: photoData.id, downloads: trackRes.downloads });
        }
      }

      // 2. Fetch blob and trigger browser save
      let targetUrl = photoData.url;
      if (sizeLabel === 'Small') {
        targetUrl = `${photoData.url}&w=640`;
      } else if (sizeLabel === 'Medium') {
        targetUrl = `${photoData.url}&w=1920`;
      }

      const response = await fetch(targetUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${photoData.title.replace(/\s+/g, '-').toLowerCase()}-${sizeLabel.toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      window.open(photoData.url, '_blank');
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      {/* Background dismissal */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden z-10">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-shrink-0">
          {/* Photographer details */}
          <Link
            to={`/profile/${photoData.photographer.username}`}
            onClick={onClose}
            className="flex items-center gap-3 group hover:opacity-90"
            title={`View ${photoData.photographer.name}'s profile`}
          >
            <img
              src={photoData.photographer.avatarUrl}
              alt={photoData.photographer.name}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 group-hover:scale-105 transition-transform"
            />
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight group-hover:underline">
                {photoData.photographer.name}
              </h3>
              <p className="text-xs text-gray-500">
                @{photoData.photographer.username} • Creator
              </p>
            </div>
          </Link>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border transition-all ${
                photoData.isLiked 
                  ? 'bg-red-50 text-red-600 border-red-200 font-bold' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              title={photoData.isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${photoData.isLiked ? 'fill-current text-red-600' : ''}`} />
              <span className="text-xs font-bold">{photoData.likes || 0}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
              title="Share link"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if (onSaveToCollection) onSaveToCollection(photoData);
              }}
              className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
              title="Save to Collection"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Download Dropdown */}
            <div className="relative">
              <div className="inline-flex rounded-full shadow-sm">
                <button
                  onClick={() => downloadImage('Original')}
                  disabled={downloading}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-l-full flex items-center gap-2 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloading ? 'Downloading...' : 'Download Free'}</span>
                </button>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-green-700 hover:bg-green-800 text-white px-2.5 py-2.5 rounded-r-full border-l border-green-600"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-30 animate-scaleIn">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Select Resolution
                  </div>
                  <button
                    onClick={() => downloadImage('Small')}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex justify-between"
                  >
                    <span>Small</span>
                    <span className="text-gray-400">640 × 426</span>
                  </button>
                  <button
                    onClick={() => downloadImage('Medium')}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex justify-between"
                  >
                    <span>Medium</span>
                    <span className="text-gray-400">1920 × 1280</span>
                  </button>
                  <button
                    onClick={() => downloadImage('Original')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50 flex justify-between border-t border-gray-50"
                  >
                    <span>Original</span>
                    <span className="text-gray-400">2400 × 1600</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors ml-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body / Image View */}
        <div ref={modalScrollRef} className="flex-1 overflow-y-auto">
          {/* Main Photo Center */}
          <div className="bg-gray-950 flex items-center justify-center p-2 sm:p-6 min-h-[350px] max-h-[65vh]">
            <img
              src={photoData.url}
              alt={photoData.title}
              className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Title & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{photoData.title}</h2>
                <p className="text-gray-600 text-sm mt-1">{photoData.description}</p>
                {photoData.location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{photoData.location}</span>
                  </div>
                )}
              </div>

              {/* Stats Counters */}
              <div className="flex items-center gap-6 border border-gray-100 rounded-xl p-3 bg-gray-50 self-start sm:self-auto">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Views</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{(photoData.views || 0).toLocaleString()}</p>
                </div>
                <div className="h-6 w-px bg-gray-200" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Downloads</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{(photoData.downloads || 0).toLocaleString()}</p>
                </div>
                <div className="h-6 w-px bg-gray-200" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Likes</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">{(photoData.likes || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* EXIF Metadata Card */}
            {photoData.exif && (
              <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  <Camera className="w-4 h-4 text-gray-700" />
                  <span>Camera Specifications & EXIF Data</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Camera</span>
                    <span className="font-semibold text-gray-900 truncate block">{photoData.exif.camera}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Lens</span>
                    <span className="font-semibold text-gray-900 truncate block">{photoData.exif.lens}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Focal Length</span>
                    <span className="font-semibold text-gray-900">{photoData.exif.focalLength}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Aperture</span>
                    <span className="font-semibold text-gray-900">{photoData.exif.aperture}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Shutter Speed</span>
                    <span className="font-semibold text-gray-900">{photoData.exif.shutterSpeed}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">ISO</span>
                    <span className="font-semibold text-gray-900">{photoData.exif.iso}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Hashtag Chips */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Related Hashtags
              </h4>
              <div className="flex flex-wrap gap-2">
                {photoData.hashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      onSelectHashtag(tag);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* More Like This (Smart Recommendations Engine) */}
            {relatedPhotos.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">More Like This</h3>
                  <span className="text-xs text-gray-400">({relatedPhotos.length} recommendations)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {relatedPhotos.map((relPhoto) => (
                    <div
                      key={relPhoto.id}
                      onClick={() => {
                        setPhotoData(relPhoto);
                        if (modalScrollRef.current) {
                          modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-gray-100 aspect-[4/3] shadow-sm hover:shadow-lg transition-all"
                    >
                      <img
                        src={relPhoto.thumbnail || relPhoto.url}
                        alt={relPhoto.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                        <p className="text-xs font-bold truncate drop-shadow">{relPhoto.title}</p>
                        <p className="text-[10px] text-gray-300 truncate">by {relPhoto.photographer.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
