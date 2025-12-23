import {requesterWithAuthenticationInstance} from './NetworkRequester.ts';

const FoundationApi = {
    getCurrentUser: async (): Promise<Authorization> => {
        return await requesterWithAuthenticationInstance.get(`/foundation/users/current`);
    }
}

export default FoundationApi;
