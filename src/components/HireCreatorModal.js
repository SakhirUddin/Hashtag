import React, { useState } from 'react';
import { X, Calendar, MapPin, DollarSign, Send, CheckCircle2, Briefcase } from 'lucide-react';
import { sendBookingInquiryApi, getCurrentUser } from '../services/api';

const PROJECT_TYPES = [
  'Portrait Session',
  'Commercial & Brand',
  'Wedding & Engagement',
  'Editorial / Fashion',
  'Event Coverage',
  'Product Photography',
  'Other Creative Project',
];

export default function HireCreatorModal({ isOpen, onClose, creator }) {
  const currentUser = getCurrentUser();

  const [senderName, setSenderName] = useState(currentUser?.displayName || '');
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || '');
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [shootDate, setShootDate] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !creator) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) {
      setError('Please fill in your name, email, and project message.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await sendBookingInquiryApi({
        creatorId: creator.id,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        projectType,
        shootDate: shootDate || null,
        location: location.trim() || null,
        budget: budget.trim() || null,
        message: message.trim(),
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2400);
    } catch (err) {
      setError(err.message || 'Failed to submit booking inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden z-10 p-6 sm:p-8 border border-gray-100 animate-scaleIn">
        
        {/* Header with Creator Info */}
        <div className="flex items-center justify-between pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={creator.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${creator.username}`}
              alt={creator.displayName}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-gray-100 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-gray-900 text-lg leading-tight">
                  Book {creator.displayName}
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Direct Shoot Inquiry & Commission Request
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4 border border-green-200 shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">Inquiry Sent!</h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
              Your shoot proposal has been delivered to <strong>{creator.displayName}</strong>. They will get back to you at <strong>{senderEmail}</strong> shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-semibold border border-red-100">
                {error}
              </div>
            )}

            {/* Sender Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                Project / Shoot Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Shoot Date, Location & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>Target Date</span>
                </label>
                <input
                  type="date"
                  value={shootDate}
                  onChange={(e) => setShootDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  placeholder="City / Studio"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-gray-400" />
                  <span>Budget</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. $500 - $1,500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Project Scope / Message */}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                Project Scope & Creative Brief *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your vision, deliverables needed, approximate hours, and any reference styles..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Booking Inquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
