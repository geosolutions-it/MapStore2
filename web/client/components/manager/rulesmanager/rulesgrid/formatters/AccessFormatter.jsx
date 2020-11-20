/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';

const accessField = {
    ALLOW: {
        className: 'ms-allow-cell'
    },
    DENY: {
        className: 'ms-deny-cell'
    }
};

export default ({value = 'DENY', msClasses = accessField}) => (
    <div className={(msClasses[value] || {}).className || ''}>
        <div>
            {value.toUpperCase()}
        </div>
    </div>
);
