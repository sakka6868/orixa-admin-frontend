import {useCallback, useState} from "react";

/**
 * User Auth
 * @returns {object}
 */
export const useAuth = () => {
    //  User Auth
    const [userAuth, setUserAuth] = useState<UserAuth>();
    //  Reset User Auth
    const resetUserAuth = useCallback((nextState: UserAuth) => setUserAuth(nextState), []);
    //  Return
    return {userAuth, resetUserAuth};
};


