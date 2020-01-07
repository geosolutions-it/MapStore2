/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withPropsOnChange } = require('recompose');
const { get } = require('lodash');
const {editableWidget, withHeaderTools, defaultIcons} = require('./tools');

/**
 * enhancer that updates widget column size on resize. and add base icons and menus
 * Moreover enhances it to allow delete.
*/
module.exports = compose(
    withPropsOnChange(["gridEvents"], ({ gridEvents = {}, updateProperty = () => {} } = {}) => ({
        gridEvents: {
            ...gridEvents,
            onAddFilter: (widgetFilter) => updateProperty(`quickFilters.${widgetFilter.attribute}`, widgetFilter),
            onColumnResize:
                (colIdx, width, rg, d, a, columns) =>
                    updateProperty(`options.columnSettings["${get(columns.filter(c => !c.hide)[colIdx], "name")}"].width`, width)
        }
    })),
    require('./deleteWidget'),
    editableWidget(),
    defaultIcons(),
    withHeaderTools()
);
