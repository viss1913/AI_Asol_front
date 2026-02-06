import { LayoutDashboard, FileVideo, Wallet, User as UserIcon, LogIn, LogOut, MessageSquare, BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { useUser } from '../../context/UserContext';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const { balance } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    { name: 'Проекты', path: '/projects', icon: LayoutDashboard },
  ];

  const navItems = isAuthenticated ? authItems : guestItems;

  const isChatPage = location.pathname === '/chat';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isChatPage ? 'p-2' : 'px-6 py-4'} font-primary`}>
      <div className={`mx-auto bg-white shadow-lg border border-slate-100 transition-all duration-300 ${isChatPage ? 'max-w-full rounded-xl px-4 py-1.5' : 'max-w-7xl rounded-2xl px-6 py-2.5'} flex items-center justify-between relative`}>
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`overflow-hidden rounded-xl bg-white flex items-center justify-center p-1 shadow-sm group-hover:scale-105 transition-transform duration-300 ${isChatPage ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <img src={logo} alt="AI Asol Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`${isChatPage ? 'text-lg' : 'text-xl'} font-bold tracking-tight family-outfit text-slate-900 group-hover:text-indigo-600 transition-colors`}>
              AI Asol
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              item.external ? (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 transition-all font-bold text-sm"
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                </a>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${location.pathname === item.path
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  <item.icon size={16} />
                  <span>{item.name}</span>
                </Link>
              )
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                <Wallet size={14} className="text-indigo-500" />
                <span className="text-xs font-black text-slate-800 tracking-tighter">{balance.toLocaleString()} ₽</span>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/';
                }}
                className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-red-500 font-black transition-colors text-[9px] uppercase tracking-widest"
              >
                <LogOut size={14} />
                <span>Выход</span>
              </button>
            </>
          ) : (
            <Link to="/auth" className="hidden sm:block">
              <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-xs">
                <LogIn size={16} />
                Войти
              </button>
            </Link>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl p-4 flex flex-col gap-2 lg:hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${location.pathname === item.path
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            ))}
            {!isAuthenticated && (
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm">
                  <LogIn size={18} />
                  Войти
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
