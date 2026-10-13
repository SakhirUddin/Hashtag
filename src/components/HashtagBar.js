import React, { useState } from 'react';
import { 
  ArrowUpDown, SlidersHorizontal, Heart, Eye, 
  Download, Clock, Smartphone, Monitor, Square, Check, X 
} from 'lucide-react';
import { POPULAR_HASHTAGS } from '../data/mockPhotos';

const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest Submissions', icon: Clock },
  { id: 'popular', label: 'Most Liked & Trending', icon: Heart },
  { id: 'views', label: 'Most Viewed', icon: Eye },
  { id: 'downloads', label: 'Most Downloaded', icon: Download },
];

const ORIENTATION_OPTIONS = [
  { id: 'all', label: 'All Formats', icon: SlidersHorizontal },
  { id: 'landscape', label: 'Landscape (16:9)', icon: Monitor },
  { id: 'portrait', label: 'Portrait (9:16)', icon: Smartphone },
  { id: 'square', label: 'Square (1:1)', icon: Square },
];

export default function HashtagBar({ 
  activeTag = 'All', 
  onSelectTag, 
  activeSort = 'latest', 
  onSelectSort, 
  activeOrientation = 'all', 
  onSelectOrientation,
  onResetFilters
}) {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [orientationDropdownOpen, setOrientationDropdownOpen] = useState(false);

  const currentSortObj = SORT_OPTIONS.find((s) => s.id === activeSort) || SORT_OPTIONS[0];
  const currentOrientObj = ORIENTATION_OPTIONS.find((o) => o.id === activeOrientation) || ORIENTATION_OPTIONS[0];

  const hasActiveFilters = activeTag !== 'All' || activeSort !== 'latest' || activeOrientation !== 'all';

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-16 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5">
          
          {/* Left: Scrollable Hashtag Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none scroll-smooth py-1 min-w-0 flex-1">
            {POPULAR_HASHTAGS.map((tag) => {
              const isSelected = activeTag.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all select-none ${
                    isSelected
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black'
                  }`}
                >
                  {tag === 'All' ? '⚡ All' : `#${tag}`}
                </button>
              );
            })}
          </div>

          {/* Right: Pro Discovery Controls (Orientation + Sorting Dropdowns) */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            
            {/* Orientation Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOrientationDropdownOpen(!orientationDropdownOpen);
                  setSortDropdownOpen(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  activeOrientation !== 'all'
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <currentOrientObj.icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{currentOrientObj.label}</span>
                <span className="md:hidden">Format</span>
              </button>

              {orientationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-40 animate-scaleIn">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Orientation
                  </div>
                  {ORIENTATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onSelectOrientation(opt.id);
                        setOrientationDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-xs flex items-center justify-between text-left transition-colors ${
                        activeOrientation === opt.id
                          ? 'bg-gray-50 text-black font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-3.5 h-3.5 text-gray-500" />
                        <span>{opt.label}</span>
                      </div>
                      {activeOrientation === opt.id && (
                        <Check className="w-3.5 h-3.5 text-black" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSortDropdownOpen(!sortDropdownOpen);
                  setOrientationDropdownOpen(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  activeSort !== 'latest'
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{currentSortObj.label}</span>
                <span className="md:hidden">Sort</span>
              </button>

              {sortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-40 animate-scaleIn">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Sort Feed By
                  </div>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onSelectSort(opt.id);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-xs flex items-center justify-between text-left transition-colors ${
                        activeSort === opt.id
                          ? 'bg-gray-50 text-black font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <opt.icon className="w-3.5 h-3.5 text-gray-500" />
                        <span>{opt.label}</span>
                      </div>
                      {activeSort === opt.id && (
                        <Check className="w-3.5 h-3.5 text-black" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filter Button */}
            {hasActiveFilters && onResetFilters && (
              <button
                onClick={onResetFilters}
                title="Reset all filters"
                className="p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
