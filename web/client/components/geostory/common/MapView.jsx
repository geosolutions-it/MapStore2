/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {connect} = require('react-redux');
const { createSelector } = require('reselect');
import autoMapType from '../../map/enhancers/autoMapType';
import mapType from '../../map/enhancers/mapType';
import autoResize from '../../map/enhancers/autoResize';
import getProjectionDefs from '../../map/enhancers/getProjectionDefs';
import onMapViewChanges from '../../map/enhancers/onMapViewChanges';
import {compose, withProps} from 'recompose';
import { handlingUnsupportedProjection } from '../../map/enhancers/handlingUnsupportedProjection';
import {withOnClick, withPopupSupport} from './enhancers/withIdentifyPopup';
import {  withoutLocationLayer, withLocationLayer, withLocationClickInEdit, withLocationClick } from './enhancers/withLocationLayer';
import BaseMap from '../../map/BaseMap';
import {getCurrentFocusedContentEl} from '../../../selectors/geostory';

const withCurrentMapLocation = compose(
    connect(createSelector(getCurrentFocusedContentEl, (focusedEl = {}) => ({focusedEl }))),
    withProps(
        ({ focusedEl: {currentMapLocation = "", mapInfoControlTrack = false} = {}}) => {
            return {
                currentMapLocation,
                mapInfoControlTrack
            };
        }
    ));

export default compose(
    onMapViewChanges,
    autoResize(0),
    autoMapType,
    mapType,
    withCurrentMapLocation,
    withoutLocationLayer,
    withLocationLayer,
    withLocationClick,
    withLocationClickInEdit,
    withPopupSupport,
    withOnClick,
    getProjectionDefs,
    handlingUnsupportedProjection
)(BaseMap);
