/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import {shortenLabel} from '../../utils/WidgetsUtils';

const YAxisLabel = ({x = 0, y = 0, payload = {}}) => (
    <g transform={`translate(0,${y - 1})`}>
        <text
        style={{fill: '#666'}}
        x={x - 5}
        y={y}
        textAnchor="end" >
            {shortenLabel(payload.value)}
        </text>
    </g>
);

export default YAxisLabel;
