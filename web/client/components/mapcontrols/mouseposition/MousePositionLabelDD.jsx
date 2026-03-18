/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from 'prop-types';
import React from 'react';

import NumberFormat from '../../I18N/Number';

const MousePositionLabelDD = ({ position }) => {
    const integerFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 6, minimumFractionDigits: 6};
    const lngDFormat = {style: "decimal", minimumIntegerDigits: 3, maximumFractionDigits: 6, minimumFractionDigits: 6};

    return (
        <>
            <span>
                {"Lat: "}
                <NumberFormat key="lat" numberParams={integerFormat} value={position.lat} />
            </span>
            <span>
                {"Lng: "}
                <NumberFormat key="lng" numberParams={lngDFormat} value={position.lng} />
            </span>
        </>
    );
};

MousePositionLabelDD.propTypes = {
    position: PropTypes.shape({
        lng: PropTypes.number,
        lat: PropTypes.number
    })
};

export default MousePositionLabelDD;
