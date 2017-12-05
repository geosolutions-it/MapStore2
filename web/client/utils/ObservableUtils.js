const Rx = require('rxjs');
const {get, isNil} = require('lodash');
const {parseString} = require('xml2js');
const {stripPrefix} = require('xml2js/lib/processors');
const GeoStoreApi = require('../api/GeoStoreDAO');
const {error} = require('../actions/notifications');
const {updatePermissions, updateAttribute} = require('../actions/maps');
const ConfigUtils = require('../utils/ConfigUtils');

const catchInPromise = e => {
    return Rx.Observable.of(error({
        title: "warning",
        message: "warning: " + e.status + "  " + e.data, // TODO add tranlations
        autoDismiss: 0,
        position: "tc"
    }));
};
class OGCError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'OGCError';
        this.code = code;
    }
}
/**
 * Intercept OGC Exception (200 response with exceptionReport) to throw error in the stream
 * @param  {observable} observable The observable that emits the server response
 * @return {observable}            The observable that returns the response or throws the error.
 */
const interceptOGCError = (observable) => observable.switchMap(response => {
    if (typeof response.data === "string") {
        if (response.data.indexOf("ExceptionReport") > 0) {
            return Rx.Observable.bindNodeCallback( (data, callback) => parseString(data, {
                 tagNameProcessors: [stripPrefix],
                 explicitArray: false,
                 mergeAttrs: true
            }, callback))(response.data).map(data => {
                const message = get(data, "ExceptionReport.Exception.ExceptionText");
                throw new OGCError(message || "Undefined OGC Service Error", get(data, "ExceptionReport.Exception.exceptionCode"));
            });

        }
    }
    return Rx.Observable.of(response);
});

const getIdFromUri = (uri) => {
    return /\d+/.test(uri) ? uri.match(/\d+/)[0] : null;
};
const createAssociatedResource = ({attribute, permissions, mapId, metadata, value, category, type, optionsRes, optionsAttr}) => {
    return Rx.Observable.fromPromise(
            GeoStoreApi.createResource(metadata, value, category, optionsRes)
            .then(res => res.data)
            .switchMap((resourceId) => {
                // update permissions
                let actions = [];
                actions.push(updatePermissions(resourceId, permissions));
                const attibuteUri = ConfigUtils.getDefaults().geoStoreUrl + "data/" + mapId + "/raw?decode=datauri";
                const encodedResourceUri = encodeURIComponent(encodeURIComponent(attibuteUri));
                // UPDATE resource map with new attribute
                actions.push(updateAttribute(mapId, attribute, encodedResourceUri, type, optionsAttr));
                return Rx.Observable.from(actions);
            })
        ).catch(catchInPromise);
};

const updateAssociatedResource = ({permissions, resourceId, value, options}) => {
    return Rx.Observable.fromPromise(GeoStoreApi.putResource(resourceId, value, options)
            .then(res => res.data)
            .switchMap((id) => {
                return Rx.Observable.of(updatePermissions(id, permissions));
            })
        ).catch(catchInPromise);

};
const deleteAssociatedResource = ({mapId, attribute, type, optionsAttr, resourceId, options}) => {
    return Rx.Observable.fromPromise(GeoStoreApi.deleteResource(resourceId, options)
            .then(res => res.data)
            .switchMap(() => {
                return Rx.Observable.of(updateAttribute(mapId, attribute, "NODATA", type, optionsAttr));
            })
        ).catch(catchInPromise);
};

const manageMapResource = ({map = {}, attribute = "", resource = null}) => {
    const attrVal = map[attribute];
    const mapId = map.id;
    // create
    if ((isNil(attrVal) || attrVal === "NODATA") && !isNil(resource)) {
        return createAssociatedResource({...resource, attribute, mapId});
    }
    if (!isNil(resource)) {
        // update
        return updateAssociatedResource({resourceId: getIdFromUri(attrVal), mapId, options: resource.optionsAttr});
    }
    // delete
    return deleteAssociatedResource({resourceId: getIdFromUri(attrVal), mapId, permissions: resource.permissions, value: resource.value, options: resource.optionsDel});

};

module.exports = {
    createAssociatedResource,
    updateAssociatedResource,
    deleteAssociatedResource,
    interceptOGCError,
    manageMapResource
};
