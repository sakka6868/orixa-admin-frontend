import { useCallback, useEffect, useState } from 'react';
import SystemApi from '../api/SystemApi';
import { StaffListItem } from '../types/staff';

const CACHE_KEY = 'CURRENT_STAFF_CACHE';
const TOKEN_KEY = 'USER_TOKEN';

interface UseCurrentStaffReturn {
    staff: StaffListItem | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    clearCache: () => void;
}

/**
 * 检查用户是否已登录（通过检查 token 是否存在）
 */
const isAuthenticated = (): boolean => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    return !!token;
};

export const useCurrentStaff = (): UseCurrentStaffReturn => {
    const [staff, setStaff] = useState<StaffListItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    /**
     * 从 sessionStorage 获取缓存的 staff 对象
     */
    const getFromCache = useCallback((): StaffListItem | null => {
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                return JSON.parse(cached) as StaffListItem;
            }
        } catch (err) {
            console.warn('Failed to parse cached staff:', err);
        }
        return null;
    }, []);

    /**
     * 将 staff 对象保存到 sessionStorage
     */
    const saveToCache = useCallback((staffData: StaffListItem): void => {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(staffData));
        } catch (err) {
            console.warn('Failed to cache staff:', err);
        }
    }, []);

    /**
     * 清除 sessionStorage 中的缓存
     */
    const clearCache = useCallback((): void => {
        try {
            sessionStorage.removeItem(CACHE_KEY);
            setStaff(null);
        } catch (err) {
            console.warn('Failed to clear cached staff:', err);
        }
    }, []);

    /**
     * 从 API 获取当前员工信息，优先使用缓存
     */
    const fetchCurrentStaff = useCallback(async (forceRefresh = false): Promise<void> => {
        // 检查是否已登录，未登录则不执行获取操作
        if (!isAuthenticated()) {
            setStaff(null);
            setLoading(false);
            setError(null);
            return;
        }

        // 如果已有缓存且不强制刷新，直接使用缓存
        if (!forceRefresh) {
            const cachedStaff = getFromCache();
            if (cachedStaff) {
                setStaff(cachedStaff);
                setLoading(false);
                setError(null);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const currentStaff = await SystemApi.getCurrentStaff();
            saveToCache(currentStaff);
            setStaff(currentStaff);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            console.error('Failed to fetch current staff:', err);
        } finally {
            setLoading(false);
        }
    }, [getFromCache, saveToCache]);

    /**
     * 手动刷新，强制从 API 重新获取
     */
    const refetch = useCallback(async (): Promise<void> => {
        await fetchCurrentStaff(true);
    }, [fetchCurrentStaff]);

    /**
     * 组件挂载时自动获取 staff
     * 使用 setTimeout 0 确保在下一个事件循环执行，避免登录后立即调用时的时序问题
     */
    useEffect(() => {
        // 检查是否已登录
        if (!isAuthenticated()) {
            return;
        }

        // 延迟到下一个事件循环，确保登录回调中的 token 和状态都已完全设置
        const timer = setTimeout(() => {
            fetchCurrentStaff().then(() => {console.log('Current staff fetched')});
        }, 0);

        return () => clearTimeout(timer);
    }, [fetchCurrentStaff]);

    return {
        staff,
        loading,
        error,
        refetch,
        clearCache
    };
};

