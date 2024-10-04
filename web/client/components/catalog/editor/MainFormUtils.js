import url from 'url';

export const defaultPlaceholder = (service) => {
    let urlPlaceholder = {
        "wfs": "e.g. https://mydomain.com/geoserver/wfs",
        "wmts": "e.g. https://mydomain.com/geoserver/gwc/service/wmts",
        "wms": "e.g. https://mydomain.com/geoserver/wms",
        "csw": "e.g. https://mydomain.com/geoserver/csw",
        "tms": "e.g. https://mydomain.com/geoserver/gwc/service/tms/1.0.0",
        "3dtiles": "e.g. https://mydomain.com/tileset.json",
        "cog": "e.g. https://mydomain.com/cog.tif",
        "model": "e.g. https://mydomain.com/filename.ifc",
        "arcgis": "e.g. https://mydomain.com/arcgis/rest/services"
    };
    for ( const [key, value] of Object.entries(urlPlaceholder)) {
        if ( key === service.type) {
            return value;
        }
    }
    return true;
};

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
