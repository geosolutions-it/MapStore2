/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { withHandlers, withProps, compose } = require('recompose');
const { omit } = require('lodash');

/**
 * Provides proper handlers and variables to connect a widget to a map viewport in the toolbar or other builders
 * requires:
 *  - editorData object
 *  - onChange: function to change widget properties
 *  - toggleDependencySelector function in case of multiple maps
 *
 */
module.exports = compose(
    withProps(({ availableDependencies = [], editorData = {}} = {}) => ({
        availableDependencies: availableDependencies.filter(d => !(editorData.id && d.indexOf(editorData.id) >= 0))
    })),
    withProps(({ editorData = {} }) => ({
        canConnect: true,
        connected: editorData.mapSync
    })),
    withHandlers({
        toggleConnection: ({ onChange = () => { }, editorData = {} }) => (widget, id) => {
            onChange('mapSync', !editorData.mapSync);
            const center =
                !editorData.mapSync
                    ? id === 'map'
                        ? 'center'
                        : `${id}.center`
                    : undefined;
            const zoom =
                !editorData.mapSync
                    ? id === 'map'
                        ? 'zoom'
                        : `${id}.zoom`
                    : undefined;
            const { dependenciesMap = {} } = editorData;
            onChange('dependenciesMap', !editorData.mapSync && center && zoom !== undefined
                ? { ...dependenciesMap, center, zoom } :
                omit(dependenciesMap, ['center', 'zoom']));


        }
    }),
    withHandlers({
        toggleConnection: ({ toggleConnection = () => { }, toggleDependencySelector = () => { }, widget, editorData = {} }) =>
            (available = []) => available.length === 1 || editorData.mapSync
                ? toggleConnection(widget, available[0])
                : toggleDependencySelector()
    })
);
