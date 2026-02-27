import React, { ButtonHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className,
    ...props
}) => {
    return (
        <button
            className={cn(
                variant === 'primary' && 'btn-primary',
                variant === 'outline' && 'btn-outline',
                variant === 'ghost' && 'bg-transparent text-primary hover:bg-primary-light hover:bg-opacity-10 transition-colors',
                fullWidth && 'w-full',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
