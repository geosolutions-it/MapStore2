/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';

import { roundCoord } from '../../../utils/CoordinatesUtils';
import NumberFormat from '../../I18N/Number';

const MousePositionLabelDMSNW = ({ position }) => {
    // Helper function to calculate position values
    const getPositionValues = (mPos) => {
        const {lng, lat} = mPos ? mPos : [null, null];
        const [latM, lngM] = [lat % 1 * 60, lng % 1 * 60];
        const [latS, lngS] = [latM % 1 * 60, lngM % 1 * 60];
        return {
            lat,
            latM: Math.abs(latM),
            latS: Math.abs(latS),
            lng,
            lngM: Math.abs(lngM),
            lngS: Math.abs(lngS)
        };
    };

    const pos = getPositionValues(position);
    const integerFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 0};
    const decimalFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 2, minimumFractionDigits: 2};
    const lngDFormat = {style: "decimal", minimumIntegerDigits: 3, maximumFractionDigits: 0};

    return (
        <>
            <span>Lat: <NumberFormat key="latD" numberParams={integerFormat} value={roundCoord({roundingBehaviour: "floor", value: Math.abs(pos.lat), maximumFractionDigits: integerFormat.maximumFractionDigits})} />{"° "}<NumberFormat key="latM" numberParams={integerFormat} value={roundCoord({roundingBehaviour: "floor", value: pos.latM, maximumFractionDigits: integerFormat.maximumFractionDigits})} /> {"' "} <NumberFormat key="latS" numberParams={decimalFormat} value={pos.latS} /> {"''"} {pos.lat > 0 ? "N" : "S"}
            </span>
            <span>Lng: <NumberFormat key="lngD" numberParams={lngDFormat} value={roundCoord({roundingBehaviour: "floor", value: Math.abs(pos.lng), maximumFractionDigits: lngDFormat.maximumFractionDigits})} />{"° "}<NumberFormat key="lngM" numberParams={integerFormat} value={roundCoord({roundingBehaviour: "floor", value: pos.lngM, maximumFractionDigits: integerFormat.maximumFractionDigits})} />   {"' "}<NumberFormat key="lngS" numberParams={decimalFormat} value={pos.lngS} /> {"''"} {pos.lng > 0 ? "E" : "W"}
            </span>
        </>
    );
};

MousePositionLabelDMSNW.propTypes = {
    position: PropTypes.shape({
        lng: PropTypes.number,
        lat: PropTypes.number
    })
};

export default MousePositionLabelDMSNW;
