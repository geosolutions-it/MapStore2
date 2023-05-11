/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { lazy, Suspense, useEffect } from 'react';
import MeasureComponentComp from '../../components/mapcontrols/measure/MeasureComponent';
import MeasureDialogComp from '../../components/mapcontrols/measure/MeasureDialog';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { setControlProperty } from '../../actions/controls';
import {
    toggleMeasurement,
    changeMeasurementState,
    changeGeometry,
    resetGeometry,
    updateMeasures,
    setTextLabels,
    changeMeasurement,
    init,
    changeUom,
    addAsLayer
} from '../../actions/measurement';
import {
    isActiveSelector,
    measurementSelector
} from '../../selectors/measurement';
import {
    MeasureTypes,
    defaultUnitOfMeasure
} from '../../utils/MeasureUtils';
import addI18NProps from '../../components/I18N/enhancers/addI18NProps';
import Loader from '../../components/misc/Loader';
import MeasureToolbar from '../../components/mapcontrols/measure/MeasureToolbar';
import { MapLibraries } from '../../utils/MapTypeUtils';

// number format localization for measurements
const addFormatNumber = addI18NProps(['formatNumber']);

export const MeasureComponent = MeasureComponentComp;
export const MeasureDialog = MeasureDialogComp;

const measureSupports = {
    [MapLibraries.LEAFLET]: lazy(() => import(/* webpackChunkName: 'supports/leafletMeasure' */ '../../components/map/leaflet/MeasurementSupport')),
    [MapLibraries.OPENLAYERS]: lazy(() => import(/* webpackChunkName: 'supports/olMeasure' */ '../../components/map/openlayers/MeasurementSupport')),
    [MapLibraries.CESIUM]: lazy(() => import(/* webpackChunkName: 'supports/cesiumMeasure' */ '../../components/map/cesium/MeasurementSupport'))
};

const MeasureSupportWithFormatNumber = addFormatNumber(({
    mapType,
    defaultOptions,
    onInit,
    ...props
}) => {
    const Support = measureSupports[mapType];
    return Support
        ? (<Suspense fallback={<MeasureToolbar onClose={props.onClose}><Loader size={20} /></MeasureToolbar>}>
            <Support
                {...props}
                {...defaultOptions}
                unitsOfMeasure={Object.keys(props.uom)
                    .reduce((acc, key) => ({
                        ...acc,
                        [key]: { ...props.uom[key], value: props.uom[key].unit || props.uom[key].value }
                    }), {})}
                defaultMeasureType={defaultOptions?.geomType || MeasureTypes.POLYLINE_DISTANCE_3D}
                hideInfoLabel={
                    defaultOptions?.showLabel === undefined
                        ? false
                        : !defaultOptions?.showLabel
                }
                hideSegmentsLengthLabels={
                    defaultOptions?.showSegmentLengths === undefined
                        ? false
                        : !defaultOptions?.showSegmentLengths
                }
            />
        </Suspense>)
        : null;
});

function MeasureSupportComponent({ onInit, ...props }) {
    // initialize all the default options
    // we could not use hook in MeasureSupportWithFormatNumber because of the enhancer
    useEffect(() => {
        onInit(props.defaultOptions);
    }, [props.defaultOptions]);

    // it is better to rest the measure state
    // until we have same type of measure in between map type
    useEffect(() => {
        props.onChangeMeasureType(null);
    }, [props.mapType]);

    // prevent the component load via lazy/suspense
    // if the support is not enabled
    return props.enabled ? <MeasureSupportWithFormatNumber {...props} /> : null;
}

export const MeasureSupport = connect(
    createSelector([
        isActiveSelector,
        state => state?.controls?.measure?.enabled || false,
        state => state?.measurement?.geomType,
        // TODO TEST selector to validate the feature: filter the coords, if length >= minValue return ft validated (close the polygon) else empty ft
        measurementSelector
    ], (active, enabled, measureType, measurement) => ({
        active,
        enabled,
        measureType,
        measurement,
        useTreshold: measurement?.useTreshold || null,
        uom: measurement?.uom || defaultUnitOfMeasure
    })),
    {
        onChangeMeasureType: (measureType) => toggleMeasurement({ geomType: measureType }),
        onUpdateFeatures: changeGeometry,
        onInit: init,
        changeMeasurementState,
        updateMeasures,
        resetGeometry,
        changeGeometry,
        setTextLabels,
        changeMeasurement,
        onChangeUnitOfMeasure: changeUom,
        onClose: setControlProperty.bind(null, 'measure', 'enabled', false),
        onAddAsLayer: addAsLayer
    }
)(MeasureSupportComponent);

export default {
    MeasureComponent,
    MeasureDialog,
    MeasureSupport
};
