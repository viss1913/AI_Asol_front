import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, MessageSquare, Plus, Loader2, ChevronLeft } from 'lucide-react';
import { chatService } from '../services/api';
import avatarBase from '../assets/avatar.png';

const Chat = () => {
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        loadChats();
    }, []);

    const loadChats = async () => {
        try {
            const data = await chatService.getChats();
            setChats(data || []);
        } catch (err) {
            console.error("Failed to load chats:", err);
        }
    };

    const loadHistory = async (chatId) => {
        setLoadingHistory(true);
        setCurrentChatId(chatId);
        try {
            const data = await chatService.getChatHistory(chatId);
            setMessages(data.map(m => ({
                id: m.id,
                role: m.role,
                content: m.content,
                cost: m.cost
            })));
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleNewChat = () => {
        setCurrentChatId(null);
        setMessages([{ id: 'welcome', role: 'assistant', content: 'Привет! Я ваша Ассоль. Чем я могу вам помочь сегодня?' }]);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { id: Date.now(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const data = await chatService.sendMessage(input, currentChatId);

            if (!currentChatId && data.chatId) {
                setCurrentChatId(data.chatId);
                loadChats();
            }

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: data.message.content,
                cost: data.cost
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Ошибка при отправке сообщения. Проверьте баланс или попробуйте позже.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-white pt-32 overflow-hidden font-primary">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 300 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                className="bg-slate-50 border-r border-slate-100 flex flex-col overflow-hidden"
            >
                <div className="p-6">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <Plus size={20} className="text-indigo-600" />
                        Новый чат
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1.5 scrollbar-hide">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ваши диалоги</h3>
                        <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold">{chats.length}</span>
                    </div>

                    {chats.length === 0 ? (
                        <div className="px-2 py-8 text-center bg-white/50 rounded-2xl border border-dashed border-slate-200">
                            <MessageSquare size={24} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Диалогов нет</p>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => loadHistory(chat.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group relative ${currentChatId === chat.id
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                                    : 'text-slate-600 hover:bg-white hover:shadow-md border border-transparent'
                                    }`}
                            >
                                {currentChatId === chat.id && (
                                    <motion.div
                                        layoutId="active-chat"
                                        className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full"
                                    />
                                )}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${currentChatId === chat.id ? 'bg-white/10' : 'bg-slate-200/50 group-hover:bg-indigo-50'}`}>
                                    <MessageSquare size={14} className={currentChatId === chat.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="font-bold text-sm block truncate leading-tight">{chat.title || 'Новый диалог'}</span>
                                    <span className={`text-[9px] block uppercase tracking-wider font-bold mt-0.5 ${currentChatId === chat.id ? 'text-indigo-300' : 'text-slate-300'}`}>
                                        {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString() : 'Недавно'}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </motion.aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative bg-white">
                {/* Toggle Sidebar Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -left-4 top-10 z-10 w-8 h-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-xl transition-all"
                >
                    <ChevronLeft size={18} className={`transition-transform duration-300 ${isSidebarOpen ? '' : 'rotate-180'}`} />
                </button>

                {/* Chat Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md bg-indigo-50 border-2 border-white ring-4 ring-slate-50">
                            <img src={avatarBase} alt="Asol" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black text-slate-900 leading-tight">Ассоль</h2>
                                <Sparkles size={14} className="text-indigo-400" />
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Онлайн помощник</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
                    {loadingHistory ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                            <div className="relative">
                                <Loader2 size={48} className="animate-spin text-indigo-500" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                                </div>
                            </div>
                            <p className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Синхронизация истории</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {messages.length === 0 && !currentChatId && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto"
                                >
                                    <div className="w-24 h-24 rounded-[2.5rem] bg-white flex items-center justify-center text-indigo-500 mb-8 border border-slate-100 shadow-2xl relative">
                                        <img src={avatarBase} alt="Asol" className="w-full h-full object-cover rounded-[2.5rem]" />
                                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-full border-4 border-white shadow-lg">
                                            <Sparkles size={16} className="text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-3 family-outfit tracking-tight leading-tight">Я ваша <span className="text-indigo-600">Ассоль</span></h3>
                                    <p className="text-slate-500 font-bold leading-relaxed px-6">Ваш персональный интеллект под алыми парусами. Чем займемся сегодня?</p>
                                </motion.div>
                            )}
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={msg.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-[1.25rem] flex-shrink-0 flex items-center justify-center shadow-lg overflow-hidden border-2 border-white ring-4 ring-slate-50 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white'}`}>
                                        {msg.role === 'user' ? <User size={24} /> : <img src={avatarBase} alt="Asol" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex flex-col max-w-[75%] gap-2.5">
                                        <div className={`px-8 py-6 rounded-[2rem] text-[15px] font-bold leading-relaxed ${msg.role === 'user'
                                                ? 'bg-slate-900 text-white shadow-2xl shadow-indigo-100/50'
                                                : 'bg-white text-slate-800 border border-slate-100 shadow-xl shadow-slate-200/50'
                                            }`}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        {msg.cost > 0 && (
                                            <div className={`flex items-center gap-2 px-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                <div className="h-[1px] w-4 bg-slate-200" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                                    {msg.cost.toFixed(3)} ₽
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-5"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                                        <img src={avatarBase} alt="Asol" className="w-full h-full object-cover opacity-50" />
                                    </div>
                                    <div className="px-8 py-5 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-8 border-t border-slate-50 bg-white">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Задайте ваш вопрос Ассоль..."
                            disabled={loading}
                            className="w-full pl-8 pr-20 py-5 bg-slate-50 border border-transparent rounded-[2.5rem] focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 transition-all font-bold text-slate-700 shadow-sm"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="bg-slate-900 text-white p-4 rounded-full hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-30 disabled:hover:bg-slate-900 active:scale-95"
                            >
                                {loading ? <Loader2 size={22} className="animate-spin" /> : <Send size={22} />}
                            </button>
                        </div>
                    </form>
                    <p className="mt-4 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        ИИ может ошибаться. Проверяйте важную информацию.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Chat;
