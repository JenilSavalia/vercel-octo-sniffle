import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', isLoading, children, ...props }, ref) => {
    const variants = {
        primary: 'bg-white text-black hover:bg-gray-200 border-transparent',
        secondary: 'bg-transparent border-gray-700 text-white hover:bg-[#222]',
        danger: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
        ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-[#222] border-transparent',
        link: 'text-blue-500 hover:underline bg-transparent border-transparent p-0 h-auto'
    };

    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-lg',
        icon: 'h-10 w-10 p-2 flex items-center justify-center'
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50 disabled:pointer-events-none border',
                variants[variant],
                sizes[size],
                className
            )}
            ref={ref}
            disabled={isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button };
