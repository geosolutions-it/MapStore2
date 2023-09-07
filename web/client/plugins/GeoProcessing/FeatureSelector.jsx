/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
    InputGroup,
    Glyphicon
} from 'react-bootstrap';

import tooltip from '../../components/misc/enhancers/tooltip';
const Addon = tooltip(InputGroup.Addon);

const FeatureSelector = ({
    id,
    disabled,
    selected,
    onActivateClick
}) => {
    return (<Addon
        disabled={disabled}
        onClick={onClick}
        tooltipId={"GeoProcessing.tooltip.clickToSelectFeature"}
        tooltipPosition="left"
        className="btn"
        bsStyle={selected ? "success" : "primary"}
    >
        <Glyphicon
            glyph={"map-marker"}
            className={selected ? "" : "text-info"}
        />
    </Addon>);
};

FeatureSelector.propTypes = {
    disabled: PropTypes.bool,
    selected: PropTypes.bool,
    onClick: PropTypes.func
};

export default FeatureSelector;
