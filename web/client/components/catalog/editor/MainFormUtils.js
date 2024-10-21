import url from 'url';
/**
 * Check if the URL typed is valid or not
 * @param {string} catalogUrl The URL of the catalog
 * @param {string} currentLocation The current location, by default `window.location.href`
 * @param {boolean} allowUnsecureLayers flag to allow unsecure url
 * @returns {object} {valid: boolean, errorMsgId: string}
 */
export const checkUrl = (catalogUrl = '', currentLocation, allowUnsecureLayers) => {
    try {
        const { protocol: mapStoreProtocol } = url.parse(currentLocation ?? window.location.href);
        const { protocol: catalogProtocol } = url.parse(catalogUrl);
        if (mapStoreProtocol === 'https:' && !!catalogProtocol) {
            const isProtocolValid = (mapStoreProtocol === catalogProtocol || allowUnsecureLayers);
            return isProtocolValid ? {valid: true} : {valid: false, errorMsgId: "catalog.invalidUrlHttpProtocol"};
        }
        return {valid: true};
    } catch (e) {
        return {valid: false, errorMsgId: "catalog.invalidArrayUsageForUrl"};
    }
};
