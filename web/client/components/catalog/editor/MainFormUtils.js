export const defaultPlaceholder = (service) => {
    let urlPlaceholder = {
        wfs: "example: https://mydomain.com/geoserver/wfs",
        wmts: "example: https://mydomain.com/geoserver/gwc/service/wmts",
        wms: "example: https://mydomain.com/geoserver/wms",
        csw: "example: https://mydomain.com/geoserver/csw"
    };
    for ( const [key, value] of Object.entries(urlPlaceholder)) {
        if ( key === service.type) {
            return value;
        }
    }
    return true;
};
