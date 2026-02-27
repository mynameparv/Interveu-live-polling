import axios from 'axios';
import { API_URL } from '../utils/constants';
import { Poll, MyVoteResponse, ValidateNameResponse } from '../types';

const api = axios.create({
    baseURL: API_URL,
});

export const pollApi = {
    getActivePoll: async (): Promise<Poll | null> => {
        try {
            const { data } = await api.get('/polls/active');
            return data;
        } catch {
            return null;
        }
    },

    getPollHistory: async (): Promise<Poll[]> => {
        const { data } = await api.get('/polls/history');
        return data;
    },

    checkMyVote: async (pollId: string, sessionId: string): Promise<boolean> => {
        try {
            const { data } = await api.get<MyVoteResponse>(`/polls/${pollId}/my-vote`, {
                params: { sessionId }
            });
            return data.hasVoted;
        } catch {
            return false;
        }
    },

    validateName: async (name: string, sessionId: string): Promise<boolean> => {
        const { data } = await api.post<ValidateNameResponse>('/sessions/validate-name', { name, sessionId });
        return data.isTaken;
    }
};
