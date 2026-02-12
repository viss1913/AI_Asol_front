import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import { useUser } from '../context/UserContext';
import { authService } from '../services/api';

const Auth = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { login, register, updateUser } = useUser();

    // Determine mode based on URL, default to login
    const isRegisterPath = location.pathname === '/register';
    const [isLogin, setIsLogin] = useState(!isRegisterPath);

    // Verification state
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [successMessage, setSuccessMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted', { isLogin, formData });
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isLogin) {
                console.log('Attempting login...');
                await login({ email: formData.email, password: formData.password });
                console.log('Login successful');
                console.log('Navigating to /');
                navigate('/');
            } else {
                console.log('Attempting register...');
                await register(formData);
                console.log('Register successful');
                // Instead of redirecting to login, show verification step
                setIsVerifying(true);
                setSuccessMessage('Код подтверждения отправлен на вашу почту.');
            }
        } catch (err) {
            console.error('Auth error:', err);
            // Handle specific "Email not verified" error from login
            if (isLogin && err.response?.status === 403 && (err.response?.data?.message?.includes('not verified') || err.response?.data?.error?.includes('not verified'))) {
                setIsVerifying(true);
                setError('Email не подтвержден. Введите код из письма.');
            } else {
                setError(err.response?.data?.message || err.message || 'Что-то пошло не так. Проверьте данные.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyParams = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null); // Clear previous success message (like "Code sent")
        try {
            const response = await authService.verifyEmail(formData.email, verificationCode);
            // Update user context state manually since we are outside the provider's login flow for a moment
            if (response.user) {
                updateUser(response.user);
            }
            setSuccessMessage('Email подтвержден! Бонус 200₽ получен.');
            setTimeout(() => {
                navigate('/video');
            }, 1500);
        } catch (err) {
            console.error('Verification error:', err);
            setError(err.response?.data?.message || 'Неверный код или срок действия истек.');
        } finally {
            setLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50 pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full"
                >
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-slate-100">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                                <Mail size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Подтвердите Email</h2>
                            <p className="text-slate-500 font-medium text-sm">
                                Мы отправили 6-значный код на <span className="text-indigo-600 font-bold">{formData.email}</span>
                            </p>
                        </div>

                        <form onSubmit={handleVerifyParams} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Код из письма</label>
                                <input
                                    type="text"
                                    placeholder="123456"
                                    maxLength={6}
                                    className="w-full text-center text-2xl tracking-[0.5em] font-black py-4 rounded-2xl border border-slate-200 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/5 outline-none transition-all"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>

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
                                {successMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-2 p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-bold"
                                    >
                                        <Sparkles size={16} />
                                        {successMessage}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button type="submit" className="w-full py-4 h-14" disabled={loading || verificationCode.length !== 6}>
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Подтвердить'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setIsVerifying(false)}
                                className="text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors"
                            >
                                Вернуться назад
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

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
                            {isLogin ? 'Войдите, чтобы продолжить творчество' : 'Создайте аккаунт и получите 200₽ бонусом'}
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

                        {isLogin && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-sm text-slate-400 hover:text-[#6366f1] font-bold transition-colors"
                                >
                                    Забыли пароль?
                                </button>
                            </div>
                        )}

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
                            {successMessage && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-2 p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-bold"
                                >
                                    <Sparkles size={16} />
                                    {successMessage}
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
                            onClick={() => {
                                setIsLogin(!isLogin);
                                navigate(isLogin ? '/register' : '/login');
                            }}
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
