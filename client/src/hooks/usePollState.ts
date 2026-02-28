import { useState, useEffect, useCallback } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { Poll, PollCreatedEvent, PollNewEvent, PollResultsUpdateEvent, PollCompletedEvent } from '../types';

export type PollStatePhase = 'idle' | 'active' | 'voted' | 'completed';

export const usePollState = () => {
    const { socket } = useSocketContext();
    const { user } = useUser();
    const { showToast } = useToast();

    const [activePoll, setActivePoll] = useState<Poll | null>(null);
    const [phase, setPhase] = useState<PollStatePhase>('idle');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [offset, setOffset] = useState(0);

    // Directly sets the poll state - useful for recovery
    const syncState = useCallback((poll: Poll | null, hasVoted: boolean, serverTime?: string) => {
        if (serverTime) {
            const serverMillis = new Date(serverTime).getTime();
            const clientMillis = Date.now();
            setOffset(serverMillis - clientMillis);
        }

        setActivePoll(poll);
        if (!poll) {
            setPhase('idle');
        } else if (poll.status === 'completed') {
            setPhase('completed');
        } else if (hasVoted) {
            setPhase('voted');
        } else {
            setPhase('active');
        }
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('poll:new', (poll: PollNewEvent) => {
            setOffset(0); // Reset offset on new poll, if drift is minimal
            setActivePoll(poll);
            setPhase('active');
            showToast('A new poll has started!', 'info');
        });

        socket.on('poll:created', (poll: PollCreatedEvent) => {
            setOffset(0);
            setActivePoll(poll);
            // Teacher views live results immediately which is technically 'voted' phase view or a special 'live' view
            // We will handle 'teacher' viewing 'active' vs 'student' viewing 'active'.
            setPhase('active');
            showToast('Poll created successfully!', 'success');
        });

        socket.on('poll:results-update', (poll: PollResultsUpdateEvent) => {
            setActivePoll(poll);
        });

        socket.on('poll:completed', (poll: PollCompletedEvent) => {
            setActivePoll(poll);
            setPhase('completed');
            showToast('Poll has ended!', 'info');
        });

        return () => {
            socket.off('poll:new');
            socket.off('poll:created');
            socket.off('poll:results-update');
            socket.off('poll:completed');
        };
    }, [socket, showToast]);

    const createPoll = (question: string, options: { text: string; isCorrect: boolean }[], timerDuration: number) => {
        if (!socket || user.role !== 'teacher') return;
        socket.emit('poll:create', { question, options, timerDuration, sessionId: user.sessionId });
    };

    const vote = (pollId: string, optionIndex: number) => {
        if (!socket || user.role !== 'student' || phase !== 'active' || isSubmitting) return;

        setIsSubmitting(true);

        // Optimistic update
        setPhase('voted');

        socket.emit('poll:vote', { pollId, optionIndex, studentSessionId: user.sessionId });

        socket.once('poll:vote-ack', (response: { success: boolean; error?: string }) => {
            setIsSubmitting(false);
            if (response.success) {
                showToast('Vote submitted successfully!', 'success');
            } else {
                console.error(response.error);
                showToast(response.error || 'Failed to submit vote. Please try again.', 'error');
                setPhase('active'); // Revert state
            }
        });

        // Cleanup once listener if it doesn't fire (timeout handling fallback)
        setTimeout(() => {
            setIsSubmitting(false);
            socket.off('poll:vote-ack');
        }, 5000);
    };

    return {
        activePoll,
        phase,
        isSubmitting,
        offset,
        createPoll,
        vote,
        syncState
    };
};
