/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'lodash';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import { compose, withPropsOnChange, withProps } from 'recompose';
import debounce from 'lodash/debounce';
import bbox from '@turf/bbox';
import deleteWidget from './deleteWidget';
import { defaultIcons, editableWidget, withHeaderTools } from './tools';
import { gridTools } from '../../../plugins/featuregrid/index';
const withSorting = () => withPropsOnChange(["gridEvents"], ({ gridEvents = {}, updateProperty = () => { }, id } = {}) => ({
    gridEvents: {
        ...gridEvents,
        onGridSort: (sortBy, sortOrder) => updateProperty(id, "sortOptions", { sortBy, sortOrder })
    }
}));
/**
 * enhancer that updates widget column size on resize. and add base icons and menus
 * Moreover enhances it to allow delete.
*/
export default compose(
    compose(connect(null, (dispatch, ownProps)=>{
        let geoPropName = ownProps?.geomProp;
        let hasGeometryProp = !(ownProps?.columnSettings && ownProps?.columnSettings[geoPropName]?.hide);
        let isTblDashboard = ownProps?.mapSync && ownProps?.widgetType === 'table' && ownProps?.isDashboardOpened;
        let isTblSyncWithMap = ownProps?.mapSync;
        return {
            gridTools: (hasGeometryProp && isTblSyncWithMap) ? gridTools.map((t) => ({
                ...t,
                events: isTblDashboard ? {
                    onClick: (p, opts, describe, {crs, maxZoom} = {}) => {
                        ownProps?.updateProperty(ownProps.id, `dependencies.extentObj`, {
                            extent: bbox(p),
                            crs: crs || "EPSG:4326", maxZoom
                        });
                    }
                } : bindActionCreators(t.events, dispatch)
            })) : []
        };
    })),
    withProps(()=>({
        showCheckbox: true          // for selection
    })),
    withPropsOnChange(["gridEvents"], ({ gridEvents = {}, updateProperty = () => {}, id } = {}) => {
        const _debounceOnAddFilter = debounce((...args) => updateProperty(...args), 500);
        return {
            gridEvents: {
                ...gridEvents,
                onAddFilter: (widgetFilter) => _debounceOnAddFilter(id, `quickFilters.${widgetFilter.attribute}`, widgetFilter),
                onColumnResize:
                (colIdx, width, rg, d, a, columns) =>
                    updateProperty(id, `options.columnSettings["${get(columns.filter(c => !c.hide)[colIdx], "name")}"].width`, width)
            }
        };
    }),
    deleteWidget,
    editableWidget(),
    defaultIcons(),
    withHeaderTools(),
    withSorting()
);
