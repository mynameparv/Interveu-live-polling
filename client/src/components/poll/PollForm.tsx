import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Trash2 } from 'lucide-react';

interface PollFormProps {
    onSubmit: (question: string, options: { text: string; isCorrect: boolean }[], timerDuration: number) => void;
    isSubmitting: boolean;
}

export const PollForm: React.FC<PollFormProps> = ({ onSubmit, isSubmitting }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<{ text: string; isCorrect: boolean }[]>([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    const [timerDuration, setTimerDuration] = useState(60);

    const handleToggleCorrect = (index: number) => {
        const newOptions = options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index
        }));
        setOptions(newOptions);
    };

    const handleAddOption = () => {
        if (options.length < 10) {
            setOptions([...options, { text: '', isCorrect: false }]);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], text: value };
        setOptions(newOptions);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validOptions = options.filter(opt => opt.text.trim() !== '');
        if (question.trim() && validOptions.length >= 2) {
            onSubmit(question.trim(), validOptions, timerDuration);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-dark">Let's Get Started</h2>
            </div>

            <p className="text-text-light mb-6">
                You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
            </p>

            <div className="flex gap-4 items-end">
                <div className="flex-grow">
                    <Input
                        label="Enter your question"
                        placeholder="e.g. Which planet is known as the Red Planet?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                        maxLength={100}
                    />
                </div>
                <div className="w-32">
                    <Input
                        label="Duration (sec)"
                        type="number"
                        min={10}
                        max={600}
                        value={timerDuration}
                        onChange={(e) => setTimerDuration(Number(e.target.value))}
                        required
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-semibold text-text-dark">Edit Options</label>
                    <span className="text-xs text-gray-500">Mark correct answer</span>
                </div>
                {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {index + 1}
                        </div>
                        <Input
                            placeholder={`Option ${index + 1}`}
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            required
                        />
                        <input
                            type="checkbox"
                            checked={option.isCorrect}
                            onChange={() => handleToggleCorrect(index)}
                            className="w-5 h-5 accent-primary cursor-pointer"
                            title="Mark as correct"
                        />
                        {options.length > 2 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveOption(index)}
                                className="text-red-400 hover:text-red-600 transition-colors p-2"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleAddOption}
                    disabled={options.length >= 10}
                >
                    + Add More option
                </Button>

                <Button
                    type="submit"
                    disabled={isSubmitting || !question.trim() || options.filter(o => o.text.trim() !== '').length < 2 || !options.some(o => o.isCorrect)}
                >
                    Ask Question
                </Button>
            </div>
        </form>
    );
};
