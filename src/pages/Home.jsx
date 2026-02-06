import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Play, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const Home = () => {
  const navigate = useNavigate();

  const dummyProjects = [
    { id: 1, title: 'Профессиональное промо видео', type: 'video', date: '2 часа назад', preview: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800' },
    { id: 2, title: 'Логотип для тех-стартапа', type: 'image', date: 'Вчера', preview: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800' },
    { id: 3, title: 'Анимация продукта Apple', type: 'video', date: '3 дня назад', preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 min-h-screen">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl mb-2 text-slate-900 font-bold family-outfit">Привет, Маркетолог 👋</h1>
          <p className="text-slate-500 font-medium tracking-tight">Управляйте своими проектами и создавайте новые шедевры.</p>
        </div>
        <Button size="lg" onClick={() => navigate('/editor')} className="h-14">
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
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/5 transition-all shadow-sm"
          />
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-medium shadow-sm active:scale-95">
          <Filter size={18} />
          Фильтры
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dummyProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-100">
              <img src={project.preview} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                {project.type === 'video' ? (
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#6366f1] shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                    <Play fill="currentColor" size={24} className="ml-1" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#6366f1] shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/20 ${project.type === 'video' ? 'bg-indigo-500/80 text-white' : 'bg-emerald-500/80 text-white'
                  }`}>
                  {project.type === 'video' ? 'Video' : 'Image'}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg text-slate-900 font-semibold line-clamp-1 family-outfit">{project.title}</h3>
                <button className="text-slate-400 hover:text-slate-900 transition-colors p-1">
                  <MoreVertical size={18} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-sm font-medium">{project.date}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* New Project Creator Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dummyProjects.length * 0.1, duration: 0.5 }}
          onClick={() => navigate('/editor')}
          className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 py-12 group hover:border-[#6366f1] hover:bg-[#6366f1]/5 transition-all cursor-pointer min-h-[250px]"
        >
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#6366f1] group-hover:text-white transition-all">
            <Plus size={32} />
          </div>
          <p className="font-semibold text-slate-500 group-hover:text-[#6366f1]">Новый проект</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
