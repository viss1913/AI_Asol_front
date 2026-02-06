import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Play, Image as ImageIcon, Loader2, Folder, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { projectService } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.list();
      setProjects(data || []);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    try {
      const project = await projectService.create({ title: newProjectTitle });
      navigate('/editor', { state: { projectId: project.id } });
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 min-h-screen">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl mb-2 text-slate-900 font-bold family-outfit tracking-tight">Привет, Маркетолог 👋</h1>
          <p className="text-slate-500 font-medium tracking-tight">Управляйте своими проектами и создавайте новые шедевры.</p>
        </div>
        <Button size="lg" onClick={() => setIsCreatingProject(true)} className="h-14 px-8 bg-[#6366f1] hover:bg-[#4f46e5]">
          <Plus size={20} />
          Создать проект
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
        <div className="w-full relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366f1] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Поиск по вашим шедеврам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/5 transition-all shadow-sm font-medium"
          />
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-bold shadow-sm active:scale-95 text-sm">
          <Filter size={18} />
          Фильтры
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
          <p className="text-slate-400 font-bold">Загрузка ваших шедевров...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              onClick={() => navigate('/editor', { state: { projectId: project.id } })}
              className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 ring-1 ring-slate-100/50"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-50">
                {project.preview ? (
                  <img src={project.preview} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                    <Folder size={64} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#6366f1] shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                    <Plus size={24} />
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/20 bg-indigo-500/80 text-white`}>
                    Project
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg text-slate-900 font-black line-clamp-1 family-outfit tracking-tight">{project.title}</h3>
                  <button className="text-slate-300 hover:text-slate-900 transition-colors p-1" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    <Clock size={12} />
                    <span>{new Date(project.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    <ImageIcon size={12} />
                    <span>{project.mediaCount || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* New Project Creator Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: filteredProjects.length * 0.05, duration: 0.5 }}
            onClick={() => setIsCreatingProject(true)}
            className="border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 py-12 group hover:border-[#6366f1] hover:bg-indigo-50/30 transition-all cursor-pointer min-h-[250px]"
          >
            <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#6366f1] group-hover:text-white transition-all shadow-sm">
              <Plus size={32} />
            </div>
            <p className="font-black text-slate-400 group-hover:text-[#6366f1] tracking-tight">Новый проект</p>
          </motion.div>
        </div>
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {isCreatingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreatingProject(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Новый проект</h3>
                  <button onClick={() => setIsCreatingProject(false)} className="text-slate-300 hover:text-slate-500">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleCreateProject} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                      Название проекта
                    </label>
                    <input
                      autoFocus
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      placeholder="Напр., Видео для Instagram"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-5 bg-[#6366f1] text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-[#4f46e5] transition-all active:scale-[0.98]"
                  >
                    Создать и продолжить
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
