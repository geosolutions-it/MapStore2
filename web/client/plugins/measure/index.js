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
import {
    toggleMeasurement,
    changeMeasurementState,
    changeGeometry,
    resetGeometry,
    updateMeasures,
    setTextLabels,
    changeMeasurement,
    init,
    changeUom
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
// number format localization for measurements
const addFormatNumber = addI18NProps(['formatNumber']);

export const MeasureComponent = MeasureComponentComp;
export const MeasureDialog = MeasureDialogComp;

const measureSupports = {
    leaflet: lazy(() => import(/* webpackChunkName: 'supports/leafletMeasure' */ '../../components/map/leaflet/MeasurementSupport')),
    openlayers: lazy(() => import(/* webpackChunkName: 'supports/olMeasure' */ '../../components/map/openlayers/MeasurementSupport')),
    cesium: lazy(() => import(/* webpackChunkName: 'supports/cesiumMeasure' */ '../../components/map/cesium/MeasurementSupport'))
};

const MeasureSupportWithFormatNumber = addFormatNumber(({
    mapType,
    defaultOptions,
    onInit,
    ...props
}) => {
    const Support = measureSupports[mapType];
    return Support
        ? (<Suspense fallback={<div/>}>
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

    return <MeasureSupportWithFormatNumber {...props} />;
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
        onChangeUnitOfMeasure: changeUom
    }
)(MeasureSupportComponent);

export default {
    MeasureComponent,
    MeasureDialog,
    MeasureSupport
};
