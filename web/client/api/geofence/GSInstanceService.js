/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import axios from '../../libs/ajax';

import { toJSONPromise } from './common';

/**
 *
 * @param {object} object the gsInstance
 */
export const cleanConstraintsForUpdate = (gsInstance) => {
    // cleaned non-allowed prop 'name', 'id', 'url'
    const { name, id, url, ...cleaned } = gsInstance;
    return {
        ...cleaned
    };
};


/**
 * Implementation of GeoFence API of UserService that uses GeoServer REST API
 * This implementation interacts with the GeoServer integrated version of GeoFence.
 */
export default ({ addBaseUrl }) => {

    const loadGSInstances =  () => {
        const options = {
            'headers': {
                'Content': 'application/xml'
            }
        };
        return axios.get('/instances', addBaseUrl(options))
            .then( (response) => {
                return toJSONPromise(response.data);
            }
            ).then(({GSInstanceList = {}}) => ({instances: [].concat(GSInstanceList.Instance || [])}));
    };

    return {
        loadGSInstancesForDD: () => {
            return loadGSInstances()
            // filter by `filter` parameter
                .then(({instances = []}) => instances)
            // convert into the expected format
                .then(instances => ({
                    data: instances.map(({ id, name, url}) => ({
                        id, name, url
                    })) }));
        },
        loadGSInstances,
        deleteGSInstance: (gsInstanceId) => {
            return axios.delete('/instances/id/' + gsInstanceId, addBaseUrl({}));
        },
        addGSInstance: (gsInstance) => {
            return axios.post('/instances', gsInstance, addBaseUrl({
                'headers': {
                    'Content': 'application/json'
                }
            }));
        },
        updateGSInstance: (gsInstance) => {
            const newGSInstance = { ...cleanConstraintsForUpdate(gsInstance) };

            return axios.put(`/instances/id/${gsInstance.id}`, newGSInstance, addBaseUrl({
                'headers': {
                    'Content': 'application/json'
                }
            }));
        }
    };
};
