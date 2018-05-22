/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const emptyState = require('../../misc/enhancers/emptyState');
const Message = require('../../I18N/Message');

module.exports = (asTooltip = true) => emptyState(
    ({ layers = [] }) => layers.length === 0,
    {
        [asTooltip ? "tooltip" : "title"]: <Message msgId="widgets.errors.noLegend" />,
        description: !asTooltip && <Message msgId="widgets.errors.noLegendDescription" />
    }
);
