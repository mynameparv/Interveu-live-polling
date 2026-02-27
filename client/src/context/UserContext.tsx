import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UserState, Role } from '../types';
import { USER_SESSION_KEY } from '../utils/constants';

interface UserContextType {
    user: UserState;
    login: (name: string, role: Role) => void;
    logout: () => void;
    setRole: (role: Role) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserState>(() => {
        const saved = sessionStorage.getItem(USER_SESSION_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            sessionId: uuidv4(),
            name: '',
            role: null,
        };
    });

    useEffect(() => {
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    }, [user]);

    const login = (name: string, role: Role) => {
        setUser((prev) => ({ ...prev, name, role }));
    };

    const logout = () => {
        setUser({
            sessionId: uuidv4(),
            name: '',
            role: null,
        });
        sessionStorage.removeItem(USER_SESSION_KEY);
    };

    const setRole = (role: Role) => {
        setUser((prev) => ({ ...prev, role }));
    };

    return (
        <UserContext.Provider value={{ user, login, logout, setRole }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
