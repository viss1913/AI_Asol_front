import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { authService } from '../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authService.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            console.error('Forgot password error:', err);
            setError(err.response?.data?.message || 'Не удалось отправить письмо. Проверьте email.');
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
                            Забыли пароль?
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Введите ваш email, и мы отправим ссылку для сброса пароля
                        </p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366f1] transition-colors" size={18} />
                                    <input
                                        type="email"
                                        placeholder="Email адрес"
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/5 outline-none transition-all font-medium"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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

                            <Button type="submit" className="w-full py-4 h-14" disabled={loading}>
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Отправить письмо
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
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Письмо отправлено!</h3>
                                <p className="text-slate-500 font-medium">
                                    Проверьте ваш email <strong>{email}</strong> и перейдите по ссылке для сброса пароля.
                                </p>
                                <p className="text-slate-400 text-sm mt-4">
                                    Ссылка действительна в течение 1 часа.
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate('/login')}
                                variant="outline"
                                className="w-full py-4 h-14"
                            >
                                Вернуться к входу
                            </Button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
