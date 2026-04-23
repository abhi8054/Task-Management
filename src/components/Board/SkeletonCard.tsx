import React, { memo } from 'react';

const SkeletonCard = memo(() => (
  <div className="bg-white/[0.04] rounded-xl border border-white/[0.08] overflow-hidden">
    <div className="h-0.5 skeleton" />
    <div className="p-4">
      <div className="flex items-start gap-2">
        <div className="skeleton w-3.5 h-3.5 rounded mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="skeleton h-3.5 rounded-full w-4/5" />
          <div className="skeleton h-3 rounded-full w-3/5" />
        </div>
        <div className="flex gap-1 shrink-0">
          <div className="skeleton w-6 h-6 rounded-lg" />
          <div className="skeleton w-6 h-6 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pl-5">
        <div className="skeleton h-5 w-14 rounded-full" />
        <div className="skeleton h-3 w-20 rounded-full" />
      </div>
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';
export default SkeletonCard;
