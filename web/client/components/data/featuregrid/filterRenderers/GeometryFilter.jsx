/**
  * Copyright 2020, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React from 'react';
import { Glyphicon, Tooltip } from 'react-bootstrap';

import OverlayTrigger from '../../../misc/OverlayTrigger';
import Message from '../../../I18N/Message';

export default ({
    value,
    filterEnabled = false,
    column = {},
    tooltipPlace = 'top',
    tooltipDisabled = 'featuregrid.filter.tooltips.geometry.disabled',
    tooltipEnabled = 'featuregrid.filter.tooltips.geometry.enabled',
    tooltipApplied = 'featuregrid.filter.tooltips.geometry.applied',
    onChange = () => {}
}) => {
    const tooltip = filterEnabled && !!value ? tooltipApplied :
        filterEnabled && !value ? tooltipEnabled :
            tooltipDisabled;

    return (
        <OverlayTrigger placement={tooltipPlace} overlay={<Tooltip id="gofull-tooltip"><Message msgId={tooltip}/></Tooltip>}>
            <div className={`featuregrid-geometry-filter${filterEnabled ? ' filter-enabled' : ''}`} onClick={() => {
                onChange({
                    enabled: !!value ? filterEnabled : !filterEnabled,
                    type: 'geometry',
                    attribute: column.geometryPropName
                });
            }}>
                <Glyphicon glyph={!!value ? "remove-sign" : "map-marker"}/>
            </div>
        </OverlayTrigger>
    );
};
