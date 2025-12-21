import {requesterInstance} from './NetworkRequester.ts';

const FoundationApi = {
    getCurrentUser: async (token: string): Promise<Authorization> => {
        return await requesterInstance.get(`/foundation/users/current`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    }
}

export default FoundationApi;
