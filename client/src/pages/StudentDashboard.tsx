import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { usePollState } from '../hooks/usePollState';
import { useStateRecovery } from '../hooks/useStateRecovery';
import { PollQuestion } from '../components/poll/PollQuestion';
import { PollResults } from '../components/poll/PollResults';
import { Loader } from '../components/common/Loader';
import { ChatPopup } from '../components/common/ChatPopup';

export const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { activePoll, phase, isSubmitting, vote, syncState } = usePollState();
    const { isRecovering } = useStateRecovery(syncState);

    useEffect(() => {
        if (!user.name || user.role !== 'student') {
            navigate('/');
        }
    }, [user, navigate]);

    if (isRecovering) {
        return <div className="min-h-screen flex items-center justify-center p-4"><Loader size="lg" /></div>;
    }

    return (
        <div className="min-h-screen flex flex-col p-4 sm:p-8 relative">
            {/* Floating intervue icon top center */}
            <div className="flex justify-center mb-12">
                <div className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                    <span className="text-sm">✦</span> Intervue Poll
                </div>
            </div>

            <div className="flex-grow flex flex-col items-center max-w-4xl mx-auto w-full">
                {phase === 'active' && activePoll ? (
                    <PollQuestion
                        poll={activePoll}
                        onSubmitVote={(optionIndex) => vote(activePoll._id, optionIndex)}
                        isSubmitting={isSubmitting}
                    />
                ) : phase === 'voted' && activePoll ? (
                    <div className="w-full text-center">
                        <PollResults poll={activePoll} showTimer={true} />
                        <h3 className="text-xl font-bold text-text-dark mt-8 animate-fade-in">Wait for the teacher to ask a new question..</h3>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center mt-20 animate-fade-in">
                        <Loader size="md" />
                        <h2 className="text-2xl font-bold text-text-dark mt-6">Wait for the teacher to ask questions..</h2>
                    </div>
                )}
            </div>

            {/* Chat Module */}
            <ChatPopup />
        </div>
    );
};
