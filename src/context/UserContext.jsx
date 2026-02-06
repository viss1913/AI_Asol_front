import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    const refreshProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setBalance(0);
            setLoading(false);
            return;
        }

        try {
            const profile = await authService.getProfile();
            setUser(profile);
            setBalance(profile.balance);
        } catch (error) {
            console.error('Failed to refresh profile:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                setUser(null);
                setBalance(0);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshProfile();
    }, []);

    const updateBalance = (newBalance) => {
        setBalance(newBalance);
    };

    return (
        <UserContext.Provider value={{ user, balance, loading, refreshProfile, updateBalance }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
