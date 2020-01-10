/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require("../../libs/ajax");
const MockAdapter = require("axios-mock-adapter");
const getDummySecurityRuleList = (id) => ({ "SecurityRuleList": { "SecurityRule": { "canRead": true, "canWrite": true, "user": { id, "name": "admin" } } } });

/**
 * Create Mock GeoStore using mockAxios
 * @param {object} options the options for the creation of the mock
 * @param {string} [options.baseURL='/rest/geostore/'] the base URL of geostore
 * @param {object} [callbacks] the callbacks of the various handlers, useful to make checks. You can return something like `[200, body]`
 *  - onCreateResource = () => {},
    - onGetPermissions = () => {},
    - onUpdatePermission = () => {},
    - onUpdateAttribute = () => {}
 * @param {MockAdapter} mock the axios-mock-adapter to customize.
 */
export default ({ baseURL = '/rest/geostore/', callbacks = {}} = {}, mm) => {
    const mock = mm || new MockAdapter(axios);
    const {
        onCreateResource = () => {},
        onGetPermissions = () => {},
        onUpdatePermission = () => {},
        onUpdateAttribute = () => {}
    } = callbacks;
    let index = 0;

    // PATHS
    const CREATE_RESOURCE = new RegExp(`.*${baseURL}resources\/`);
    const PERMISSION_REGEX = new RegExp(`${baseURL}resources\/resource\/([0-9]{1,})\/permissions[\/]?`);
    const ATTRIBUTES_REGEX = new RegExp(`${baseURL}resources\/resource\/([0-9]{1,})\/attributes[\/]?`);

    // RESOURCE
    mock.onPost(CREATE_RESOURCE).reply( (config) => {
        return onCreateResource(config) || [200, `${index++}`];
    });

    // RESOURCE ATTRIBUTE
    mock.onGet(ATTRIBUTES_REGEX).reply(config => {
        const { url } = config;
        const id = ATTRIBUTES_REGEX.exec(url);
        return onUpdateAttribute(config) || [204, { id }];
    });
    mock.onPut().reply( config => {
        const { url } = config;
        const id = ATTRIBUTES_REGEX.exec(url);
        return onUpdateAttribute(config) || [200, `${id}`];
    });

    // RESOURCE PERMISSION
    mock.onGet(PERMISSION_REGEX).reply( config => {
        const { url } = config;
        const id = PERMISSION_REGEX.exec(url);
        return onGetPermissions(config) || [200, getDummySecurityRuleList(id)]; // TODO: put the id of the resource
    });
    mock.onPost(PERMISSION_REGEX).reply( config => {
        const { url } = config;
        const id = PERMISSION_REGEX.exec(url);
        return onUpdatePermission(config) || [204, `${id}`];
    });

    return {
        mock
    };

};
