import React from 'react';

export const SkeletonLoader: React.FC = () => {
  // Generate 4 skeleton items for the list
  const skeletonItems = Array.from({ length: 4 });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 space-y-6">
      {/* Search Bar Skeleton */}
      <div className="relative">
        <div className="w-full h-[58px] bg-[#1c1b1f] border border-[#2d2c30] rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 shimmer-bg" />
        </div>
      </div>

      {/* Section Title Skeleton */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          {/* Icon placeholder */}
          <div className="w-6 h-6 rounded-lg shimmer-element" />
          {/* Text placeholder */}
          <div className="h-5 w-44 shimmer-element rounded-lg" />
        </div>
      </div>

      {/* List Grid Skeleton */}
      <div className="grid gap-4">
        {skeletonItems.map((_, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-[24px] border border-[#2d2c30] bg-[#1c1b1f] p-5 flex items-start gap-4 shadow-sm"
          >
            {/* Play Button Skeleton */}
            <div className="shrink-0 w-12 h-12 rounded-2xl shimmer-element" />

            {/* Content Text Skeletons */}
            <div className="flex-1 space-y-3">
              {/* Title lines */}
              <div className="h-4 shimmer-element rounded-lg w-[85%] sm:w-[70%]" />
              <div className="h-4 shimmer-element rounded-lg w-[50%] sm:w-[35%]" />

              {/* Meta details badge row */}
              <div className="flex gap-4 pt-1">
                <div className="h-3 shimmer-element rounded w-16" />
                <div className="h-3 shimmer-element rounded w-20" />
              </div>
            </div>

            {/* Left Favorite Button Skeleton */}
            <div className="shrink-0 w-10 h-10 rounded-xl shimmer-element opacity-70" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ToolbarSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-28 shimmer-element rounded-md" />
    </div>
  );
};
