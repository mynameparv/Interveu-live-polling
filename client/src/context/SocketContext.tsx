import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import { useUser } from './UserContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, logout } = useUser();

    useEffect(() => {
        // Only connect if user has logged in (name and role exist) or if they just selected a role?
        // Let's connect even if they haven't set name yet, but we only emit session:join when they log in.
        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: true
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            if (user.name && user.role) {
                newSocket.emit('session:join', {
                    sessionId: user.sessionId,
                    name: user.name,
                    role: user.role
                });
            }
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        newSocket.on('session:kicked', () => {
            logout();
            window.location.href = '/kicked-out';
        });

        return () => {
            newSocket.disconnect();
        };
        // We purposefully ignore user changes for reconnecting to avoid multiple sockets.
        // Instead we handle session:join inside a separate effect if user changes.
    }, []);

    // Sync session on reconnect or user login change
    useEffect(() => {
        if (socket && isConnected && user.name && user.role) {
            socket.emit('session:join', {
                sessionId: user.sessionId,
                name: user.name,
                role: user.role
            });
        }
    }, [user.name, user.role, socket, isConnected]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => useContext(SocketContext);
