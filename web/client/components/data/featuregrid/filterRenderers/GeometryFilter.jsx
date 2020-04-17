/**
  * Copyright 2020, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';

export default ({
    value,
    filterEnabled = false,
    column = {},
    onChange = () => {}
}) => {
    return (
        <div className={`featuregrid-geometry-filter${filterEnabled ? ' filter-enabled' : ''}`} onClick={() => {
            onChange({
                enabled: !!value ? filterEnabled : !filterEnabled,
                type: 'geometry',
                attribute: column.geometryPropName
            });
        }}>
            <Glyphicon glyph={!!value ? "remove-sign" : "map-marker"}/>
        </div>
    );
};
