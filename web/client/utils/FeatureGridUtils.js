/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import { identity, trim, fill, findIndex, get, isArray, isNil, isString } from 'lodash';

import {
    findGeometryProperty,
    getFeatureTypeProperties,
    getPropertyDesciptor,
    isGeometryType,
    isValid,
    isValidValueForPropertyName as isValidValueForPropertyNameBase
} from './ogc/WFS/base';

const getGeometryName = (describe) => get(findGeometryProperty(describe), "name");
const getPropertyName = (name, describe) => name === "geometry" ? getGeometryName(describe) : name;

export const getBlockIdx = (indexes = [], size = 0, rowIdx) => findIndex(indexes, (startIdx) => startIdx <= rowIdx && rowIdx < startIdx + size);

/** Features are stored in an array grupped by block of pages. The page could be loaded unorderd
 * This function recover the correct rowIndex in features, given the array of indexes
 * of loaded page and the page size.
 * @param  {int}   rowIdx React-data-grid idex to search
 * @param  {Array} idxes  Array of loaded pages start index
 * @param  {size}  size   Page size
 * @return {int}          The new correspondinx index in features array or -1 if not present
 */
export const getRowIdx = (rowIdx, indexes, size) => {
    const blockIdx = getBlockIdx(indexes, size, rowIdx);
    return blockIdx === -1 ? blockIdx : blockIdx * size + rowIdx - indexes[blockIdx];
};

// const getRow = (i, rows) => rows[i];
const EMPTY_ROW = {id: "empty_row", get: () => undefined};

export const getRowVirtual = (i, rows, pages = [], size) => rows[getRowIdx(i, pages, size)] || {...EMPTY_ROW};
export const getRow = (i, rows) => rows[i];

/* eslint-disable */

export const toChangesMap = (changesArray = []) => isArray(changesArray) ? changesArray.reduce((changes, c) => ({
    ...changes,
    [c.id]: {
        ...changes[c.id],
        ...c.updated
    }
}), {}) : {};
export const applyChanges = (feature, changes) => {
    const propChanges = Object.keys(changes).filter(k => k !== "geometry").reduce((acc, cur) => ({
        ...acc,
        [cur]: changes[cur]
    }), {});
    const geomChanges = Object.keys(changes).filter(k => k === "geometry").reduce((acc, cur) => ({
        ...acc,
        [cur]: changes[cur]
    }), {});
    return {
        ...feature,
        ...geomChanges,
        properties: {
            ...(feature && feature.properties || {}),
            ...propChanges
        }
    };
};
/* eslint-enable */
/**
 * Updates or insert in the array a new object.
 * @param  {Array}  [filterFields=[]] The array to update
 * @param  {object} filter             the filter to use for replace
 * @param  {object} newObject         the new object to insert
 * @return {Array}                   The new array with the modified/new element.
 */
const upsertFilterField = (filterFields = [], filter, newObject) => {
    const index = findIndex(filterFields, filter);
    if ( index >= 0) {
        return filterFields.map((f, i) => i === index ? newObject : f);
    }
    return [...filterFields, newObject];
};
export const getAttributeFields = (describe) => (getFeatureTypeProperties(describe) || []).filter( e => !isGeometryType(e));

// virtual scroll utility functions
const getIdxFarthestEl = (startIdx, pages = [], firstRow, lastRow) => {
    return pages.map(val => firstRow <= val && val <= lastRow ? 0 : Math.abs(val - startIdx)).reduce((i, distance, idx, vals) => distance > vals[i] && idx || i, 0);
};
const removePage = (idxFarthestEl, pages) => pages.filter((el, i) => i !== idxFarthestEl);
const removePageFeatures = (features, idxToRemove, size) => features.filter((el, i) => i < idxToRemove || i >= idxToRemove + size);
export const getPagesToLoad = (startPage, endPage, pages, size) => {
    let firstMissingPage;
    let lastMissingPage;
    for (let i = startPage; i <= endPage && firstMissingPage === undefined; i++) {
        if (getRowIdx(i * size, pages, size) === -1) {
            firstMissingPage = i;
        }
    }
    for (let i = endPage; i >= startPage && lastMissingPage === undefined; i--) {
        if (getRowIdx(i * size, pages, size) === -1) {
            lastMissingPage = i;
        }
    }
    return [firstMissingPage, lastMissingPage].filter(p => p !== undefined);
};
// return the options for the paged request to get checking the current cached data
export const getCurrentPaginationOptions = ({ startPage, endPage }, oldPages, size) => {
    const nPs = getPagesToLoad(startPage, endPage, oldPages, size);
    const needPages = (nPs[1] - nPs[0] + 1);
    return { startIndex: nPs[0] * size, maxFeatures: needPages * size };
};


export const featureTypeToGridColumns = (
    describe,
    columnSettings = {},
    {editable = false, sortable = true, resizable = true, filterable = true, defaultSize = 200} = {},
    {getEditor = () => {}, getFilterRenderer = () => {}, getFormatter = () => {}} = {}) =>
    getAttributeFields(describe).filter(e => !(columnSettings[e.name] && columnSettings[e.name].hide)).map( (desc) => ({
        sortable,
        key: desc.name,
        width: columnSettings[desc.name] && columnSettings[desc.name].width || (defaultSize ? defaultSize : undefined),
        name: columnSettings[desc.name] && columnSettings[desc.name].label || desc.name,
        resizable,
        editable,
        filterable,
        editor: getEditor(desc),
        formatter: getFormatter(desc),
        filterRenderer: getFilterRenderer(desc, desc.name)
    }));
/**
 * Create a column from the configruation. Maps the events to call a function with the whole property
 * @param  {array} toolColumns Array of the tools configurations
 * @param  {array} rows        Data rows
 * @return {array}             Array of the columns to use in react-data-grid, with proper event bindings.
 */
export const getToolColumns = (toolColumns = [], rowGetter = () => {}, describe, actionOpts, getFilterRenderer = () => {}) => {
    const geometryProperty = findGeometryProperty(describe);

    return toolColumns.map(tool => ({
        ...tool,
        events: tool.events && Object.keys(tool.events).reduce( (events, key) => ({
            ...events,
            [key]: (evt, opts) => tool.events[key](rowGetter(opts.rowIdx), opts, describe, actionOpts)
        }), {}),
        ...(tool.key === 'geometry' && geometryProperty ? {
            filterRenderer: getFilterRenderer({...geometryProperty, localType: 'geometry'}, geometryProperty.name),
            filterable: true,
            geometryPropName: geometryProperty.name
        } : {})
    }));
};
/**
 * Maps every grid event to a function that passes all the arguments, plus the rowgetter, describe and actionOpts passed
 * @param  {Object} [gridEvents={}] The functions to call
 * @param  {function} rowGetter     the method to retrieve the feature
 * @param  {object} describe        the describe feature type
 * @param  {object} actionOpts      some options
 * @param  {object} columns         columns definition
 * @return {object}                 The events with the additional parameters
 */
export const getGridEvents = (gridEvents = {}, rowGetter, describe, actionOpts, columns) => Object.keys(gridEvents).reduce((events, currentEventKey) => ({
    ...events,
    [currentEventKey]: (...args) => gridEvents[currentEventKey](...args, rowGetter, describe, actionOpts, columns)
}), {});
export const isProperty = (k, d) => !!getPropertyDesciptor(k, d);
export const isValidValueForPropertyName = (v, k, d) => isValidValueForPropertyNameBase(v, getPropertyName(k, d), d);
export const getDefaultFeatureProjection = () => "EPSG:4326";

export const createNewAndEditingFilter = (hasChanges, newFeatures, changes) => f => newFeatures.length > 0 ? f._new : !hasChanges || hasChanges && !!changes[f.id];
export const hasValidNewFeatures = (newFeatures = [], describeFeatureType) => newFeatures.map(f => isValid(f, describeFeatureType)).reduce((acc, cur) => cur && acc, true);
export const applyAllChanges = (orig, changes = {}) => applyChanges(orig, changes[orig.id] || {});

export const EXPRESSION_REGEX = /\s*(!==|!=|<>|<=|>=|===|==|=|<|>)?\s*(-?\d*\.?\d*)\s*/;

/**
 * handle parsing of raw values for string and number types
 * @param {string} value the value in string form, with operator in case of number
 * @param {string} type the type of the value, number or string
 */
export const getOperatorAndValue = (value, type) => {
    if (type === "string") {
        return {newVal: trim(value), operator: "ilike"};
    }
    const match = EXPRESSION_REGEX.exec(value);
    let operator = "=";
    let newVal;
    if (match) {
        operator = match[1] || "=";
        // replace with standard operators
        if (operator === "!==" | operator === "!=") {
            operator = "<>";
        } else if (operator === "===" | operator === "==") {
            operator = "=";
        }
        newVal = parseFloat(match[2]);
    } else {
        newVal = parseFloat(value, 10);
    }
    return {newVal, operator};
};


export const gridUpdateToQueryUpdate = ({attribute, operator, value, type} = {}, oldFilterObj = {}) => {

    const cleanGroupFields = oldFilterObj.groupFields?.filter((group) => attribute !== group.id && group.id !== 1 ) || [];
    if ((type === 'string' || type === 'number') && isString(value) && value?.indexOf(",") !== -1) {
        const multipleValues = value?.split(",").filter(identity) || [];
        const cleanFilterFields = oldFilterObj.filterFields?.filter((field) => attribute !== field.attribute) || [];
        return {
            ...oldFilterObj,
            groupFields: cleanGroupFields.concat([
                {
                    id: attribute,
                    logic: "OR",
                    groupId: 1,
                    index: 0
                }]),
            filterFields: cleanFilterFields.concat(multipleValues.map((v) => {
                let {operator: op, newVal} = getOperatorAndValue(v, type);

                return {
                    attribute,
                    rowId: Date.now(),
                    type: type,
                    groupId: attribute,
                    operator: op,
                    value: newVal
                };
            })),
            spatialField: oldFilterObj.spatialField,
            spatialFieldOperator: oldFilterObj.spatialFieldOperator
        };
    }

    return {
        ...oldFilterObj,
        groupFields: cleanGroupFields.concat([
            {
                id: 1,
                logic: "AND",
                groupId: 1,
                index: 0
            }]),
        filterFields: type === 'geometry' ? oldFilterObj.filterFields : !isNil(value)
            ? upsertFilterField((oldFilterObj.filterFields || []), {attribute: attribute}, {
                attribute,
                rowId: Date.now(),
                type,
                groupId: 1,
                operator,
                value

            })
            : (oldFilterObj.filterFields || []).filter(field => field.attribute !== (attribute)),
        spatialField: type === 'geometry' ?
            value :
            oldFilterObj.spatialField,
        spatialFieldOperator: isArray(value) ? "OR" : ""
    };
};
export const toPage = ({startIndex = 0, maxFeatures = 1, totalFeatures = 0, resultSize} = {}) => ({
    page: Math.ceil(startIndex / maxFeatures),
    resultSize,
    size: maxFeatures,
    total: totalFeatures,
    maxPages: Math.ceil(totalFeatures / maxFeatures) - 1
});

/**
 * updates the pages and the features of the request to support virtual scroll.
 * This is virtual scroll with support for
 * @param {object} result An object with result --> geoJSON of type "FeatureCollection"
 * @param {object} requestOptions contains startPage and endPage needed.
 * @param {object} oldData features and pages previously loaded
 * @param {object} paginationOptions. The options for pagination `size` and `maxStoredPages`, .
 *
 */
export const updatePages = (result, { endPage, startPage } = {}, { pages, features } = {}, {size, maxStoredPages, startIndex} = {}) => {
    const nPs = getPagesToLoad(startPage, endPage, pages, size);
    const needPages = (nPs[1] - nPs[0] + 1);
    let fts = get(result, "features", []);
    if (fts.length !== needPages * size) {
        fts = fts.concat(fill(Array(needPages * size - fts.length > 0 ? needPages * size - fts.length : fts.length ), false));
    }
    let oldPages = pages;
    let oldFeatures = features;
    // Cached page should be less than the max of maxStoredPages or the number of page needed to fill the visible area of the grid
    const nSpaces = oldPages.length + needPages - Math.max(maxStoredPages, (endPage - startPage + 1));
    if (nSpaces > 0) {
        const firstRow = startPage * size;
        const lastRow = endPage * size;
        // Remove the farthest page from last loaded pages
        const averageIdx = firstRow + (lastRow - firstRow) / 2;
        for (let i = 0; i < nSpaces; i++) {
            const idxFarthestEl = getIdxFarthestEl(averageIdx, pages, firstRow, lastRow);
            const idxToRemove = idxFarthestEl * size;
            oldPages = removePage(idxFarthestEl, oldPages);
            oldFeatures = removePageFeatures(features, idxToRemove, size);
        }
    }
    let pagesLoaded = [];
    for (let i = 0; i < needPages; i++) {
        pagesLoaded.push(startIndex + (size * i));
    }
    return { pages: oldPages.concat(pagesLoaded), features: oldFeatures.concat(fts) };
};
