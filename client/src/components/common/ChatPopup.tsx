import React, { useState, useEffect, useRef } from 'react';
import { useSocketContext } from '../../context/SocketContext';
import { useUser } from '../../context/UserContext';
import { Send, MessageSquare, X } from 'lucide-react';

interface ChatMessage {
    message: string;
    senderName: string;
    senderRole: 'teacher' | 'student';
    timestamp: string;
}

interface Participant {
    name: string;
    sessionId: string;
}

export const ChatPopup: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const { socket } = useSocketContext();
    const { user } = useUser();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // Socket setup
    useEffect(() => {
        if (!socket) return;

        // Listen for history payload
        const handleHistory = (history: ChatMessage[]) => {
            setMessages(history);
        };

        const handleReceive = (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
            // Auto scroll to bottom
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 50);
        };

        const handleParticipants = (data: Participant[]) => {
            setParticipants(data);
        };

        socket.on('chat:history', handleHistory);
        socket.on('chat:receive', handleReceive);
        socket.on('participants:update', handleParticipants);

        // Request history and participants immediately on mount
        socket.emit('chat:request-history', { sessionId: user.sessionId });
        socket.emit('participants:request');

        return () => {
            socket.off('chat:history', handleHistory);
            socket.off('chat:receive', handleReceive);
            socket.off('participants:update', handleParticipants);
        };
    }, [socket, user.sessionId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !socket) return;

        socket.emit('chat:message', { message: newMessage.trim(), sessionId: user.sessionId });
        setNewMessage('');
    };

    const handleKick = (participantSessionId: string) => {
        if (!socket || user.role !== 'teacher') return;
        socket.emit('student:kick', { sessionId: participantSessionId });
    };

    return (
        <>
            {/* Chat toggle button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-all z-50 flex items-center justify-center animate-slide-up"
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[26rem] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden animate-slide-up">
                    {/* Header Tabs */}
                    <div className="bg-white border-b flex items-center justify-between shrink-0 pt-2 px-2">
                        <div className="flex w-full gap-4 px-2">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Chat
                            </button>
                            <button
                                onClick={() => setActiveTab('participants')}
                                className={`pb-2 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'participants' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Participants
                            </button>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="pb-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {activeTab === 'chat' ? (
                        <>
                            {/* Messages */}
                            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
                                {messages.length === 0 ? (
                                    <div className="text-gray-400 text-sm text-center my-auto">No messages yet. Start the conversation!</div>
                                ) : (
                                    messages.map((msg, i) => {
                                        const isMe = msg.senderName === user.name && msg.senderRole === user.role;
                                        return (
                                            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <span className="text-[10px] text-gray-400 mb-1 ml-1">
                                                    {isMe ? 'You' : `${msg.senderName} ${msg.senderRole === 'teacher' ? '(Teacher)' : ''}`}
                                                </span>
                                                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                                    }`}>
                                                    {msg.message}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-3 border-t shrink-0 flex gap-2 items-center bg-white">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-grow text-sm py-2 px-3 focus:outline-none rounded-full bg-gray-100"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-primary text-white p-2 flex items-center justify-center rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
                                >
                                    <Send size={16} className="-ml-1 mt-0.5" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-2 bg-gray-50">
                            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 px-2">
                                <span>Name</span>
                                {user.role === 'teacher' && <span>Action</span>}
                            </div>
                            {participants.length === 0 ? (
                                <div className="text-gray-400 text-sm text-center my-auto">No participants yet.</div>
                            ) : (
                                participants.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-lg shadow-sm border border-gray-100">
                                        <span className="text-sm font-medium text-gray-800 truncate" title={p.name}>{p.name}</span>
                                        {user.role === 'teacher' && (
                                            <button
                                                onClick={() => handleKick(p.sessionId)}
                                                className="text-xs text-primary hover:text-primary-dark font-semibold px-2 transition-colors"
                                            >
                                                Kick out
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
