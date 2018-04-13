import { ZipSubscriber } from 'rxjs/operator/zip';

const Rx = require('rxjs');
const uuid = require('uuid/v1');
const GeoStoreDAO = require('../api/GeoStoreDAO');

const createLinkedResourceURL = (id, tail = "") => encodeURIComponent(encodeURIComponent(`rest/geostore/data/${id}${tail}`));
module.exports = {
    /**
     * returns an observable for saving a "Resource"
     * Required format of the resource object is:
     * ```
     *  {
     *    id: "id", // if present. Otherwise a new item will be created
     *    category: "string",
     *    metadata: {
     *       name: "name",
     *       description: "description",
     *       attribute1: "value1",
     *       attribute2: "value2"
     *    }
     *    permission: [{}] // permissions to save
     *    data: {}
     *    linkedResources: {
     *         thumbnail: {
     *
     *         }
     *    }
     *  }
     * ```
     */
    createResource: ({ data, category, metadata, linkedResources = {}}, API = GeoStoreDAO) =>
        Rx.Observable.defer(
            () => API.createResource(metadata, data, category) // TODO: Set Permission
        )
        .pluck('data')
        // create linkedResources
        .switchMap(id =>
            Rx.Observable.forkJoin(
                Object.keys(linkedResources)
                    .filter(k => linkedResources[k].data && linkedResources[k].data !== "NODATA")
                    .map( attributeName =>
                        Rx.Observable.defer(() => API.createResource({
                            name: `${id}-${attributeName}-${uuid()}`
                        },
                        linkedResources[attributeName].data,
                        linkedResources[attributeName].category
                        )).map(resId => API.updateResourceAttribute(id, attributeName, createLinkedResourceURL(resId, linkedResources[attributeName].tail)))
                        // TODO: make it public
                    )
            ).map(() => id)
        ),
    getResource:
        (id, {withData = true} = {}, API = GeoStoreDAO) =>
            Rx.Observable.forkJoin([
                Rx.Observable.defer( () => API.getShortResource(id)).pluck("ShortResource"),
                ...(withData ? [API.getData(id)] : [])
            ]).map(([resource, data]) => ({
                ...resource,
                data
            }))
};
