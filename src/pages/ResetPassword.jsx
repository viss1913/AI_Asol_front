import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';
import { authService } from '../services/api';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Токен сброса пароля не найден. Пожалуйста, запросите новую ссылку.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        if (newPassword.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await authService.resetPassword(token, newPassword);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('Reset password error:', err);
            setError(err.response?.data?.message || 'Не удалось сбросить пароль. Токен может быть недействительным или истекшим.');
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
                            Новый пароль
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Введите новый пароль для вашего аккаунта
                        </p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366f1] transition-colors" size={18} />
                                    <input
                                        type="password"
                                        placeholder="Новый пароль"
                                        required
                                        disabled={!token}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/5 outline-none transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366f1] transition-colors" size={18} />
                                    <input
                                        type="password"
                                        placeholder="Подтвердите пароль"
                                        required
                                        disabled={!token}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/5 outline-none transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
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
                            </AnimatePresence>

                            <Button type="submit" className="w-full py-4 h-14" disabled={loading || !token}>
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Сбросить пароль
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-slate-400 font-bold hover:text-[#6366f1] transition-colors text-sm uppercase tracking-wider"
                                >
                                    Вернуться к входу
                                </button>
                            </div>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-6"
                        >
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="text-green-600" size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Пароль успешно изменен!</h3>
                                <p className="text-slate-500 font-medium">
                                    Вы будете перенаправлены на страницу входа через 3 секунды...
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate('/login')}
                                className="w-full py-4 h-14"
                            >
                                Войти сейчас
                            </Button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
