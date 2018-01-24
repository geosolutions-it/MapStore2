 /**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const {get, findIndex, isNil} = require('lodash');

const {getFeatureTypeProperties, isGeometryType, isValid, isValidValueForPropertyName, findGeometryProperty, getPropertyDesciptor} = require('./ogc/WFS/base');
const getGeometryName = (describe) => get(findGeometryProperty(describe), "name");
const getPropertyName = (name, describe) => name === "geometry" ? getGeometryName(describe) : name;

const getBlockIdx = (indexes = [], size = 0, rowIdx) => findIndex(indexes, (startIdx) => startIdx <= rowIdx && rowIdx < startIdx + size);

/** Features are stored in an array grupped by block of pages. The page could be loaded unorderd
 * This function recover the correct rowIndex in features, given the array of indexes
 * of loaded page and the page size.
 * @param  {int}   rowIdx React-data-grid idex to search
 * @param  {Array} idxes  Array of loaded pages start index
 * @param  {size}  size   Page size
 * @return {int}          The new correspondinx index in features array or -1 if not present
 */
const getRowIdx = (rowIdx, indexes, size) => {
    const blockIdx = getBlockIdx(indexes, size, rowIdx);
    return blockIdx === -1 ? blockIdx : blockIdx * size + rowIdx - indexes[blockIdx];
};

// const getRow = (i, rows) => rows[i];
const EMPTY_ROW = {id: "empty_row", get: () => undefined};

const getRowVirtual = (i, rows, pages = [], size) => rows[getRowIdx(i, pages, size)] || {...EMPTY_ROW};
const getRow = (i, rows) => rows[i];

/* eslint-disable */

const toChangesMap = (changesArray) => changesArray.reduce((changes, c) => ({
    ...changes,
    [c.id]: {
        ...changes[c.id],
        ...c.updated
    }
}), {});
const applyChanges = (feature, changes) => {
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
const getAttributeFields = (describe) => (getFeatureTypeProperties(describe) || []).filter( e => !isGeometryType(e));


module.exports = {
    getAttributeFields,
    featureTypeToGridColumns: (
            describe,
            columnSettings = {},
            {editable=false, sortable=true, resizable=true, filterable = true} = {},
            {getEditor = () => {}, getFilterRenderer = () => {}, getFormatter = () => {}} = {}) =>
        getAttributeFields(describe).filter(e => !(columnSettings[e.name] && columnSettings[e.name].hide)).map( (desc) => ({
                sortable,
                key: desc.name,
                width: columnSettings[desc.name] && columnSettings[desc.name].width || 200,
                name: desc.name,
                resizable,
                editable,
                filterable,
                editor: getEditor(desc),
                formatter: getFormatter(desc),
                filterRenderer: getFilterRenderer(desc, desc.name)
        })),
    getRow,
    getRowVirtual,
    /**
     * Create a column from the configruation. Maps the events to call a function with the whole property
     * @param  {array} toolColumns Array of the tools configurations
     * @param  {array} rows        Data rows
     * @return {array}             Array of the columns to use in react-data-grid, with proper event bindings.
     */
    getToolColumns: (toolColumns = [], rowGetter = () => {}, describe, actionOpts) => toolColumns.map(tool => ({
        ...tool,
        events: tool.events && Object.keys(tool.events).reduce( (events, key) => ({
            ...events,
            [key]: (evt, opts) => tool.events[key](rowGetter(opts.rowIdx), opts, describe, actionOpts)
        }), {})
        })
    ),
    /**
     * Maps every grid event to a function that passes all the arguments, plus the rowgetter, describe and actionOpts passed
     * @param  {Object} [gridEvents={}] The functions to call
     * @param  {function} rowGetter     the method to retrieve the feature
     * @param  {object} describe        the describe feature type
     * @param  {object} actionOpts      some options
     * @return {object}                 The events with the additional parameters
     */
    getGridEvents: (gridEvents = {}, rowGetter, describe, actionOpts) => Object.keys(gridEvents).reduce((events, currentEventKey) => ({
        ...events,
        [currentEventKey]: (...args) => gridEvents[currentEventKey](...args, rowGetter, describe, actionOpts)
    }), {}),
    isProperty: (k, d) => !!getPropertyDesciptor(k, d),
    isValidValueForPropertyName: (v, k, d) => isValidValueForPropertyName(v, getPropertyName(k, d), d),
    getDefaultFeatureProjection: () => "EPSG:4326",
    toChangesMap,
    createNewAndEditingFilter: (hasChanges, newFeatures, changes) => f => newFeatures.length > 0 ? f._new : !hasChanges || hasChanges && !!changes[f.id],
    hasValidNewFeatures: (newFeatures=[], describeFeatureType) => newFeatures.map(f => isValid(f, describeFeatureType)).reduce((acc, cur) => cur && acc, true),
    applyAllChanges: (orig, changes = {}) => applyChanges(orig, changes[orig.id] || {}),
    applyChanges,
    gridUpdateToQueryUpdate: ({attribute, operator, value, type} = {}, oldFilterObj = {}) => {
        return {
            ...oldFilterObj,
            groupFields: [{
                id: 1,
                logic: "AND",
                index: 0
            }],
            filterFields: !isNil(value)
                ? upsertFilterField((oldFilterObj.filterFields || []), {attribute: attribute}, {
                    attribute,
                    rowId: Date.now(),
                    type,
                    groupId: 1,
                    operator,
                    value

                })
                : (oldFilterObj.filterFields || []).filter(field => field.attribute !== (attribute))
        };
    },
    toPage: ({startIndex = 0, maxFeatures = 1, totalFeatures = 0, resultSize} = {}) => ({
        page: Math.ceil(startIndex / maxFeatures),
        resultSize,
        size: maxFeatures,
        total: totalFeatures,
        maxPages: Math.ceil(totalFeatures / maxFeatures) - 1
    }),
    getRowIdx,
    getPagesToLoad: (startPage, endPage, pages, size) => {
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
    },
    getIdxFarthestEl: (startIdx, pages = [], firstRow, lastRow) => {
        return pages.map(val => firstRow <= val && val <= lastRow ? 0 : Math.abs(val - startIdx)).reduce((i, distance, idx, vals) => distance > vals[i] && idx || i, 0);
    },
    removePage: (idxFarthestEl, pages) => pages.filter( (el, i) => i !== idxFarthestEl),
    removePageFeatures: (features, idxToRemove, size) => features.filter((el, i) => i < idxToRemove || i >= idxToRemove + size)
};
