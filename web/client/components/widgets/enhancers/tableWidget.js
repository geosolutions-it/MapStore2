/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withPropsOnChange} = require('recompose');
const {get} = require('lodash');
/**
 * Enhances the table widget to connect to WFS and to update widget column size on resize.
 * Moreover enhances it to allow delete.
*/
module.exports = compose(
    require('./wfsTable'),
    withPropsOnChange(["gridEvents"], ({gridEvents = {}, updateProperty = () => {}} = {}) => ({
        gridEvents: {
            ...gridEvents,
            onColumnResize:
                (colIdx, width, rg, d, a, columns) =>
                    updateProperty(`options.columnSettings["${get(columns.filter(c => !c.hide)[colIdx], "name")}"].width`, width)
        }
    })),
    require('./deleteWidget')
);
