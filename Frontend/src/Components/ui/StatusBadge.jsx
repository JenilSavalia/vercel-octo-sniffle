import React from 'react';
import { cn } from '../../lib/utils';

const StatusBadge = ({ status, className }) => {
    const styles = {
        deployed: 'bg-green-500/10 text-green-500 border-green-500/20',
        failed: 'bg-red-500/10 text-red-500 border-red-500/20',
        building: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        queued: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        unknown: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };

    const normalizedStatus = status?.toLowerCase() || 'unknown';
    const style = styles[normalizedStatus] || styles.unknown;

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
                style,
                className
            )}
        >
            {status}
        </span>
    );
};

export { StatusBadge };
