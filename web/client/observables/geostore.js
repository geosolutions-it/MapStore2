/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import uuid from 'uuid/v1';
import { includes, isNil, omit, isArray, isObject, get, find } from 'lodash';
import GeoStoreDAO from '../api/GeoStoreDAO';

const createLinkedResourceURL = (id, tail = "") => `rest/geostore/data/${id}${tail}`;
import {getResourceIdFromURL} from "../utils/ResourceUtils";


const getLinkedAttributesIds = (id, filterFunction = () => true, API = GeoStoreDAO) =>
    Observable.defer(() => API.getResourceAttributes(id))
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
        ? Observable.defer( () => API.updateResourcePermissions(id, {
            SecurityRuleList: {
                SecurityRule: permission
            }
        }))
        : Observable.empty()
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
        ? Observable.fromPromise(API.deleteResource(resourceId))
            // even if the resource is not present(i.e. due to a previous cancellation not completed for network errors)
            // continue setting the attribute to NODATA
            .catch(() => Observable.of("DUMMY"))
            .switchMap( () => Observable.fromPromise( API.updateResourceAttribute(id, attributeName, "NODATA")))
        // update flow.
        : Observable.forkJoin([
            API.putResource(resourceId, linkedResource.data)
                .switchMap(() => Observable.defer(() => API.updateResourceAttribute(id, attributeName, createLinkedResourceURL(resourceId, linkedResource.tail)))),
            ...(permission ? [updateResourcePermissions(resourceId, permission, API)] : [])
        ]);


/**
 * Creates a resource on GeoStore and link it to the current resource. Can be used for thumbnails, details and so on
 * If the data for the resource is "NODATA", it won't be created.
 * @param {number} id the id of the resource
 * @param {string} attributeName the name of the attribute to link
 * @param {object} linkedResource the resource object of the resource to link. This resource have a tail option that can be used to add options URL of the link
 * @param {object} API the API to use (default GeoStoreDAO)
 */
const createLinkedResource = (id, attributeName, linkedResource, permission, API = GeoStoreDAO) =>
    linkedResource.data !== 'NODATA' ? Observable.defer(() =>
        API.createResource({
            name: `${id}-${attributeName}-${uuid()}`
        },
        linkedResource.data,
        linkedResource.category
        ))
        .pluck('data')
        .switchMap( (linkedResourceId) =>
            Observable.forkJoin([
                // update URL of the main resource
                Observable.defer( () => API.updateResourceAttribute(id, attributeName, createLinkedResourceURL(linkedResourceId, linkedResource.tail))),
                // set permission
                ...(permission ? [updateResourcePermissions(linkedResourceId, permission, API)] : [])

            ]).map(() => linkedResourceId)
        ) : Observable.of(-1);

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
    Observable.defer(
        () => API.getResourceAttributes(id)
    )
        .switchMap(attributes => {
            const attributeValue = find(attributes, {name: attributeName})?.value;
            return getResourceIdFromURL(attributeValue)
                ? updateOrDeleteLinkedResource(id, attributeName, linkedResource, getResourceIdFromURL(attributeValue), permission, API)
                : createLinkedResource(id, attributeName, linkedResource, permission, API);
        }).catch(
        /* If the linked resource update gave an error
         * you have to create a new resource for the linked resource, provided it has valid data.
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
                ? Observable.of([])
                : Observable.forkJoin(
                    ids.map(rid => updateResourcePermissions(rid, permission, API))
                ));
/**
 * Retrieves a resource with all information about user's permission on that resource, attributes and data.
 * @param {number} id the id of the resource to get
 * @param {options} params params to pass to the underlying api
 * @param {boolean} params.includeAttributes if true, resource will contain resource attributes
 * @param {boolean} params.withData if true, resource will contain resource data
 * @param {boolean} params.withPermissions if true, resource will contain resource permission
 * @param {object} API the API to use, default GeoStoreDAO
 * @return an observable that emits the resource
 */
export const getResource = (id, { includeAttributes = true, withData = true, withPermissions = false } = {}, API = GeoStoreDAO) =>
    Observable.forkJoin([
        Observable.defer(() => API.getShortResource(id)).pluck("ShortResource"),
        ...(includeAttributes ? [ Observable.defer(() => API.getResourceAttributes(id))] : []),
        ...(withData ? [Observable.defer(() =>API.getData(id))] : []),
        ...(withPermissions ? [Observable.defer( () => API.getResourcePermissions(id, {}, true))] : [])
    ]).map(([resource, attributes, data, permissions]) => ({
        ...resource,
        attributes: (attributes || []).reduce((acc, curr) => ({
            ...acc,
            [curr.name]: curr.value
        }), {}),
        data,
        permissions
    }));

export const getResourceIdByName = (category, name, API = GeoStoreDAO) =>
    Observable.defer(() => API.getResourceIdByName(category, name));

export const getResourceDataByName = (category, name, API = GeoStoreDAO) =>
    Observable.defer(() => API.getResourceDataByName(category, name));

/**
 * Retrieves an array of resources with all information about user's permission on that resource, attributes and data.
 * @param {number} id the id of the resource to get
 * @param {options} params params to pass to the underlying api
 * @param {string} params.query text to use for filtering resources by name, default "*" means all
 * @param {number} params.category category to use for filtering resources
 * @param {object} params.options axios options
 * @param {number} params.options.start initial offset to start the search, default 0
 * @param {number} params.options.limit max number of records fetched, default 10
 * @param {boolean} params.options.includeAttributes if true, in fetches also the attributes of the resources, default true
 * @param {boolean} params.options.withData if true, in fetches also the data of the resources, default true
 * @param {boolean} params.options.withPermissions if true, in fetches also the permissions of the resources, default false
 * @param {object} API the API to use, default GeoStoreDAO
 * @return an observable that emits the resource
 */

export const getResources = ({
    query = "*",
    category,
    options = {
        params: {
            start: 0,
            limit: 10
        },
        includeAttributes: false,
        withData: false,
        withPermission: false
    }
} = {},
API = GeoStoreDAO ) => {
    return Observable.defer(
        () => API.getResourcesByCategory(category, query, options)
    ).map(({ results = [], totalCount = 0 }) => {
        const { includeAttributes, withData, withPermission} = options;
        //  if one of the includeAttributes or withData or withPermissions is true then it searches for those related info
        return (includeAttributes || withData || withPermission) ?
            {totalCount, results: results.map(({id}) => getResource(id, options, API))} :
            {totalCount, results};
    });
};

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
export const createResource = ({ data, category, metadata, permission: configuredPermission, linkedResources = {} }, API = GeoStoreDAO) =>
    // create resource
    Observable.defer(
        () => API.createResource(metadata, data, category)
    )
        .pluck('data') // get the id
        // set resource permission
        .switchMap(id =>
            // on creation owner some permission are assigned by default to the resources.
            // only on creation they have to be merged with configuredPermission.
            Observable.defer( () => API.getResourcePermissions(id))
                .map(defaultPermission => mergePermission(defaultPermission, configuredPermission))
                .switchMap( permission =>
                    updateResourcePermissions(id, permission, API)
                        .map(() => ({ id, permission})))
        )
        // create linkedResources
        .switchMap(({id, permission}) =>
            Object.keys(linkedResources).length > 0
                ? Observable.forkJoin(
                    Object.keys(linkedResources)
                        .filter(k => linkedResources[k].data && linkedResources[k].data !== "NODATA")
                        .map(attributeName =>
                            createLinkedResource(id, attributeName, linkedResources[attributeName], permission, API)
                        )
                ).map(() => id)
                : Observable.of(id)
        );

export const createCategory = (category, API = GeoStoreDAO) =>
    Observable.defer(
        () => API.createCategory(category)
    );

/**
 * Updates a resource setting up permission and linked resources
 * @param {resource} param0 the resource to update (must contain the id)
 * @param {object} API the API to use
 * @return an observable that emits the id of the updated resource
 */

export const updateResource = ({ id, data, permission, metadata, linkedResources = {} } = {}, API = GeoStoreDAO) => {
    const linkedResourcesKeys = Object.keys(linkedResources);

    // update metadata
    return Observable.forkJoin([
        // update data and permissions after data updated
        Observable.defer(
            () => API.putResourceMetadataAndAttributes(id, metadata)
        ).switchMap(res =>
            // update data if present. NOTE: sequence instead of parallel because of geostore issue #179
            data
                ? Observable.defer(
                    () => API.putResource(id, data)
                )
                : Observable.of(res))
            .switchMap((res) => permission ? Observable.defer(() => updateResourcePermissions(id, permission, API)) : Observable.of(res)),
        // update linkedResources and permissions after linkedResources updated
        (linkedResourcesKeys.length > 0 ? Observable.forkJoin(
            ...linkedResourcesKeys.map(
                attributeName => updateLinkedResource(id, attributeName, linkedResources[attributeName], permission, API)
            )
        ) : Observable.of([]))
            .switchMap(() => permission ?
                Observable.defer(() => updateOtherLinkedResourcesPermissions(id, linkedResources, permission, API)) :
                Observable.of(-1))
    ]).map(() => id);
};

/**
 * Deletes a resource and Its linked attributes
 * @param {object} resource the resource with the id
 * @param {object} options options deleteLinkedResources default true
 * @param {object} API the API to use
 * @return an observable that emits axios response for the deleted resource and for each of its deleted attributes
 */
export const deleteResource = ({ id }, { deleteLinkedResources = true} = {}, API = GeoStoreDAO) =>
    (deleteLinkedResources
        ? getLinkedAttributesIds(id, () => true, API)
        : Observable.of([])
    ).map( (ids = []) =>
        Observable.forkJoin(
            [id, ...ids].map(i => API.deleteResource(i))
        )
    );

export const searchListByAttributes = (filter, options = {}, API = GeoStoreDAO) =>
    Observable.defer(
        () => API.searchListByAttributes(filter, options)
    ).switchMap(result => {
        const parseAttributes = (record) => {
            const attributes = get(record, 'Attributes.attribute');
            const attributesArray = isArray(attributes) && attributes || isObject(attributes) && [attributes];
            return attributesArray && attributesArray.reduce((newAttributes, attribute) => ({...newAttributes, [attribute.name]: attribute.value}), {}) || {};
        };

        if (!result || !get(result, 'ExtResourceList.Resource')) {
            return Observable.of(({
                results: [],
                totalCount: 0
            }));
        }

        const resourceObj = get(result, 'ExtResourceList.Resource', []);
        const resources = (isArray(resourceObj) ? resourceObj : [resourceObj]).map(resource => ({
            ...omit(resource, 'Attributes'),
            attributes: parseAttributes(resource)
        }));

        return (options.withPermissions ?
            Observable.forkJoin(
                resources.map(res => Observable.defer(() => API.getResourcePermissions(res.id, {}, true))
                    .map(permissions => ({...res, permissions})))
            ) : Observable.of(resources))
            .map(resourcesArr => ({
                results: resourcesArr,
                totalCount: get(result, 'ExtResourceList.ResourceCount')
            }));
    });

/**
* Updates a resource attribute
* @param {number} id the id of the resource which we want to update/create the attribute value
* @param {string} name the attribute name
* @param {string} value the attribute value
* @return an observable that emits the id of the updated resource
 */
export const updateResourceAttribute = ({ id, name, value } = {}, API = GeoStoreDAO) =>
    // update metadata
    Observable.defer(
        () => API.updateResourceAttribute(id, name, value)
    ).switchMap(() => Observable.of(id));
