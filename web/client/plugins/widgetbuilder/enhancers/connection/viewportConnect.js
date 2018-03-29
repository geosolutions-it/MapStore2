/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {withHandlers, withProps, compose} = require('recompose');
const {omit} = require('lodash');

/**
 * Provides proper handlers and variables to connect a widget to a map viewport in the toolbar or other builders
 * requires:
 *  - editorData object
 *  - onChange: function to change widget properties
 *  - toggleDependencySelector function in case of multiple maps
 *
 */
module.exports = compose(
    withProps(({ editorData = {} }) => ({
        canConnect: editorData.geomProp,
        connected: editorData.mapSync
    })),
    withHandlers({
        toggleConnection: ({ onChange = () => { }, editorData = {} }) => (widget, id) => {
            onChange('mapSync', !editorData.mapSync);
            /*
             * update dependenciesMap to `undefined` if id === map because in this case there is no need to remap
             * because dependencies from main map is named as viewport
             */
            const viewport =
                !editorData.mapSync
                    ? id === 'map'
                        ? 'viewport'
                        : `${id}.viewport`

                    : undefined;
            const {dependenciesMap = {}} = editorData;
            onChange('dependenciesMap', viewport ? { ...dependenciesMap, viewport } : omit(dependenciesMap, 'viewport') );


        }
    }),
    withHandlers({
        toggleConnection: ({ toggleConnection = () => { }, toggleDependencySelector = () => { }, widget, editorData = {}}) =>
            (available = []) => available.length === 1 || editorData.mapSync
                ? toggleConnection(widget, available[0])
                : toggleDependencySelector()
    })
);
