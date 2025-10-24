/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isNil } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { roundCoord } from '../../../utils/CoordinatesUtils';
import NumberFormat from '../../I18N/Number';

const MousePositionLabelDM = ({ position }) => {
    const getPositionValues = (mPos) => {
        const {lng, lat} = mPos ? mPos : [null, null];
        const [latM, lngM] = [lat % 1 * 60, lng % 1 * 60];
        return {
            lat,
            latM: Math.abs(latM),
            lng,
            lngM: Math.abs(lngM)
        };
    };

    const pos = getPositionValues(position);
    const integerFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 0};
    const decimalFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 3, minimumFractionDigits: 3};
    const lngDFormat = {style: "decimal", minimumIntegerDigits: 3, maximumFractionDigits: 0};

    return (
        <>
            <span>Lat: <NumberFormat key="latD" numberParams={integerFormat} value={isNil(pos.lat) ? pos.lat : roundCoord({roundingBehaviour: "floor", value: pos.lat, maximumFractionDigits: integerFormat.maximumFractionDigits})} />{"° "} <NumberFormat key="latM" numberParams={decimalFormat} value={pos.latM} /> {"' "}
            </span>
            <span>Lng: <NumberFormat key="lngD" numberParams={lngDFormat} value={isNil(pos.lng) ? pos.lng : roundCoord({roundingBehaviour: "floor", value: pos.lng, maximumFractionDigits: lngDFormat.maximumFractionDigits})} />{"° "} <NumberFormat key="lngM" numberParams={decimalFormat} value={pos.lngM} /> {"' "}
            </span>
        </>
    );
};

MousePositionLabelDM.propTypes = {
    position: PropTypes.shape({
        lng: PropTypes.number,
        lat: PropTypes.number
    })
};

export default MousePositionLabelDM;
