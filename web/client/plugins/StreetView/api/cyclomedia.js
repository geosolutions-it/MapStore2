import {CYCLOMEDIA_CREDENTIALS_REFERENCE} from '../constants';
import { setCredentials } from '../../../utils/SecurityUtils';
let API;
// https://streetsmart.cyclomedia.com/api/v23.14/documentation/
export const loadAPI = ({apiKey, providerSettings = {}}) => import('@cyclomedia/streetsmart-api').then((module) => {
    const {username, password} = providerSettings;
    API = module.default;
    // const encodedCredentials = btoa(`${username}:${password}`);
    setCredentials(CYCLOMEDIA_CREDENTIALS_REFERENCE, {username, password});
    return API;
});
export const getAPI = () => API;
export const getLocation = () => ({});

