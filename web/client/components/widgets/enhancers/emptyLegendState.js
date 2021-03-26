/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import emptyState from '../../misc/enhancers/emptyState';
import Message from '../../I18N/Message';

export default (asTooltip = true) => emptyState(
    ({ layers = [] }) => layers.length === 0,
    {
        [asTooltip ? "tooltip" : "title"]: <Message msgId="widgets.errors.noLegend" />,
        description: !asTooltip && <Message msgId="widgets.errors.noLegendDescription" />
    }
);
