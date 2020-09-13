
/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Button as ButtonRB } from 'react-bootstrap';


import tooltip from '../../misc/enhancers/tooltip';
const Button = tooltip(ButtonRB);

import { tileProviderToLayer } from '../../../utils/CatalogUtils';


export default ({ record, service, children, addLayer = () => { }, ...props }) => {
    return (<Button
        {...props}
        onClick={() => {
            addLayer(tileProviderToLayer(record, service));
        }}>
        {children}
    </Button>);
};
