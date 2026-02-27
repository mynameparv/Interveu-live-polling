import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { pollApi } from '../api/pollApi';

export const NameEntryPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, login } = useUser();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // If no role selected, go back to landing
    if (!user.role) {
        navigate('/');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const isTaken = await pollApi.validateName(name.trim(), user.sessionId);
            if (isTaken) {
                setError('This name is already connected. Please try another.');
                setIsLoading(false);
                return;
            }

            login(name.trim(), user.role);

            if (user.role === 'teacher') {
                navigate('/teacher-dashboard');
            } else {
                navigate('/student-dashboard');
            }
        } catch (err: any) {
            setError('Failed to join. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    ✦ Intervue Poll
                </div>
                <h1 className="text-3xl font-bold text-text-dark mb-3">Let's Get Started</h1>
                {user.role === 'student' ? (
                    <p className="text-text-light text-sm max-w-md mx-auto">
                        If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates.
                    </p>
                ) : (
                    <p className="text-text-light text-sm max-w-md mx-auto">
                        If you're a teacher, you'll be able to create polls and see live results.
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
                <Input
                    label="Enter your Name"
                    placeholder={user.role === 'teacher' ? 'Prof. Smith' : 'Ashwin Sharma'}
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setError('');
                    }}
                    error={error}
                    disabled={isLoading}
                />

                <div className="flex justify-center pt-4">
                    <Button type="submit" disabled={!name.trim() || isLoading}>
                        Continue
                    </Button>
                </div>
            </form>
        </div>
    );
};
