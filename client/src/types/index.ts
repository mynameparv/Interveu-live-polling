export type Role = 'teacher' | 'student' | null;

export interface UserState {
    sessionId: string;
    name: string;
    role: Role;
}

export interface PollOption {
    text: string;
    voteCount: number;
    isCorrect: boolean;
}

export interface Poll {
    _id: string;
    question: string;
    options: PollOption[];
    timerDuration: number;
    status: 'active' | 'completed';
    createdBy: string;
    startedAt: string; // ISO string
    endsAt: string; // ISO string
    totalVotes: number;
}

export interface StudentInfo {
    name: string;
    sessionId: string;
}

// Socket types
export interface PollCreatedEvent extends Poll { }

export interface PollNewEvent extends Poll { }

export interface PollResultsUpdateEvent extends Poll { }

export interface PollCompletedEvent extends Poll { }

export interface StateRecoveredEvent {
    activePoll: Poll | null;
    hasVoted: boolean;
}

// API Responses
export interface MyVoteResponse {
    hasVoted: boolean;
}

export interface ValidateNameResponse {
    isTaken: boolean;
}
