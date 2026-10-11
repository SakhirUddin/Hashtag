import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-lg">
              #
            </div>
            <span className="font-bold text-xl text-gray-900">Hashtag</span>
            <span className="text-gray-400 text-sm ml-2">| Make Something Awesome</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <a href="#about" className="hover:text-black transition-colors">About</a>
            <a href="#license" className="hover:text-black transition-colors">License</a>
            <a href="#privacy" className="hover:text-black transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-black transition-colors">Terms of Service</a>
            <a href="#community" className="hover:text-black transition-colors">Creators Community</a>
          </div>

          <div className="text-xs text-gray-400">
            © {new Date().getFullYear()} #Hashtag. Free stock photos by creators for everyone.
          </div>
        </div>
      </div>
    </footer>
  );
}
