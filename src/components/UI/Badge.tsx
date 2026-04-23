import React, { memo } from 'react';
import type { Priority, Status } from '../../types/task';
import { PRIORITY_STYLES, STATUS_STYLES } from '../../utils/helpers';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge = memo(({ priority, size = 'sm' }: PriorityBadgeProps) => {
  const cfg = PRIORITY_STYLES[priority];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ring-1 font-medium ${cfg.badge} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'}`}>
      <span className={`size-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
});

interface StatusBadgeProps {
  status: Status;
}

export const StatusBadge = memo(({ status }: StatusBadgeProps) => {
  const cfg = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
      {cfg.label}
    </span>
  );
});

PriorityBadge.displayName = 'PriorityBadge';
StatusBadge.displayName = 'StatusBadge';
