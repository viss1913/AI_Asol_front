import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Plus, Clock, MessageSquare, Image as ImageIcon, Video, ArrowRight, Trash2, Search, Filter, Loader2, CreditCard } from 'lucide-react';
import { projectService } from '../services/api';
import Button from '../components/common/Button';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectDetails, setProjectDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const data = await projectService.list();
            setProjects(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        try {
            const project = await projectService.create({ title: newTitle });
            setProjects([project, ...projects]);
            setNewTitle('');
            setIsCreating(false);
            handleSelectProject(project);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectProject = async (project) => {
        setSelectedProject(project);
        setLoadingDetails(true);
        try {
            const details = await projectService.getDetails(project.id);
            setProjectDetails(details);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingDetails(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        Мои <span className="bg-accent-gradient bg-clip-text text-transparent">Проекты</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed">
                        Управляйте своим контентом и идеями в структурированном виде.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#6366f1] text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-[#4f46e5] transition-all active:scale-95 self-start md:self-center"
                >
                    <Plus size={20} />
                    Новый проект
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Projects List */}
                <div className="lg:col-span-4 space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="text-indigo-600 animate-spin" size={32} />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center p-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                                <Folder size={32} />
                            </div>
                            <p className="text-slate-500 font-bold">Проектов пока нет</p>
                        </div>
                    ) : (
                        projects.map(project => (
                            <motion.div
                                key={project.id}
                                onClick={() => handleSelectProject(project)}
                                whileHover={{ y: -4 }}
                                className={`p-6 rounded-[2rem] border transition-all cursor-pointer ${selectedProject?.id === project.id
                                        ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-50 ring-1 ring-indigo-50'
                                        : 'bg-white border-slate-100 hover:border-indigo-100'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-2xl ${selectedProject?.id === project.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                        <Folder size={24} />
                                    </div>
                                    <ArrowRight size={20} className={selectedProject?.id === project.id ? 'text-indigo-400' : 'text-slate-300'} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-1">{project.title}</h3>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                        <ImageIcon size={14} />
                                        <span>{project.mediaCount || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                        <MessageSquare size={14} />
                                        <span>{project.chatsCount || 0}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Project Details */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {!selectedProject ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center"
                            >
                                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                                    <Search size={48} />
                                </div>
                                <h3 className="text-xl font-black text-slate-400 mb-2">Выберите проект</h3>
                                <p className="text-slate-400 font-medium">Для просмотра содержимого</p>
                            </motion.div>
                        ) : loadingDetails ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex items-center justify-center p-12"
                            >
                                <Loader2 className="text-indigo-600 animate-spin" size={48} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={selectedProject.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                            {selectedProject.title}
                                        </h2>
                                        <button className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={24} />
                                        </button>
                                    </div>

                                    {/* Project Stats Summary */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                                        <div className="bg-indigo-50/50 p-4 rounded-3xl border border-indigo-50">
                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Медиа</p>
                                            <p className="text-2xl font-black text-indigo-600">{projectDetails?.media?.length || 0}</p>
                                        </div>
                                        <div className="bg-purple-50/50 p-4 rounded-3xl border border-purple-50">
                                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Диалоги</p>
                                            <p className="text-2xl font-black text-purple-600">{projectDetails?.chats?.length || 0}</p>
                                        </div>
                                    </div>

                                    {/* Content Tabs / List */}
                                    <div className="space-y-10">
                                        {/* Media Section */}
                                        {projectDetails?.media?.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <Sparkles size={16} className="text-indigo-500" />
                                                    Генерации
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {projectDetails.media.map((item, idx) => (
                                                        <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                                                            {item.type === 'video' ? (
                                                                <video src={item.url} className="w-full h-full object-cover" muted />
                                                            ) : (
                                                                <img src={item.url} className="w-full h-full object-cover" alt="" />
                                                            )}
                                                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                <button className="p-2 bg-white rounded-xl text-slate-900">
                                                                    {item.type === 'video' ? <Video size={18} /> : <ImageIcon size={18} />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Chats Section */}
                                        {projectDetails?.chats?.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                    <MessageSquare size={16} className="text-purple-500" />
                                                    Диалоги
                                                </h4>
                                                <div className="space-y-3">
                                                    {projectDetails.chats.map((chat, idx) => (
                                                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-slate-100/50 transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400">
                                                                    <MessageSquare size={20} />
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">
                                                                        {chat.title || 'Новый диалог'}
                                                                    </h5>
                                                                    <p className="text-[10px] text-slate-400 font-medium">
                                                                        {new Date(chat.updated_at).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <ArrowRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {(!projectDetails?.media?.length && !projectDetails?.chats?.length) && (
                                            <div className="py-20 text-center">
                                                <p className="text-slate-400 font-bold">В проекте пока пусто</p>
                                                <button className="mt-4 text-indigo-600 font-bold text-sm underline">
                                                    Начать работу
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Create Project Modal */}
            <AnimatePresence>
                {isCreating && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreating(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10"
                        >
                            <div className="p-8">
                                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Новый проект</h3>
                                <form onSubmit={handleCreate} className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                                            Название проекта
                                        </label>
                                        <input
                                            autoFocus
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="Напр., Видео для Instagram"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreating(false)}
                                            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all"
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] py-4 bg-[#6366f1] text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-[#4f46e5] transition-all"
                                        >
                                            Создать
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Projects;
