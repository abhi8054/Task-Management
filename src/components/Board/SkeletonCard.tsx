import React, { memo } from 'react';

const SkeletonCard = memo(() => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    {/* Priority accent bar */}
    <div className="h-1 skeleton" />

    <div className="p-4">
      {/* Title row */}
      <div className="flex items-start gap-2">
        {/* Grip placeholder */}
        <div className="skeleton w-3.5 h-3.5 rounded mt-0.5 shrink-0" />

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Title */}
          <div className="skeleton h-3.5 rounded-full w-4/5" />
          {/* Description */}
          <div className="skeleton h-3 rounded-full w-3/5" />
        </div>

        {/* Action buttons placeholder */}
        <div className="flex gap-1 shrink-0">
          <div className="skeleton w-6 h-6 rounded-lg" />
          <div className="skeleton w-6 h-6 rounded-lg" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pl-5">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-3 w-20 rounded-full" />
      </div>
    </div>
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';
export default SkeletonCard;
