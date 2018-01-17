/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');


const Toolbar = require('../../../../../misc/toolbar/Toolbar');

module.exports = ({canProceed, selected, onProceed = () => {}} = {}) => (<Toolbar btnDefaultProps={{
        bsStyle: "primary",
        bsSize: "sm"
    }}
    buttons={[{
        onClick: onProceed,
        disabled: !canProceed,
        tooltipId: canProceed ? "widgetNotAvaliable" : "use the selected layer",
        visible: selected,
        glyph: "arrow-right"
    }]} />);
