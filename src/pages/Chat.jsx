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
        <div className="flex h-screen bg-white pt-24 overflow-hidden font-primary">
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

                <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
                    <h3 className="px-2 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ваши диалоги</h3>
                    {chats.length === 0 ? (
                        <p className="px-2 text-sm text-slate-400 font-medium italic">Список чатов пуст</p>
                    ) : (
                        chats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => loadHistory(chat.id)}
                                className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all flex items-center gap-3 ${currentChatId === chat.id
                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                        : 'text-slate-600 hover:bg-white hover:shadow-sm border border-transparent'
                                    }`}
                            >
                                <MessageSquare size={18} className={currentChatId === chat.id ? 'text-indigo-600' : 'text-slate-400'} />
                                <span className="font-bold text-sm truncate">{chat.title || 'Новый чат'}</span>
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
                <div className="px-8 py-4 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <img src={avatarBase} alt="Asol" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900">Ассоль</h2>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Онлайн</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {loadingHistory ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                            <Loader2 size={40} className="animate-spin text-indigo-500" />
                            <p className="font-bold text-sm uppercase tracking-widest">Загрузка истории...</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {messages.length === 0 && !currentChatId && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    class="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto"
                                >
                                    <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-6 border border-indigo-100 overflow-hidden shadow-lg">
                                        <img src={avatarBase} alt="Asol" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2 family-outfit">Я готова помочь вам!</h3>
                                    <p className="text-slate-500 font-medium whitespace-pre-line">Задайте вопрос, и я помогу вам с текстами, маркетингом или идеями.</p>
                                </motion.div>
                            )}
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={msg.id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100'}`}>
                                        {msg.role === 'user' ? <User size={24} /> : <img src={avatarBase} alt="Asol" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex flex-col max-w-[80%] gap-2">
                                        <div className={`px-8 py-5 rounded-3xl ${msg.role === 'user'
                                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                                                : 'bg-slate-50 text-slate-800 border border-slate-100 shadow-sm'
                                            }`}>
                                            <p className="font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        {msg.cost > 0 && (
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'} text-slate-300`}>
                                                Стоимость: {msg.cost.toFixed(3)} ₽
                                            </span>
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
