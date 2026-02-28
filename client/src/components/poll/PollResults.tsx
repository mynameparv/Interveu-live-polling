import React from 'react';
import { Poll } from '../../types';
import { usePollTimer } from '../../hooks/usePollTimer';

interface PollResultsProps {
    poll: Poll;
    showTimer?: boolean;
    offset?: number;
}

export const PollResults: React.FC<PollResultsProps> = ({ poll, showTimer = false, offset = 0 }) => {
    const { formattedTime, isExpired } = usePollTimer(poll.endsAt, offset);

    // Calculate highest vote count to highlight the winner
    let maxVotes = 0;
    poll.options.forEach(opt => {
        if (opt.voteCount > maxVotes) maxVotes = opt.voteCount;
    });

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in mb-10">
            <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-text-dark">Question</h2>
                {showTimer && !isExpired && (
                    <div className="flex items-center gap-1 text-red-500 font-semibold bg-red-50 px-3 py-1 rounded-full text-sm">
                        <span>⏱</span> {formattedTime}
                    </div>
                )}
            </div>

            {showTimer && isExpired && (
                <div className="flex items-center gap-1 text-gray-500 font-semibold bg-gray-50 px-3 py-1 rounded-full text-sm">
                    <span>✅</span> Poll ended
                </div>
            )}

            <div className="card bg-[#575757] text-white p-6 pb-20 relative overflow-visible">
                <h3 className="text-lg font-medium mb-6 relative z-10">{poll.question}</h3>

                <div className="space-y-4 relative z-10 w-full bg-white rounded-b-xl -mx-6 -mb-20 px-6 py-6 border border-gray-200">
                    {poll.options.map((option, index) => {
                        const percentage = poll.totalVotes > 0
                            ? Math.round((option.voteCount / poll.totalVotes) * 100)
                            : 0;

                        const isWinner = option.voteCount === maxVotes && maxVotes > 0;
                        const isCompleted = poll.status === 'completed' || isExpired;

                        return (
                            <div key={index} className="flex items-center gap-4">
                                <div className="flex-grow relative h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                    <div
                                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out flex items-center px-4
                          ${isWinner ? 'bg-primary' : 'bg-primary-light bg-opacity-80'}
                        `}
                                        style={{ width: `${Math.max(percentage, 5)}%` }} // Give at least 5% width so text and circle fit nicely if it's the only one, or just trust absolute positioning
                                    />

                                    <div className="absolute top-0 left-0 h-full w-full flex items-center px-4 gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 z-10
                             ${percentage > 10 ? 'bg-white bg-opacity-20 text-white' : 'bg-primary text-white'}
                        `}>
                                            {index + 1}
                                        </div>
                                        <div className="flex items-center gap-2 z-10 overflow-hidden">
                                            <span className={`font-medium truncate ${percentage > 20 ? 'text-white' : 'text-text-dark'}`}>
                                                {option.text}
                                            </span>
                                            {isCompleted && option.isCorrect && (
                                                <span className="flex-shrink-0 text-green-500 font-bold" title="Correct Answer">
                                                    ✅
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-12 text-right font-bold text-text-dark shrink-0">
                                    {percentage}%
                                </div>
                            </div>
                        );
                    })}

                    <div className="text-right text-sm text-gray-500 pt-2 font-medium">
                        Total votes: {poll.totalVotes}
                    </div>
                </div>
            </div>
        </div>
    );
};
