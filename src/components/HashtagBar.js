import React from 'react';
import { POPULAR_HASHTAGS } from '../data/mockPhotos';

export default function HashtagBar({ activeTag, onSelectTag }) {
  return (
    <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none scroll-smooth">
          {POPULAR_HASHTAGS.map((tag) => {
            const isSelected = activeTag.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-black text-white shadow-sm scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black'
                }`}
              >
                {tag === 'All' ? '⚡ All Photos' : `#${tag}`}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
