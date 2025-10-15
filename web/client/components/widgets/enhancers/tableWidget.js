/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { get } from 'lodash';
import {connect} from 'react-redux';
import { compose, withPropsOnChange } from 'recompose';
import debounce from 'lodash/debounce';
import bbox from '@turf/bbox';
import deleteWidget from './deleteWidget';
import LoadingSpinner from '../../misc/LoadingSpinner';
import { defaultIcons, editableWidget, withHeaderTools } from './tools';
import { zoomToExtent } from '../../../actions/map';
import {error} from '../../../actions/notifications';
import { gridTools } from '../../../plugins/featuregrid/index';
import { getFeature } from '../../../api/WFS';
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
    compose(connect(null, (dispatch, ownProps) => {
        const isZoomEnabled = ownProps?.widgetType === 'table' && ownProps?.enableZoomInTblWidget;
        const isDashboardWidget = isZoomEnabled && !!ownProps?.isDashboardWidget;
        const isMapViewerWidget = isZoomEnabled && !isDashboardWidget;
        const mapWidgetsConnectedWithTable = ownProps?.widgets?.filter(i => i.widgetType === 'map' && i?.dependenciesMap && i?.dependenciesMap?.mapSync?.includes(ownProps.id) && i.mapSync) || [];
        const isMapSync = ownProps?.mapSync || mapWidgetsConnectedWithTable.length;
        return {
            gridTools: (isMapSync && isDashboardWidget) || (isMapViewerWidget) ? gridTools.map((t) => ({
                ...t,
                events: {
                    onClick: async(p, opts, describe, {crs, maxZoom} = {}) => {
                        if (ownProps?.recordZoomLoading) return;
                        try {
                            // fetch feature with geometry and zoom to it if geometry not exist
                            if (!p?.bbox) {
                                ownProps?.updateProperty(ownProps.id, `dependencies.zoomLoader`, true);     // show loader instead of zoom icon
                                let { data: featureData } = await getFeature(ownProps?.layer?.search?.url, ownProps?.layer?.name, {
                                    outputFormat: "application/json",
                                    srsname: 'EPSG:4326',
                                    featureId: p.id,
                                    propertyName: ownProps?.geomProp || "the_geom"          // fetch only the geometry
                                });
                                p.geometry = featureData?.features[0].geometry;     // set geometry to feature for the future hit
                                p.bbox = bbox(featureData?.features[0]);     // set geometry to feature for the future hit
                                if (isDashboardWidget) {       // in case of table widget in dashboard view set extent to widget dependencies
                                    ownProps?.updateProperty(ownProps.id, `dependencies.extentObj`, {
                                        extent: p.bbox,
                                        crs: crs || "EPSG:4326", maxZoom
                                    });
                                } else {        // in case of table widget within the map viewer zoom to the feature
                                    dispatch(zoomToExtent(p.bbox, crs || "EPSG:4326", maxZoom));
                                }
                                ownProps?.updateProperty(ownProps.id, `dependencies.zoomLoader`, false);        // stop zoom loader
                            } else {        // in case the geometry is already existing --> zoom to feature directly without fetching
                                if (isDashboardWidget) {
                                    ownProps?.updateProperty(ownProps.id, `dependencies.extentObj`, {
                                        extent: p.bbox,
                                        crs: crs || "EPSG:4326", maxZoom
                                    });
                                } else {
                                    dispatch(zoomToExtent(p.bbox, crs || "EPSG:4326", maxZoom));
                                }
                            }
                        } catch (err) {
                            dispatch(error({
                                title: "notification.warning",
                                message: "notification.errorLoadingGF",
                                action: {
                                    label: "notification.warning"
                                },
                                autoDismiss: 3,
                                position: "tc"
                            }));
                            ownProps?.updateProperty(ownProps.id, `dependencies.zoomLoader`, false);    // stop zoom loader
                        }
                    }
                }, formatter: ownProps?.recordZoomLoading ? <React.Fragment><span><LoadingSpinner /></span></React.Fragment> : t.tableWidgetFormatter
            })) : []
        };
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
