import React from 'react';
import { BaseCard } from './BaseCard';
import { DynamicIcon } from '@/components/ui/DynamicIcon';

export interface ActivityEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: string;
  color?: string;
}

interface ActivityCardProps {
  title: string;
  events: ActivityEvent[];
  className?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  events,
  className = '',
}) => {
  return (
    <BaseCard variant="default" className={`text-left space-y-4 ${className}`}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary border-b border-border pb-2">
        {title}
      </h3>
      
      <div className="relative pl-4 border-l border-border/80 space-y-5 py-1">
        {events.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-secondary">No recent activities logged</div>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="relative space-y-0.5 text-xs">
              {/* Event bullet with optional icon */}
              <div 
                className="absolute -left-6.5 top-0.5 w-5 h-5 rounded-full border bg-background flex items-center justify-center text-text-secondary"
                style={{ borderColor: evt.color || 'var(--border)' }}
              >
                {evt.icon ? (
                  <DynamicIcon name={evt.icon} size={10} />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: evt.color || 'var(--text-secondary)' }} />
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-text-primary">{evt.title}</span>
                <span className="text-[9px] text-text-secondary font-medium shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              {evt.description && (
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  {evt.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </BaseCard>
  );
};

export default ActivityCard;
