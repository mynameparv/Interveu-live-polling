import React, { useState } from 'react';
import { Poll } from '../../types';
import { Button } from '../common/Button';
import { usePollTimer } from '../../hooks/usePollTimer';

interface PollQuestionProps {
    poll: Poll;
    onSubmitVote: (optionIndex: number) => void;
    isSubmitting: boolean;
}

export const PollQuestion: React.FC<PollQuestionProps> = ({ poll, onSubmitVote, isSubmitting }) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const { formattedTime, isExpired } = usePollTimer(poll.endsAt);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOption !== null && !isExpired) {
            onSubmitVote(selectedOption);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-text-dark">Question</h2>
                <div className="flex items-center gap-1 text-red-500 font-semibold bg-red-50 px-3 py-1 rounded-full text-sm">
                    <span>⏱</span> {formattedTime}
                </div>
            </div>

            <div className="card bg-[#575757] text-white p-6 pb-20 relative overflow-visible">
                <h3 className="text-lg font-medium mb-6 relative z-10">{poll.question}</h3>

                <div className="space-y-3 relative z-10 w-full bg-white rounded-b-xl -mx-6 -mb-20 px-6 py-6 border border-gray-200">
                    {poll.options.map((option, index) => (
                        <label
                            key={index}
                            className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedOption === index
                                    ? 'border-primary bg-primary bg-opacity-5'
                                    : 'border-gray-200 hover:border-primary-light hover:bg-gray-50'
                                }
                  ${isExpired ? 'opacity-70 cursor-not-allowed' : ''}
                `}
                        >
                            <input
                                type="radio"
                                name="poll-option"
                                className="hidden"
                                checked={selectedOption === index}
                                onChange={() => setSelectedOption(index)}
                                disabled={isSubmitting || isExpired}
                            />
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                    ${selectedOption === index ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                                {index + 1}
                            </div>
                            <span className="text-text-dark font-medium">{option.text}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-24">
                <Button
                    type="submit"
                    disabled={selectedOption === null || isSubmitting || isExpired}
                    className="px-10"
                >
                    Submit
                </Button>
            </div>
        </form>
    );
};
