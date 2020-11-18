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
import {Label} from 'react-bootstrap';

import { roundCoord } from '../../../utils/CoordinatesUtils';
import NumberFormat from '../../I18N/Number';

class MousePositionLabelDM extends React.Component {
    static propTypes = {
        position: PropTypes.shape({
            lng: PropTypes.number,
            lat: PropTypes.number
        })
    };

    getPositionValues = (mPos) => {
        let {lng, lat} = mPos ? mPos : [null, null];
        let [latM, lngM] = [lat % 1 * 60, lng % 1 * 60];
        return {
            lat,
            latM: Math.abs(latM),
            lng,
            lngM: Math.abs(lngM)
        };
    };

    render() {
        let pos = this.getPositionValues(this.props.position);
        let integerFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 0};
        let decimalFormat = {style: "decimal", minimumIntegerDigits: 2, maximumFractionDigits: 3, minimumFractionDigits: 3};
        let lngDFormat = {style: "decimal", minimumIntegerDigits: 3, maximumFractionDigits: 0};
        return (
            <h5>
                <Label bsSize="lg" bsStyle="info">
                    <span>Lat: </span><NumberFormat key="latD" numberParams={integerFormat} value={isNil(pos.lat) ? pos.lat : roundCoord({roundingBehaviour: "floor", value: pos.lat, maximumFractionDigits: integerFormat.maximumFractionDigits})} />
                    <span>° </span><NumberFormat key="latM" numberParams={decimalFormat} value={pos.latM} />
                    <span>&apos; </span>
                    <span>Lng: </span><NumberFormat key="lngD" numberParams={lngDFormat} value={isNil(pos.lng) ? pos.lng : roundCoord({roundingBehaviour: "floor", value: pos.lng, maximumFractionDigits: lngDFormat.maximumFractionDigits})} />
                    <span>° </span><NumberFormat key="lngM" numberParams={decimalFormat} value={pos.lngM} />
                    <span>&apos; </span>
                </Label>
            </h5>);
    }
}

export default MousePositionLabelDM;
