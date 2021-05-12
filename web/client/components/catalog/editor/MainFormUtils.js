import url from 'url';

export const defaultPlaceholder = (service) => {
    let urlPlaceholder = {
        wfs: "e.g. https://mydomain.com/geoserver/wfs",
        wmts: "e.g. https://mydomain.com/geoserver/gwc/service/wmts",
        wms: "e.g. https://mydomain.com/geoserver/wms",
        csw: "e.g. https://mydomain.com/geoserver/csw",
        tms: "e.g. https://mydomain.com/geoserver/gwc/service/tms/1.0.0"
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
 * @returns {boolean} true if the URL is valid
 */
export const isValidURL = (catalogUrl = '', currentLocation) => {
    const { protocol: mapStoreProtocol } = url.parse(currentLocation ?? window.location.href);
    const { protocol: catalogProtocol } = url.parse(catalogUrl);
    if (mapStoreProtocol === 'https:' && !!catalogProtocol) {
        return mapStoreProtocol === catalogProtocol;
    }
    return true;
};
