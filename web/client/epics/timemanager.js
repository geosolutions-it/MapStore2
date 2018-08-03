
const { Observable } = require('rxjs');
const { updateLayerDimension, changeLayerProperties, ADD_LAYER} = require('../actions/layers');
const {SET_CURRENT_TIME} = require('../actions/timemanager');
const {describeDomains} = require('../api/MultiDim');
const {castArray} = require('lodash');
const domainsToDimensionsObject = ({ Domains = {} } = {}, {url} = {}) => {
    const dimensions = castArray(Domains.DimensionDomain || []);
    return dimensions.map( ({Identifier: name, Domain: domain} ) => ({
        source: {
            type: "multidim-extension",
            url
        },
        name,
        domain
    }));
};

module.exports = {
    updateLayerDimensionOnCurrentTimeSelection: action$ =>
        action$.ofType(SET_CURRENT_TIME).switchMap(({time}) => Observable.of(updateLayerDimension('time', time))),
    queryMultidimensionalAPIExtensionOnAddLayer: action$ =>
        action$
            .ofType(ADD_LAYER)
            .filter(
                ({ layer = {} } = {}) => layer.id && layer.url && layer.name && (layer.type === "wms" || layer.type === "wmts")
            )
            // every add layer has it's own flow
            .flatMap(({ layer = {} } = {}) =>
                describeDomains(layer.url, layer.name)
                    .switchMap( domains => {
                        const dimensions = domainsToDimensionsObject(domains);
                        if (dimensions && dimensions.length > 0) {
                            return Observable.of(changeLayerProperties(layer.id, {
                                dimensions
                            }));
                        }
                        return Observable.empty();
                    })
                    // no multi-dimension support
                    .catch(() => Observable.empty()) )
};
