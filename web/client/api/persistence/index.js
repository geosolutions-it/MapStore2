/**
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const ConfigUtils = require("../../utils/ConfigUtils");
const ApiProviders = {
    geostore: require("../../observables/geostore")
};
/**
 * MapStore Persistence layer.
 * By default MapStore persists resources on geostore. You can add a persistence provider creating an object that
 * implements the CRUD interface (createResource, [getResource, getResources], updateResource and deleteResource)
 * and adding it to the API providers calling `addApi`.
 * Then you can select your provider by settings the  `persistenceApi` property in `localConfig.json`
 * or by programmatically calling `setApi` method. LocalConfig takes precedence.
 */
const Persistence = {
    api: "geostore",
    /**
    * Add a new API implementation
    * @param {string} name the key of the added api implementation
    * @param {object} api the api implementation
    */
    addApi: (name, api) => {
        ApiProviders[name] = api;
    },
    /**
    * Set the current API
    * @param {string} name the key of the api implementation to be used
    */
    setApi: (name = "geostore") => {
        Persistence.api = name;
    },
    /**
    * Add a new api implementation
    * @return {object} Current api
    */
    getApi: () => {
        return ApiProviders[ConfigUtils.getConfigProp("persistenceApi") || Persistence.api];
    },
    /**
    * Retrieves a resource with data with all information about user's permission on that resource, attributes and data.
    * @param {number} id the id of the resource to get
    * @param {options} param1 `includeAttributes` and `withData` flags, both true by default
    * @return an observable that emits the requested resource
    */
    getResource: (...args) => Persistence.getApi().getResource(...args),
    getResourceIdByName: (...args) => Persistence.getApi().getResourceIdByName(...args),
    getResourceDataByName: (...args) => Persistence.getApi().getResourceDataByName(...args),
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
     * @return an observable that emits the id of the resource
     */
    createResource: (...args) => Persistence.getApi().createResource(...args),
    createCategory: (...args) => Persistence.getApi().createCategory(...args),
    /**
     * retrieves resources and for each resource it retrieves data with all information about user's permission on that resource, attributes and data.
     */
    getResources: (...args) => Persistence.getApi().getResources(...args),
    /**
     * Updates a resource setting up permission and linked resources
     * @param {resource} param0 the resource to update (must contain the id)
     * @return an observable that emits the id of the updated resource
     */
    updateResource: (...args) => Persistence.getApi().updateResource(...args),
    /**
    * Updates a resource attribute
    * @param {number} id the id of the resource which we want to update/create the attribute value
    * @param {string} name the attribute name
    * @param {string} value the attribute value
    * @return an observable that emits the id of the updated resource
    */
    updateResourceAttribute: (...args) => Persistence.getApi().updateResourceAttribute(...args),
    /**
    * Deletes a resource and its linked attributes
    * @param {object} resource the resource with the id
    * @param {object} options properties: deleteLinkedResources default true
    * @param {object} API the API to use
    * @return an observable that emits axios response for the deleted resource and for each of its deleted attributes
    */
    deleteResource: (...args) => Persistence.getApi().deleteResource(...args),
    searchListByAttributes: (...args) => Persistence.getApi().searchListByAttributes(...args)
};

module.exports = Persistence;
