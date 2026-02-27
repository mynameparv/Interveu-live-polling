import React from 'react';

export const KickedOutPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="max-w-md w-full text-center flex flex-col items-center animate-fade-in">

                {/* Badge */}
                <div className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full mb-6 shadow-sm inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    Intervue Poll
                </div>

                {/* Heading */}
                <h1 className="text-3xl font-medium text-gray-900 mb-3">
                    You've been Kicked out !
                </h1>

                {/* Subtitle */}
                <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                    Looks like the teacher had removed you from the poll system. Please Try again sometime.
                </p>

            </div>
        </div>
    );
};
