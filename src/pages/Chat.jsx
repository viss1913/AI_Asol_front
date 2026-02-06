import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, Image as ImageIcon, Video, Mic } from 'lucide-react';

const Chat = () => {
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', content: 'Привет! Я ваш помощник AI Asol. Чем я могу вам помочь сегодня?' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Имитация ответа ИИ
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Это демо-версия AI Chat. Скоро здесь будет подключен мощный интеллект AI Asol для решения ваших задач!'
            }]);
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto px-6 pt-32 pb-6 min-h-screen flex flex-col">
            <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col mb-6">
                {/* Chat Header */}
                <div className="px-8 py-4 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900">AI Chat</h2>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Онлайн</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg uppercase tracking-widest border border-slate-100">
                            Beta
                        </span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                    {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} />}
                                </div>
                                <div className={`max-w-[80%] px-6 py-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-700 border border-slate-100'}`}>
                                    <p className="font-medium leading-relaxed">{msg.content}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-slate-50">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Введите ваше сообщение..."
                            className="w-full pl-6 pr-32 py-4 bg-slate-50 border border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <button type="button" className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                                <ImageIcon size={20} />
                            </button>
                            <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95">
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100">Идеи для контента</button>
                        <button className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100">Помощь в маркетинге</button>
                        <button className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100">Скрипт для видео</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
