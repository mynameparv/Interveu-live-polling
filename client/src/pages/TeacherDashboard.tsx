import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { usePollState } from '../hooks/usePollState';
import { useStateRecovery } from '../hooks/useStateRecovery';
import { PollForm } from '../components/poll/PollForm';
import { PollResults } from '../components/poll/PollResults';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { ChatPopup } from '../components/common/ChatPopup';
import { Eye } from 'lucide-react';
import { pollApi } from '../api/pollApi';
import { Poll } from '../types';

export const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { activePoll, phase, createPoll, syncState, offset } = usePollState();
    const { isRecovering } = useStateRecovery(syncState);

    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<Poll[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
        if (!user.name || user.role !== 'teacher') {
            navigate('/');
        }
    }, [user, navigate]);

    const loadHistory = async () => {
        setIsLoadingHistory(true);
        const data = await pollApi.getPollHistory();
        setHistory(data);
        setIsLoadingHistory(false);
    };

    const handleToggleHistory = () => {
        if (!showHistory) loadHistory();
        setShowHistory(!showHistory);
    };

    if (isRecovering) {
        return <div className="min-h-screen flex items-center justify-center p-4"><Loader size="lg" /></div>;
    }

    return (
        <div className="min-h-screen flex flex-col p-4 sm:p-8 relative">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-8 relative z-10 w-full max-w-4xl mx-auto">
                <div className="invisible sm:visible w-32"></div> {/* Spacer for centering */}
                <div className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full inline-flex flex-shrink-0 items-center gap-2">
                    <span className="text-sm">✦</span> Intervue Poll
                </div>
                <div className="w-32 text-right">
                    <Button variant="ghost" className="bg-primary bg-opacity-10 text-primary py-1.5 font-bold" onClick={handleToggleHistory}>
                        <Eye size={18} className="inline mr-2" />
                        {showHistory ? 'Back to Live' : 'View Poll history'}
                    </Button>
                </div>
            </div>

            <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full pt-4">
                {showHistory ? (
                    <div className="w-full animate-fade-in max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-text-dark mb-8">View Poll History</h2>
                        {isLoadingHistory ? (
                            <Loader />
                        ) : history.length > 0 ? (
                            <div className="space-y-12">
                                {history.map((poll, i) => (
                                    <div key={poll._id}>
                                        <h4 className="font-bold text-text-dark mb-4">Question {history.length - i}</h4>
                                        <PollResults poll={poll} showTimer={false} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-10">No past polls found.</p>
                        )}
                    </div>
                ) : phase === 'active' && activePoll ? (
                    <div className="w-full text-center">
                        <PollResults poll={activePoll} showTimer={true} offset={offset} />
                        <div className="mt-8 flex justify-center">
                            <Button onClick={() => syncState(null, false)}>+ Ask a new question</Button>
                        </div>
                    </div>
                ) : (
                    <PollForm onSubmit={createPoll} isSubmitting={false} />
                )}
            </div>

            {/* Chat Module */}
            <ChatPopup />
        </div>
    );
};
