import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { historyService } from '../services/api';
import { useUser } from './UserContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]); // [{id, type, prompt, status, progress, timestamp, cost}]
    const { updateBalance, refreshProfile } = useUser();
    const pollingIntervals = useRef({});

    // Load active tasks from session storage if needed (optional)
    useEffect(() => {
        const savedTasks = sessionStorage.getItem('active_tasks');
        if (savedTasks) {
            const parsed = JSON.parse(savedTasks);
            // Re-start polling for pending tasks
            parsed.forEach(task => {
                if (task.status === 'processing' || task.status === 'starting') {
                    startPolling(task.id);
                }
            });
            setTasks(parsed);
        }

        return () => {
            // Cleanup intervals on unmount
            Object.values(pollingIntervals.current).forEach(clearInterval);
        };
    }, []);

    // Persist tasks to session storage
    useEffect(() => {
        sessionStorage.setItem('active_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const startPolling = (taskId) => {
        if (pollingIntervals.current[taskId]) return;

        const interval = setInterval(async () => {
            try {
                const statusData = await historyService.getTaskStatus(taskId);
                console.log(`Polling task ${taskId}:`, statusData);

                const status = statusData.status?.toLowerCase();
                if (status === 'success') {
                    stopPolling(taskId);
                    const url = statusData.url || statusData.resultUrl || statusData.video_url || statusData.image_url || (statusData.result?.[0]);

                    updateTask(taskId, {
                        status: 'success',
                        url,
                        cost: statusData.cost
                    });

                    // Always refresh profile to get updated balance from backend
                    await refreshProfile();

                    // Notification
                    if (Notification.permission === "granted") {
                        new Notification("Браво!", {
                            body: "Ваше видео готово!",
                            icon: "/logo.png"
                        });
                    }
                } else if (status === 'failed' || status === 'error') {
                    stopPolling(taskId);
                    updateTask(taskId, {
                        status: 'failed',
                        error: statusData.error || 'Ошибка генерации'
                    });
                }
            } catch (error) {
                console.error(`Error polling task ${taskId}:`, error);
                // We keep polling unless it's a structural error
            }
        }, 5000);

        pollingIntervals.current[taskId] = interval;
    };

    const stopPolling = (taskId) => {
        if (pollingIntervals.current[taskId]) {
            clearInterval(pollingIntervals.current[taskId]);
            delete pollingIntervals.current[taskId];
        }
    };

    const addTask = (taskData) => {
        const newTask = {
            ...taskData,
            status: 'processing',
            timestamp: Date.now(),
        };
        setTasks(prev => [newTask, ...prev].slice(0, 10)); // Keep only last 10 tasks in UI
        startPolling(taskData.id);

        // Request notification permission
        if (Notification.permission === "default") {
            Notification.requestPermission();
        }
    };

    const updateTask = (taskId, updates) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    };

    const removeTask = (taskId) => {
        stopPolling(taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, removeTask }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => useContext(TaskContext);
