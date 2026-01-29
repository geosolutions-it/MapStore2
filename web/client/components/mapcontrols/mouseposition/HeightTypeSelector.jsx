/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import PropTypes from "prop-types";
import React from "react";
import { ControlLabel, FormControl, FormGroup } from "react-bootstrap";
import FlexBox from "../../layout/FlexBox";
import { getMessageById } from "../../../utils/LocaleUtils";

/**
 * HeightTypeSelector allows to select a height type from a combobox.
 * @memberof components.mousePosition
 * @class
 * @prop {string} id the id of the component
 * @prop {string|object|function} label the label shown next to the combobox (if editHeight is true)
 * @prop {string[]} filterAllowedHeight list of allowed height type in the combobox list. Accepted values are "Ellipsoidal" and "MSL"
 * @prop {string} heightType the current selected height type
 * @prop {boolean} enabled if true shows the component
 * @prop {function} onHeightTypeChange callback when a new height type is selected
 */

const HeightTypeSelector = (props, context) => {
    const {
        id,
        label,
        availableHeightTypes,
        heightType,
        enabled,
        onHeightTypeChange
    } = props;

    if (!enabled) {
        return null;
    }

    const options = availableHeightTypes.map(({ value, labelId }) => (
        <option value={value} key={value}>
            {getMessageById(context.messages, labelId)}
        </option>
    ));

    return (
        <FlexBox component={FormGroup} centerChildrenVertically gap="sm">
            <ControlLabel style={{ margin: 0, fontWeight: 'normal', minWidth: 'max-content' }}>
                {label}
            </ControlLabel>
            <FormControl
                componentClass="select"
                id={id}
                value={heightType}
                onChange={(e) => onHeightTypeChange(e.target.value)}
                bsSize="small"
                style={{ borderRadius: 4 }}
            >
                {options}
            </FormControl>
        </FlexBox>
    );
};

HeightTypeSelector.propTypes = {
    id: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.func, PropTypes.string, PropTypes.object]),
    filterAllowedHeight: PropTypes.array,
    heightType: PropTypes.string,
    enabled: PropTypes.bool,
    onHeightTypeChange: PropTypes.func
};

HeightTypeSelector.contextTypes = {
    messages: PropTypes.object
};

HeightTypeSelector.defaultProps = {
    id: "mapstore-heightselector",
    heightType: null,
    onHeightTypeChange: function() {},
    enabled: false
};

export default HeightTypeSelector;
