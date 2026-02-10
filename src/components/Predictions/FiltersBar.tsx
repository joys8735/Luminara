import React from 'react';
import { Search, SlidersHorizontal, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type SortOption = 'popular' | 'volatility' | 'odds' | 'time' | 'name';
export type FilterOption = 'all' | 'high-volatility' | 'low-risk' | 'trending';

interface FiltersBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  category: 'crypto' | 'sports' | 'news';
}

export function FiltersBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filter,
  onFilterChange,
  category,
}: FiltersBarProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: 'popular', label: 'Popular', icon: <TrendingUp className="w-3 h-3" /> },
    { value: 'volatility', label: 'Volatility', icon: <TrendingDown className="w-3 h-3" /> },
    { value: 'odds', label: 'Best Odds', icon: <DollarSign className="w-3 h-3" /> },
    { value: 'time', label: 'Starting Soon', icon: <Clock className="w-3 h-3" /> },
    { value: 'name', label: 'Name', icon: null },
  ];

  const filterOptions: { value: FilterOption; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'high-volatility', label: 'High Volatility' },
    { value: 'low-risk', label: 'Low Risk' },
    { value: 'trending', label: 'Trending' },
  ];

  return (
    <div className="space-y-3">
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707070]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search ${category} predictions...`}
            className="w-full pl-10 pr-4 py-2.5 bg-[#eee]/5 rounded-xl ui-bg-text text-sm outline-none focus:border-[#3b82f6]/30 border border-transparent transition-all"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all ${
            showFilters
              ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30'
              : 'bg-[#eee]/5 text-[#a0a0a0] border border-transparent hover:border-[#3b82f6]/20'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ui-card rounded-xl p-4 space-y-4">
              {/* Sort By */}
              <div>
                <div className="text-xs font-semibold text-[#a0a0a0] mb-2">Sort by</div>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onSortChange(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                        sortBy === option.value
                          ? 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30'
                          : 'bg-[#eee]/5 text-[#a0a0a0] border border-transparent hover:border-[#3b82f6]/20'
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter By */}
              <div>
                <div className="text-xs font-semibold text-[#a0a0a0] mb-2">Filter by</div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onFilterChange(option.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                        filter === option.value
                          ? 'bg-[#22c1c3]/10 text-[#22c1c3] border border-[#22c1c3]/30'
                          : 'bg-[#eee]/5 text-[#a0a0a0] border border-transparent hover:border-[#22c1c3]/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters Count */}
              {(filter !== 'all' || sortBy !== 'popular') && (
                <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f]">
                  <span className="text-xs text-[#707070]">
                    {filter !== 'all' ? '1 filter' : '0 filters'} active
                  </span>
                  <button
                    onClick={() => {
                      onFilterChange('all');
                      onSortChange('popular');
                    }}
                    className="text-xs text-[#3b82f6] hover:text-[#2563eb]"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Pills */}
      {(filter !== 'all' || sortBy !== 'popular' || searchQuery) && !showFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#707070]">Active:</span>
          
          {searchQuery && (
            <div className="px-2 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] text-xs flex items-center gap-1">
              Search: "{searchQuery.slice(0, 20)}"
              <button onClick={() => onSearchChange('')} className="hover:text-[#2563eb]">×</button>
            </div>
          )}

          {sortBy !== 'popular' && (
            <div className="px-2 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] text-xs flex items-center gap-1">
              Sort: {sortOptions.find(o => o.value === sortBy)?.label}
              <button onClick={() => onSortChange('popular')} className="hover:text-[#2563eb]">×</button>
            </div>
          )}

          {filter !== 'all' && (
            <div className="px-2 py-1 rounded-full bg-[#22c1c3]/10 text-[#22c1c3] text-xs flex items-center gap-1">
              {filterOptions.find(o => o.value === filter)?.label}
              <button onClick={() => onFilterChange('all')} className="hover:text-[#1da1a3]">×</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
