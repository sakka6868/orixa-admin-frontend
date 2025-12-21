import { useCallback, useState, useEffect } from "react";

const AUTH_STORAGE_KEY = "USER_AUTHORIZATION";

/**
 * Use Authorization
 * @returns {object}
 */
export const useAuthorization = (): {
    authorization: Authorization | undefined,
    resetAuthorization: (nextState: Authorization | undefined) => void
} => {
    // Authorization with localStorage persistence
    const [authorization, setAuthorization] = useState<Authorization | undefined>(() => {
        try {
            const storedAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
            return storedAuth ? JSON.parse(storedAuth) : undefined;
        } catch (error) {
            console.error("Failed to parse stored authorization", error);
            return undefined;
        }
    });

    // Update localStorage when authorization changes
    useEffect(() => {
        if (authorization) {
            try {
                sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authorization));
            } catch (error) {
                console.error("Failed to store authorization", error);
            }
        } else {
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }, [authorization]);

    // Reset User Auth
    const resetAuthorization = useCallback((nextState: Authorization | undefined) => {
        setAuthorization(nextState);
    }, []);

    // Return
    return { authorization, resetAuthorization };
};