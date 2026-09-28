/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { castArray, includes, isNil, isString } from 'lodash';

import { getFeatureLayerSchema } from '../api/ArcGIS';
import { getLayerCapabilities as getWMSLayerCapabilities } from '../observables/wms';
import { loadFields } from '../components/TOC/fragments/LayerFields';
import { NodeTypes } from './LayersUtils';

const NAME_EDIT_LAYER_TYPES = ['wms', 'wfs', 'arcgis', 'arcgis-feature'];
const URL_EDIT_LAYER_TYPES = ['wms', 'wfs'];

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj ?? {}, key);

const formatURL = (url) => Array.isArray(url) ? url.join(', ') : url || '';
const parseURL = (url = '') => {
    const urls = url.split(',').map((value) => value.trim());
    return urls.length > 1 ? urls : urls[0];
};
const formatText = (value) => isNil(value) ? '' : `${value}`;

/**
 * Checks if a source value is empty, an array is empty when it has no entries or an empty entry
 * @param {any} value the value to check
 * @returns {boolean} true if the value is empty
 */
export const isEmptyValue = (value) => Array.isArray(value)
    ? !value.length || value.some(isEmptyValue)
    : isNil(value) || `${value}`.trim() === '';

const usesLinkedTypeName = (layer) => layer?.search?.type === 'wfs' && isNil(layer.search.typeName);

const getNameSchemaKeys = (node) => {
    if (node.type === 'wfs' || node.type === 'wms' && usesLinkedTypeName(node)) {
        return ['fields'];
    }
    if (node.type === 'arcgis-feature') {
        return ['fields', 'properties', 'geometryType'];
    }
    return [];
};

/**
 * Definitions of the editable source fields: name, url, searchUrl and searchTypeName
 * @type {object}
 * @prop {string} labelId message id of the field label
 * @prop {string} dataQa data-qa attribute of the input
 * @prop {boolean} [reloadsLayer] true if a change of the field reloads the layer
 * @prop {function} format converts the layer value to the input value
 * @prop {function} [parse] converts the input value to the layer value, identity if missing
 * @prop {function} get returns the field value of a layer
 * @prop {function} toChanges returns the layer changes for a new value
 * @prop {function} schemaKeys returns the layer properties refreshed by the validation
 */
export const SOURCE_FIELDS = {
    name: {
        labelId: 'layerProperties.name',
        dataQa: 'layer-properties-name',
        reloadsLayer: true,
        format: formatText,
        get: (layer) => layer?.name,
        toChanges: (node, name) => ({ name }),
        schemaKeys: getNameSchemaKeys
    },
    url: {
        labelId: 'layerProperties.url',
        dataQa: 'layer-properties-url',
        reloadsLayer: true,
        format: formatURL,
        parse: parseURL,
        get: (layer) => layer?.url,
        toChanges: (node, url) => ({ url }),
        schemaKeys: (node) => node.type === 'wfs' ? ['fields'] : []
    },
    searchUrl: {
        labelId: 'layerProperties.url',
        dataQa: 'layer-properties-search-url',
        format: formatText,
        get: (layer) => layer?.search?.url,
        toChanges: (node, url) => ({ search: { ...node.search, url } }),
        schemaKeys: () => ['fields']
    },
    searchTypeName: {
        labelId: 'layerProperties.typeName',
        dataQa: 'layer-properties-search-type-name',
        format: formatText,
        get: (layer) => layer?.search?.typeName ?? layer?.name,
        toChanges: (node, typeName) => ({ search: { ...node.search, typeName } }),
        schemaKeys: () => ['fields']
    }
};

/**
 * Returns the source fields editable for a node
 * @param {object} node the layer
 * @param {string} [nodeType=NodeTypes.LAYER] the settings node type
 * @returns {string[]} the SOURCE_FIELDS keys to display
 */
export const getSourceFields = (node = {}, nodeType = NodeTypes.LAYER) => {
    const canEditName = nodeType === NodeTypes.LAYER
        && includes(NAME_EDIT_LAYER_TYPES, node.type)
        && (node.type !== 'arcgis' || !isEmptyValue(node.name));
    return [
        ...(canEditName ? ['name'] : []),
        ...(includes(URL_EDIT_LAYER_TYPES, node.type) ? ['url'] : []),
        ...(node.type === 'wms' && node.search ? ['searchUrl', 'searchTypeName'] : [])
    ];
};

/**
 * Applies the edited source values to a layer
 * @param {object} node the layer
 * @param {object} values the parsed values of the edited fields, keyed by field
 * @returns {object} the layer with the edited values
 */
export const toLayer = (node = {}, values = {}) => {
    const hasSearchValues = hasOwn(values, 'searchUrl') || hasOwn(values, 'searchTypeName');
    const search = hasSearchValues
        ? {
            ...node.search,
            ...(hasOwn(values, 'searchUrl') && { url: values.searchUrl }),
            ...(hasOwn(values, 'searchTypeName') && { typeName: values.searchTypeName })
        }
        : node.search;
    return {
        ...node,
        ...(hasOwn(values, 'name') && { name: values.name }),
        ...(hasOwn(values, 'url') && { url: values.url }),
        ...(search && { search })
    };
};

/**
 * Builds the layer changes for a confirmed field
 * @param {object} node the layer
 * @param {string} field the confirmed field
 * @param {any} value the parsed value
 * @param {object} [result] the validation result
 * @param {object} [options]
 * @param {boolean} [options.forced] true to save a value that failed validation, the schema properties are reset
 * @returns {object} the changes to apply to the layer
 */
export const buildChanges = (node = {}, field, value, result = {}, { forced } = {}) => ({
    ...SOURCE_FIELDS[field].toChanges(node, value),
    ...SOURCE_FIELDS[field].schemaKeys(node).reduce((changes, key) => {
        if (forced) {
            return { ...changes, [key]: undefined };
        }
        return hasOwn(result, key) ? { ...changes, [key]: result[key] } : changes;
    }, {})
});

const createSourceError = (code, field, cause) => {
    const error = new Error(cause?.message || `Layer source validation failed: ${code}`);
    error.name = 'LayerSourceError';
    error.code = code;
    error.field = field;
    error.cause = cause;
    return error;
};

const isSourceError = (error) => error?.name === 'LayerSourceError';

const isOGCException = (error) => error?.name === 'OGCError'
    || isString(error?.data) && error.data.indexOf('ExceptionReport') >= 0;
const isRequestError = (error) => !!(error?.originalError || error?.status || error?.request);

const toSourceError = (error, fallbackCode, { service = 'url', notFound = 'name' } = {}) => {
    if (isSourceError(error)) {
        return error;
    }
    if (isOGCException(error)) {
        return createSourceError('notFound', notFound, error);
    }
    if (isRequestError(error)) {
        return createSourceError('service', service, error);
    }
    const fields = { service, notFound };
    return createSourceError(fallbackCode, fields[fallbackCode], error);
};

const requireValues = (layer, fields) => {
    const missingField = fields.find((field) => isEmptyValue(SOURCE_FIELDS[field].get(layer)));
    return missingField
        ? Promise.reject(createSourceError('required', missingField))
        : Promise.resolve();
};

const mergeArcGISFields = (fields = [], previousFields = []) => fields.map((field) => {
    const previousField = previousFields.find(({ name }) => name === field.name);
    return {
        ...field,
        ...(hasOwn(previousField, 'alias') && { alias: previousField.alias }),
        ...(hasOwn(previousField, 'visible') && { visible: previousField.visible })
    };
});

const validateWMS = (layer) => requireValues(layer, ['url', 'name'])
    .then(() => Promise.all(castArray(layer.url).map((url) =>
        getWMSLayerCapabilities({ ...layer, url })
            .toPromise()
            .catch((error) => {
                throw toSourceError(error, 'service');
            })
            .then((layerCapability) => {
                if (!layerCapability) {
                    throw createSourceError('notFound', 'name');
                }
                return layerCapability;
            })
    )))
    .then(() => ({}));

const validateNativeWFS = (layer) => requireValues(layer, ['url', 'name'])
    .then(() => loadFields({
        ...layer,
        describeFeatureTypeURL: undefined,
        search: layer.search && { ...layer.search, url: undefined }
    }, true)
        .catch((error) => {
            throw toSourceError(error, 'notFound');
        }))
    .then((fields) => ({ fields }));

const validateLinkedWFS = (layer) => requireValues(layer, ['searchUrl', 'searchTypeName'])
    .then(() => loadFields({
        ...layer,
        describeFeatureTypeURL: undefined,
        search: { ...layer.search, typeName: SOURCE_FIELDS.searchTypeName.get(layer) }
    }, true)
        .catch((error) => {
            throw toSourceError(error, 'notFound', { service: 'searchUrl', notFound: 'searchTypeName' });
        }))
    .then((fields) => ({ fields }));

const validateWMSName = (layer) => validateWMS(layer)
    .then(() => usesLinkedTypeName(layer) ? validateLinkedWFS(layer) : {});

const validateArcGISFeature = (layer) => requireValues(layer, ['url', 'name'])
    .then(() => getFeatureLayerSchema(layer.url, layer.name, { authSourceId: layer.security?.sourceId })
        .catch((error) => {
            throw toSourceError(error, 'notFound');
        }))
    .then(({ fields, properties, geometryType }) => ({
        fields: mergeArcGISFields(fields, layer.fields),
        properties,
        geometryType
    }));

const VALIDATORS = {
    wms: {
        name: validateWMSName,
        url: validateWMS,
        searchUrl: validateLinkedWFS,
        searchTypeName: validateLinkedWFS
    },
    wfs: {
        name: validateNativeWFS,
        url: validateNativeWFS
    },
    'arcgis-feature': {
        name: validateArcGISFeature
    },
    arcgis: {
        name: (layer) => requireValues(layer, ['name']).then(() => ({}))
    }
};

/**
 * Validates a source field against a layer
 * @param {string} field the field to validate
 * @param {object} layer the layer with the current form values, see toLayer
 * @returns {Promise} resolves with the schema properties to update, rejects with an error with `code` (required, service, notFound or generic) and `field`
 */
export const validateSourceField = (field, layer = {}) => {
    const validate = VALIDATORS[layer.type]?.[field];
    return validate
        ? Promise.resolve().then(() => validate(layer)).catch((error) => {
            throw isSourceError(error) ? error : createSourceError('generic', undefined, error);
        })
        : Promise.resolve({});
};
