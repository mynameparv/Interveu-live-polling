import React from 'react';

export const Loader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeMap = {
        sm: 'w-5 h-5 border-2',
        md: 'w-10 h-10 border-4',
        lg: 'w-16 h-16 border-4'
    };

    return (
        <div className="flex justify-center items-center w-full my-8">
            <div className={`animate-spin rounded-full border-t-primary border-r-primary border-b-transparent border-l-transparent ${sizeMap[size]}`}></div>
        </div>
    );
};
