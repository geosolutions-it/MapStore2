/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');


const Toolbar = require('../../../../../misc/toolbar/Toolbar');

module.exports = ({ canProceed, selected, stepButtons = [], onProceed = () => {}} = {}) => (<Toolbar btnDefaultProps={{
    className: "square-button-md",
    bsStyle: "primary",
    bsSize: "sm"
}}
buttons={[...stepButtons, {
    onClick: onProceed,
    disabled: !canProceed,
    tooltipId: "widgets.builder.wizard.useTheSelectedLayer",
    visible: selected,
    glyph: "arrow-right"
}]} />);
