import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Sparkles } from 'lucide-react';
import Button from './common/Button';
import { paymentService } from '../services/api';

const TopUpModal = ({ isOpen, onClose }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const presetAmounts = [100, 500, 1000, 5000];

    const handlePresetClick = (preset) => {
        setAmount(preset.toString());
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const numAmount = parseInt(amount);

        if (!numAmount || numAmount < 100) {
            setError('Минимальная сумма пополнения — 100₽');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { paymentUrl } = await paymentService.initPayment(numAmount);
            // Redirect to T-Bank payment page
            window.location.href = paymentUrl;
        } catch (err) {
            console.error('Payment init error:', err);
            setError(err.response?.data?.message || 'Не удалось инициировать платеж. Попробуйте позже.');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="text-white" size={28} />
                        </div>
                        <h2 className="text-3xl font-bold family-outfit text-slate-900 mb-2">
                            Пополнить баланс
                        </h2>
                        <p className="text-slate-500 font-medium">
                            Выберите сумму или введите свою
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Preset amounts */}
                        <div className="grid grid-cols-4 gap-3">
                            {presetAmounts.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => handlePresetClick(preset)}
                                    className={`
                                        py-3 px-2 rounded-xl font-bold text-sm transition-all
                                        ${amount === preset.toString()
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                                        }
                                    `}
                                >
                                    {preset}₽
                                </button>
                            ))}
                        </div>

                        {/* Custom amount input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                                Или введите сумму
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="100"
                                    step="1"
                                    placeholder="Минимум 100₽"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setError(null);
                                    }}
                                    className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all font-bold text-lg"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                                    ₽
                                </span>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit button */}
                        <Button
                            type="submit"
                            className="w-full py-4 h-14"
                            disabled={loading || !amount}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Пополнить {amount ? `${amount}₽` : ''}
                                    <Sparkles size={18} />
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-slate-400 text-center">
                            Вы будете перенаправлены на страницу оплаты T-Bank
                        </p>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TopUpModal;
