import { useEffect, useState } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import { StateRecoveredEvent } from '../types';

export const useStateRecovery = (syncState: (poll: any, hasVoted: boolean, serverTime?: string) => void) => {
    const { socket, isConnected } = useSocketContext();
    const { user } = useUser();
    const [isRecovering, setIsRecovering] = useState(true);

    useEffect(() => {
        if (!socket || !isConnected) {
            setIsRecovering(false); // If no socket, we can't recover. It will try later.
            return;
        }

        // Only recover if they are truly logged in with a name and a role
        if (!user.role || !user.name) {
            setIsRecovering(false);
            return;
        }

        setIsRecovering(true);

        const handleStateRecovered = (data: StateRecoveredEvent) => {
            syncState(data.activePoll, data.hasVoted, data.serverTime);
            setIsRecovering(false);
        };

        socket.on('state:recovered', handleStateRecovered);

        // Trigger recovery
        socket.emit('state:recover', { sessionId: user.sessionId });

        // Fallback timeout in case server doesn't respond
        const timeout = setTimeout(() => {
            setIsRecovering(false);
        }, 3000);

        return () => {
            socket.off('state:recovered', handleStateRecovered);
            clearTimeout(timeout);
        };
    }, [socket, isConnected, user.sessionId, user.role, user.name, syncState]);

    return { isRecovering };
};
