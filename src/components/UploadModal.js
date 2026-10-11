import React, { useState } from 'react';
import { X, UploadCloud, Tag, CheckCircle2 } from 'lucide-react';
import { uploadPhotoApi } from '../services/api';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [location, setLocation] = useState('');
  const [camera, setCamera] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !title.trim()) {
      setErrorMessage('Please select a photo and enter a title.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('hashtags', hashtags.trim());
      formData.append('location', location.trim());
      formData.append('camera', camera.trim());

      const createdPhoto = await uploadPhotoApi(formData);

      setSubmitted(true);
      setTimeout(() => {
        onUploadSuccess(createdPhoto);
        setSubmitted(false);
        onClose();
        // Reset state
        setSelectedFile(null);
        setFilePreview(null);
        setTitle('');
        setDescription('');
        setHashtags('');
        setCamera('');
        setLocation('');
      }, 1000);
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMessage(err.message || 'Failed to upload photo to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Submit a High-Resolution Photo</h2>
            <p className="text-xs text-gray-500 mt-0.5">Uploads directly to your local backend and SQLite database.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {submitted ? (
          <div className="py-16 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-gray-900">Photo Saved to Database!</h3>
            <p className="text-sm text-gray-500">Your photo is now live on the #Hashtag feed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Photo File (JPG, PNG, WebP up to 120MB) *
              </label>

              {filePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 group bg-black">
                  <img src={filePreview} alt="Preview" className="w-full h-56 object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full text-xs"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 hover:border-black rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100/60 transition-colors">
                  <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm font-semibold text-gray-700">Click to upload or drag & drop</span>
                  <span className="text-xs text-gray-400 mt-1">Files are saved to server/uploads/</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Photo Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Misty Alpine Lake at Dawn"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Description / Story
              </label>
              <textarea
                rows={2}
                placeholder="Share the story behind this shot..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Hashtags (Comma or space separated)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. nature, travel, mountains, sunrise"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            {/* Camera Model & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Camera Model
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sony A7 IV"
                  value={camera}
                  onChange={(e) => setCamera(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Banff, Canada"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-black rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFile || !title.trim() || isSubmitting}
                className="bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                {isSubmitting ? 'Uploading to Server...' : 'Publish to #Hashtag'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
