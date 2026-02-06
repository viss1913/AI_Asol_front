import { LayoutDashboard, FileVideo, Wallet, User as UserIcon, LogIn, LogOut, MessageSquare, BookOpen } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  // Динамические пункты меню в зависимости от авторизации
  const guestItems = [
    { name: 'Продукты', path: '/#products', icon: LayoutDashboard },
    { name: 'AI Book', path: 'https://aibook.ai-asol.ru/', icon: BookOpen, external: true },
  ];

  const authItems = [
    { name: 'Studio', path: '/studio', icon: FileVideo },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
  ];

  const navItems = isAuthenticated ? authItems : guestItems;

  const handleLogout = () => {
    authService.logout();
    setToken(null); // Если прокинем сеттер, то обновит сразу. Но пока так.
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-8 py-3 flex items-center justify-between shadow-xl border border-white/40">
        <div className="flex items-center gap-10">
          <Link to="/" className="text-2xl font-bold tracking-tight family-outfit text-slate-900">
            <span className="bg-accent-gradient bg-clip-text text-transparent">
              AI Asol
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              item.external ? (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-all font-medium"
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </a>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${location.pathname === item.path
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              )
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <Wallet size={16} className="text-[#6366f1]" />
                <span className="text-sm font-bold text-slate-800">500 </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">₽</span>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold transition-colors text-[10px] uppercase tracking-widest pl-2"
              >
                <LogOut size={16} />
                <span>Выход</span>
              </button>
            </>
          ) : (
            <Link to="/auth">
              <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-sm">
                <LogIn size={18} />
                Войти
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
