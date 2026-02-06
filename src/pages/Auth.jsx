import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { authService } from '../services/api';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                await authService.login({ email: formData.email, password: formData.password });
            } else {
                await authService.register(formData);
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Что-то пошло не так. Проверьте данные.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50 pt-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold family-outfit mb-2 text-slate-900">
                            {isLogin ? 'С возвращением!' : 'Присоединяйтесь'}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {isLogin ? 'Войдите, чтобы продолжить творчество' : 'Создайте аккаунт и получите 500₽ бонусом'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366f1] transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Ваше имя"
                                            required
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/5 outline-none transition-all font-medium"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366f1] transition-colors" size={18} />
                                <input
                                    type="email"
                                    placeholder="Email адрес"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/5 outline-none transition-all font-medium"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366f1] transition-colors" size={18} />
                                <input
                                    type="password"
                                    placeholder="Пароль"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/5 outline-none transition-all font-medium"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366f1] transition-colors" size={18} />
                                        <input
                                            type="password"
                                            placeholder="Подтвердите пароль"
                                            required
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/5 outline-none transition-all font-medium"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold"
                                >
                                    <AlertCircle size={16} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button type="submit" className="w-full py-4 h-14" disabled={loading}>
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Войти' : 'Создать аккаунт'}
                                    {isLogin ? <ArrowRight size={18} /> : <Sparkles size={18} />}
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-slate-400 font-bold hover:text-[#6366f1] transition-colors text-sm uppercase tracking-wider"
                        >
                            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
