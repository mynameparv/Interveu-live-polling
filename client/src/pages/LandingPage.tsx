import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { setRole } = useUser();

    const handleSelectRole = (role: 'teacher' | 'student') => {
        setRole(role);
        navigate('/name-entry');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    ✦ Intervue Poll
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-text-dark mb-3">Welcome to the Live Polling System</h1>
                <p className="text-text-light text-sm sm:text-base max-w-lg mx-auto">
                    Please select the role that best describes you to begin using the live polling system.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl justify-center">
                <button
                    onClick={() => handleSelectRole('student')}
                    className="flex-1 card p-6 text-left border-2 border-transparent hover:border-primary transition-all group"
                >
                    <h2 className="text-xl font-bold text-text-dark mb-2 group-hover:text-primary">I'm a Student</h2>
                    <p className="text-sm text-text-light">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    </p>
                </button>

                <button
                    onClick={() => handleSelectRole('teacher')}
                    className="flex-1 card p-6 text-left border-2 border-transparent hover:border-primary transition-all group"
                >
                    <h2 className="text-xl font-bold text-text-dark mb-2 group-hover:text-primary">I'm a Teacher</h2>
                    <p className="text-sm text-text-light">
                        Submit answers and view live poll results in real-time.
                    </p>
                </button>
            </div>
        </div>
    );
};
