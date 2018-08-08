
const { Observable } = require('rxjs');
const { updateLayerDimension, changeLayerProperties, ADD_LAYER} = require('../actions/layers');
const { SET_CURRENT_TIME, updateLayerDimensionData} = require('../actions/dimension');
const {describeDomains} = require('../api/MultiDim');
const {castArray, pick} = require('lodash');

const DESCRIBE_DOMAIN_OPTIONS = {
    expandLimit: 10 // TODO: increase this limit to max client allowed
};

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
    /**
     * Sync current time param of the layer with the current time element
     */
    updateLayerDimensionOnCurrentTimeSelection: action$ =>
        action$.ofType(SET_CURRENT_TIME).switchMap(({time}) => Observable.of(updateLayerDimension('time', time))),

    /**
     * Check the presence of Multidimensional API extension, then setup layers properly.
     */
    queryMultidimensionalAPIExtensionOnAddLayer: action$ =>
        action$
            .ofType(ADD_LAYER)
            .filter(
                ({ layer = {} } = {}) => layer.id && layer.url && layer.name && (layer.type === "wms" || layer.type === "wmts")
            )
            // every add layer has it's own flow
            .flatMap(({ layer = {} } = {}) =>
                describeDomains(layer.url, layer.name, undefined, DESCRIBE_DOMAIN_OPTIONS)
                    .switchMap( domains => {
                        const dimensions = domainsToDimensionsObject(domains, layer);
                        if (dimensions && dimensions.length > 0) {
                            return Observable.of(
                                changeLayerProperties(layer.id, {
                                    dimensions: dimensions.map(d => pick(d, ['source', 'name']))
                                }),
                                ...dimensions.map(d => updateLayerDimensionData(layer.id, d.name, d)));
                        }
                        return Observable.empty();
                    })
                    // no multi-dimension support
                    .catch(() => Observable.empty()) )
};
