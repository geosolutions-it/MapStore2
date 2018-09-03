/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Rx = require('rxjs');
const uuid = require('uuid/v1');
const { includes, isNil } = require('lodash');
const GeoStoreDAO = require('../api/GeoStoreDAO');

const createLinkedResourceURL = (id, tail = "") => encodeURIComponent(encodeURIComponent(`rest/geostore/data/${id}${tail}`));
const LINKED_RESOURCE_REGEX = /rest\/geostore\/data\/(\d+)/;
const getResourceIdFromURL = path => {
    const decodedUrl = decodeURIComponent(decodeURIComponent(path));
    const res = LINKED_RESOURCE_REGEX.exec(decodedUrl);
    return res && !!res[0] && res[1];
};


const getLinkedAttributesIds = (id, filterFunction = () => true, API = GeoStoreDAO) =>
    Rx.Observable.defer(() => API.getResourceAttributes(id))
        .map((attributes = []) => attributes
            // excludes resources that are going to be updated
            .filter(({ name } = {}) => filterFunction(name) )
            // find out which attributes match the resource ids
            .map(({ value }) => getResourceIdFromURL(value))
            .filter(rid => !isNil(rid))
);

/**
 * Merges the permission. Now conflicts are not possible (default permission are for users, configured for groups)
 * For the future we should remove duplicates.
 * @param {array} p1 permission
 * @param {array} p2 permission
 */
const mergePermission = (p1 = [], p2 = []) => p1.concat(p2);
/**
 *
 * @param {number} id the id of the resource
 * @param {array} permission the permission to assign
 * @param {*} API
 */
const updateResourcePermissions = (id, permission, API = GeoStoreDAO) =>
    permission
        ? Rx.Observable.defer( () => API.updateResourcePermissions(id, {
                SecurityRuleList: {
                    SecurityRule: permission
                }
            }))
        : Rx.Observable.empty()
;
/**
 * If the resource is "NODATA", the resource will be deleted and the attribute link will contain NODATA.
 * This is the current convention used for maps. Gor the future, when geostore implements API to delete attribute,
 * we could improve this procedure to simply delete the attribute.
 * @param {number} id the id of the original resource
 * @param {string} attributeName name of the linked resource
 * @param {object} linkedResource the linked resource to update
 * @param {number} resourceId the id of the linked resource
 * @param {array} permissions to assign
 * @param {object} API the API to use
 */
const updateOrDeleteLinkedResource = (id, attributeName, linkedResource = {}, resourceId, permission, API) =>
    linkedResource.data === "NODATA"
        // cancellation flow
        ? Rx.Observable.fromPromise(API.deleteResource(resourceId))
            // even if the resource is not present(i.e. due to a previous cancellation not completed for network errors)
            // continue setting the attribute to NODATA
            .catch(() => Rx.Observable.of("DUMMY"))
            .switchMap( () => Rx.Observable.fromPromise( API.updateResourceAttribute(id, attributeName, "NODATA")))
        // update flow.
        : Rx.Observable.forkJoin([
            API.putResource(resourceId, linkedResource.data)
                .switchMap(() => Rx.Observable.defer(() => API.updateResourceAttribute(id, attributeName, createLinkedResourceURL(resourceId, linkedResource.tail)))),
            ...(permission ? [updateResourcePermissions(resourceId, permission, API)] : [])
        ]);


/**
 * Creates a resource on GeoStore and link it to the current resource. Can be used for thumbnails, details and so on
 * @param {number} id the id of the resource
 * @param {string} attributeName the name of the attribute to link
 * @param {object} linkedResource the resource object of the resource to link. This resource have a tail option that can be used to add options URL of the link
 * @param {object} API the API to use (default GeoStoreDAO)
 */
const createLinkedResource = (id, attributeName, linkedResource, permission, API = GeoStoreDAO) =>
    Rx.Observable.defer(() =>
        API.createResource({
            name: `${id}-${attributeName}-${uuid()}`
        },
            linkedResource.data,
            linkedResource.category
        ))
        .pluck('data')
        .switchMap( (linkedResourceId) =>
            Rx.Observable.forkJoin([
                // update URL of the main resource
                Rx.Observable.defer( () => API.updateResourceAttribute(id, attributeName, createLinkedResourceURL(linkedResourceId, linkedResource.tail))),
                // set permission
                ...(permission ? [updateResourcePermissions(linkedResourceId, permission, API)] : [])

            ]).map(() => linkedResourceId)
        );

/**
 * Updates a linked resource. Check if the resource already exists as attribute.
 * If exists it will simply update the resource, otherwise the resource will be created and the attribute that link the resource updated
 *
 * @param {number} id the id of the resource
 * @param {string} attributeName the name of the attribute to link
 * @param {object} linkedResource the resource object of the resource to link. This resource have a tail option that can be used to add options URL of the link
 * @param {array} permission permission to assign
 * @param {object} API the API to use (default GeoStoreDAO)
 * @return Observable
 */
const updateLinkedResource = (id, attributeName, linkedResource, permission, API = GeoStoreDAO) =>
    Rx.Observable.defer(
        () => API.getResourceAttribute(id, attributeName)
    ).pluck('data')
    .switchMap(
        attributeValue => getResourceIdFromURL(attributeValue)
            ? updateOrDeleteLinkedResource(id, attributeName, linkedResource, getResourceIdFromURL(attributeValue), permission, API)
            : createLinkedResource(id, attributeName, linkedResource, permission, API)
    ).catch(
        /* if the attribute doesn't exists or if the linked resource update gave an error
         * you have to create a new resource for the linked resource.
         * This error can occur if:
         *  - The resource is new
         *  - The resource URL is present as attribute of the main resource but the linked resource doesn't exist anymore.
         *    ( for instance it may happen if the creation procedure gives an error )
         *  - The resource is not writable by the user. It happens when a user changes the permission of a resource and doesn't update
         *    the resource permission.
         */
        (e) => createLinkedResource(id, attributeName, linkedResource, permission, API, e)
    );
/**
 * Updates the permission of the linkedResources that are not modified.
 * It checks the resource's attribute to find out resources that have to be updated.
 * @param {number} id id of the main resource
 * @param {object} linkedResources linked resources that are updating
 * @param {array} permission array of permission
 * @param {object} API the API to use
 */
const updateOtherLinkedResourcesPermissions = (id, linkedResources, permission, API = GeoStoreDAO) =>
    getLinkedAttributesIds(id, name => !includes(Object.keys(linkedResources), name))
        .switchMap((ids = []) =>
            ids.length === 0
            ? Rx.Observable.of([])
            : Rx.Observable.forkJoin(
                ids.map(rid => updateResourcePermissions(rid, permission, API))

        ));
/**
 * Retrieves a resource with data with all information about user's permission on that resource, attributes and data.
 * @param {number} id the id of the resource to get
 * @param {options} param1 `includeAttributes` and `withData` flags, both true by default
 * @param {object} API the API to use
 * @return an observable that emits the resource
 */
const getResource = (id, { includeAttributes = true, withData = true } = {}, API = GeoStoreDAO) =>
    Rx.Observable.forkJoin([
        Rx.Observable.defer(() => API.getShortResource(id)).pluck("ShortResource"),
        ...(includeAttributes ? [ Rx.Observable.defer(() => API.getResourceAttributes(id))] : []),
        ...(withData ? [Rx.Observable.defer(() =>API.getData(id))] : [])
    ]).map(([resource, attributes, data]) => ({
        ...resource,
        attributes: (attributes || []).reduce((acc, curr) => ({
            ...acc,
            [curr.name]: curr.value
        }), {}),
        data
    }));


/**
 * Returns an observable for saving a "Resource" and it's linked resources.
 * Linked resources are geostore resources like thumbnail or details. The main resource contains a link
 * to that resources as attributes. (the URL is double encoded to avoid issues with conversions in other pieces of the API)
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
 *             tail: '/raw?decode=datauri' // for thumbnails, this will be appended to the resource URL in the main resource
 *             data: {}
 *
 *         }
 *    }
 * ```
 *  }
 * @param {resource} param0 resource content
 * @param {object} API the API to use
 * @return an observable that emits the id of the resource
 */
const createResource = ({ data, category, metadata, permission: configuredPermission, linkedResources = {} }, API = GeoStoreDAO) =>
    // create resource
    Rx.Observable.defer(
        () => API.createResource(metadata, data, category)
    )
        .pluck('data') // get the id
        // set resource permission
        .switchMap(id =>
            // on creation owner some permission are assigned by default to the resources.
            // only on creation they have to be merged with configuredPermission.
            Rx.Observable.defer( () => API.getResourcePermissions(id))
                .map(defaultPermission => mergePermission(defaultPermission, configuredPermission))
                .switchMap( permission =>
                    updateResourcePermissions(id, permission, API)
                        .map(() => ({ id, permission})))
        )
        // create linkedResources
        .switchMap(({id, permission}) =>
            Object.keys(linkedResources).length > 0
                ? Rx.Observable.forkJoin(
                    Object.keys(linkedResources)
                        .filter(k => linkedResources[k].data && linkedResources[k].data !== "NODATA")
                        .map(attributeName =>
                            createLinkedResource(id, attributeName, linkedResources[attributeName], permission, API)
                        )
                ).map(() => id)
                : Rx.Observable.of(id)
        );
/**
 * Updates a resource setting up permission and linked resources
 * @param {resource} param0 the resource to update (must contain the id)
 * @param {object} API the API to use
 * @return an observable that emits the id of the updated resource
 */
const updateResource = ({ id, data, category, permission, metadata, linkedResources = {} } = {}, API = GeoStoreDAO) =>
    Rx.Observable.forkJoin([
        // update metadata
        Rx.Observable.defer(
            () => API.putResourceMetadata(id, metadata.name, metadata.description)
        ).switchMap(res =>
            // update data if present. NOTE: sequence instead of parallel because of geostore issue #179
            data
                ? Rx.Observable.defer(
                    () => API.putResource(id, data)
                )
            : Rx.Observable.of(res)),
        // update data
        // update permission
        ...(permission ? [updateResourcePermissions(id, permission, API)] : []),
        ...(permission ? [updateOtherLinkedResourcesPermissions(id, linkedResources, permission, API)] : []),
        // update linkedResources
        ...(
            Object.keys(linkedResources).map(
                attributeName => updateLinkedResource(id, attributeName, linkedResources[attributeName], permission, API)
            )
        )
    ]).map(() => id);
/**
 * Deletes a resource and Its linked attributes
 * @param {object} resource the resource with the id
 * @param {object} options options deleteLinkedResources default true
 * @param {object} API the API to use
 * @return an observable that emits axios response for the deleted resource and for each of its deleted attributes
 */
const deleteResource = ({ id }, { deleteLinkedResources = true} = {}, API = GeoStoreDAO) =>
    (deleteLinkedResources
            ? getLinkedAttributesIds(id, () => true, API)
            : Rx.Observable.of([])
        ).map( (ids = []) =>
            Rx.Observable.forkJoin(
                [id, ...ids].map(i => API.deleteResource(i))
            )
    );
module.exports = {
    getResource,
    createResource,
    updateResource,
    deleteResource
};
