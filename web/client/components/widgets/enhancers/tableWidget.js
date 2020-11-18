/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'lodash';
import { compose, withPropsOnChange } from 'recompose';

import deleteWidget from './deleteWidget';
import { defaultIcons, editableWidget, withHeaderTools } from './tools';

const withSorting = () => withPropsOnChange(["gridEvents"], ({ gridEvents = {}, updateProperty = () => { } } = {}) => ({
    gridEvents: {
        ...gridEvents,
        onGridSort: (sortBy, sortOrder) => updateProperty("sortOptions", { sortBy, sortOrder })
    }
}));
/**
 * enhancer that updates widget column size on resize. and add base icons and menus
 * Moreover enhances it to allow delete.
*/
export default compose(
    withPropsOnChange(["gridEvents"], ({ gridEvents = {}, updateProperty = () => {} } = {}) => ({
        gridEvents: {
            ...gridEvents,
            onAddFilter: (widgetFilter) => updateProperty(`quickFilters.${widgetFilter.attribute}`, widgetFilter),
            onColumnResize:
                (colIdx, width, rg, d, a, columns) =>
                    updateProperty(`options.columnSettings["${get(columns.filter(c => !c.hide)[colIdx], "name")}"].width`, width)
        }
    })),
    deleteWidget,
    editableWidget(),
    defaultIcons(),
    withHeaderTools(),
    withSorting()
);
