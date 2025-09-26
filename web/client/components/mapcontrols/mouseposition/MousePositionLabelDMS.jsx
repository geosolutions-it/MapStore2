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

const MousePositionLabelDMS = ({ position }) => {
    const getPositionValues = (mPos) => {
        const {lng, lat} = mPos || {};
        // If lat or lng are not valid numbers, use 0
        const validLat = (lat !== undefined && lat !== null && !isNaN(lat)) ? lat : 0;
        const validLng = (lng !== undefined && lng !== null && !isNaN(lng)) ? lng : 0;
        const latM = validLat % 1 * 60;
        const lngM = validLng % 1 * 60;
        const latS = latM % 1 * 60;
        const lngS = lngM % 1 * 60;
        return {
            lat: Math.trunc(validLat),
            latM: Math.abs(latM),
            latS: Math.abs(latS),
            lng: Math.trunc(validLng),
            lngM: Math.abs(lngM),
            lngS: Math.abs(lngS)
        };
    };

    const {lng, lat} = position || {};
    const pos = getPositionValues(position);
    const lgnSign = lng < 0 ? "-" : "";
    const latSign = lat < 0 ? "-" : "";
    const integerFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 0};
    const decimalFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 2, minimumFractionDigits: 2};
    const lngDFormat = {style: "decimal", minimumIntegerDigits: 3, maximumFractionDigits: 0};

    return (
        <>
            <span>
                {"Lat: "}
                {latSign ? `${latSign} ` : null}
                <NumberFormat key="latD" numberParams={integerFormat} value={Math.abs(pos.lat)}/>
                {"° "}
                <NumberFormat key="latM" numberParams={integerFormat} value={roundCoord({roundingBehaviour: "floor", value: pos.latM, maximumFractionDigits: integerFormat.maximumFractionDigits})} />
                {"' "}
                <NumberFormat key="latS" numberParams={decimalFormat} value={pos.latS} />
                {"''"}
            </span>
            <span>
                {"Lng: "}
                {lgnSign ? `${lgnSign} ` : null}
                <NumberFormat key="lngD" numberParams={lngDFormat} value={Math.abs(pos.lng)} />
                {"° "}
                <NumberFormat key="lngM" numberParams={integerFormat} value={roundCoord({roundingBehaviour: "floor", value: pos.lngM, maximumFractionDigits: integerFormat.maximumFractionDigits})} />
                {"' "}
                <NumberFormat key="lngS" numberParams={decimalFormat} value={pos.lngS} />
                {"''"}
            </span>
        </>
    );
};

MousePositionLabelDMS.propTypes = {
    position: PropTypes.shape({
        lng: PropTypes.number,
        lat: PropTypes.number
    })
};

export default MousePositionLabelDMS;
