import React from 'react';
import { Search } from 'lucide-react';

export default function HeroBanner({ searchTerm, setSearchTerm, onSelectTag }) {
  const trendingTags = ['Nature', 'Street', 'Minimalism', 'Architecture', 'Ocean'];

  return (
    <div className="relative bg-gradient-to-r from-gray-900 via-zinc-900 to-black text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <span className="inline-block bg-white/10 text-white/90 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-white/10 backdrop-blur-sm">
          #Hashtag Creative Community
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Find The Perfect Free <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            High-Resolution Photo
          </span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
          Over millions of royalty-free, high-quality images curated by creators, photographers, and artists worldwide.
        </p>

        {/* Big Centered Hero Search */}
        <div className="mt-8 max-w-2xl mx-auto relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search free high-resolution photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-gray-900 placeholder-gray-400 rounded-2xl pl-12 pr-4 py-4 text-base shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {/* Quick Trending Chips */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400 flex-wrap">
            <span className="font-semibold text-gray-300">Trending:</span>
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className="hover:text-white underline-offset-4 hover:underline transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
