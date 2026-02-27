import { PollService } from './PollService';
import { Server } from 'socket.io';

export class TimerService {
    private static timerId: NodeJS.Timeout | null = null;
    private static io: Server | null = null;

    static setIoInstance(ioInstance: Server) {
        this.io = ioInstance;
    }

    static startTimer(pollId: string, endsAt: Date) {
        this.cancelTimer();

        const now = new Date();
        const delay = Math.max(0, endsAt.getTime() - now.getTime());

        this.timerId = setTimeout(async () => {
            try {
                const completedPoll = await PollService.completePoll(pollId);
                if (completedPoll && this.io) {
                    this.io.emit('poll:completed', completedPoll);
                }
            } catch (error) {
                console.error('Error completing poll on timer expiry:', error);
            }
        }, delay);
    }

    static cancelTimer() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }
}
