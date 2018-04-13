import { withHandlers } from 'recompose';

/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, withStateHandlers} = require('recompose');
const {set} = require('../../../../utils/ImmutableUtils');

module.exports = compose(
    withStateHandlers(
        ({resource = {}}) => ({
            originalData: resource,
            resource
        }),
        {
            onUpdate: ({resource}) => (key, value) => ({
                resource: set(key, value, resource)
            }),
            onUpdateLinkedResource: ({ linkedResources = {} }) => (key, data, category, options = {}) => ({
                linkedResources: set(key, {
                    category,
                    data,
                    ...options
                }, linkedResources)
            })
        }
    ),
    withHandlers({
        onSave: ({onSave = () => {}, category = "DASHBOARD", data, linkedResources}) => resource => onSave({
            category,
            linkedResources,
            data,
            ...resource
        })
    })
);
