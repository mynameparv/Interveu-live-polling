import { useState, useEffect, useCallback } from 'react';

interface TimerResult {
    remainingSeconds: number;
    isExpired: boolean;
    formattedTime: string;
}

export const usePollTimer = (endsAt: string | null): TimerResult => {
    const [remainingSeconds, setRemainingSeconds] = useState(0);

    const calculateRemaining = useCallback(() => {
        if (!endsAt) return 0;
        const end = new Date(endsAt).getTime();
        const now = Date.now();
        return Math.max(0, Math.floor((end - now) / 1000));
    }, [endsAt]);

    useEffect(() => {
        if (!endsAt) {
            setRemainingSeconds(0);
            return;
        }

        setRemainingSeconds(calculateRemaining());

        const interval = setInterval(() => {
            const remaining = calculateRemaining();
            setRemainingSeconds(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endsAt, calculateRemaining]);

    const min = Math.floor(remainingSeconds / 60);
    const sec = remainingSeconds % 60;
    const formattedTime = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

    return {
        remainingSeconds,
        isExpired: endsAt ? remainingSeconds <= 0 : false,
        formattedTime,
    };
};
