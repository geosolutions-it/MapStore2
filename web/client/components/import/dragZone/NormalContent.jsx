/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { Glyphicon } from 'react-bootstrap';
import DropText from './DropText';


export default (props) => (<div>
    <div>
        <Glyphicon
            glyph="upload"
            style={{
                fontSize: 80
            }} />
    </div>
    <DropText {...props} />
</div>);
