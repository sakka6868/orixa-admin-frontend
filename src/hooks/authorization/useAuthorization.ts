import {useCallback, useEffect, useState} from "react";

const AUTH_STORAGE_KEY = "USER_AUTHORIZATION";
type AuthorizationState = Authorization | undefined;
type AuthorizationListener = () => void;

const listeners = new Set<AuthorizationListener>();

const readStoredAuthorization = (): AuthorizationState => {
    try {
        const storedAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
        return storedAuth ? JSON.parse(storedAuth) : undefined;
    } catch (error) {
        console.error("Failed to parse stored authorization", error);
        return undefined;
    }
};

let authorizationStore: AuthorizationState = readStoredAuthorization();

const emitAuthorizationChange = (): void => {
    listeners.forEach((listener) => listener());
};

const persistAuthorization = (authorization: AuthorizationState): void => {
    if (authorization) {
        try {
            sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authorization));
        } catch (error) {
            console.error("Failed to store authorization", error);
        }
    } else {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
};

const setAuthorizationStore = (nextState: AuthorizationState): void => {
    authorizationStore = nextState;
    persistAuthorization(nextState);
    emitAuthorizationChange();
};

/**
 * Use Authorization
 * @returns {object}
 */
export const useAuthorization = (): {
    authorization: Authorization | undefined,
    resetAuthorization: (nextState: Authorization | undefined) => void
} => {
    const [authorization, setAuthorization] = useState<AuthorizationState>(authorizationStore);

    useEffect(() => {
        const syncAuthorization = (): void => {
            setAuthorization(authorizationStore);
        };

        listeners.add(syncAuthorization);

        const onStorage = (event: StorageEvent): void => {
            if (event.key === AUTH_STORAGE_KEY) {
                authorizationStore = readStoredAuthorization();
                emitAuthorizationChange();
            }
        };

        window.addEventListener("storage", onStorage);

        return () => {
            listeners.delete(syncAuthorization);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    const resetAuthorization = useCallback((nextState: Authorization | undefined) => {
        setAuthorizationStore(nextState);
    }, []);

    return {authorization, resetAuthorization};
};
