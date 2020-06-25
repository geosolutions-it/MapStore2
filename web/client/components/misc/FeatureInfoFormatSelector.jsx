/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import MapInfoUtils from '../../utils/MapInfoUtils';
import Select from "react-select";
import { FormGroup, ControlLabel } from 'react-bootstrap';
import ControlledPopover from '../widgets/widget/ControlledPopover';
import HTML from '../I18N/HTML';

function FeatureInfoFormatSelector({
    id,
    label,
    infoFormat,
    availableInfoFormat,
    popoverMessage,
    disabled,
    onInfoFormatChange,
    selectProps
}) {
    const filtered = Object.keys(availableInfoFormat).reduce((acc, key) => {
        const values = Object.keys(acc).map(item => acc[item]);
        const exist = values.some(item => item === availableInfoFormat[key]);
        if (!exist) {
            return {
                ...acc,
                [key]: availableInfoFormat[key]
            };
        }
        return acc;
    }, {});
    const options = Object.keys(filtered).map((format) => ({
        value: filtered[format],
        label: format
    }));

    const select = (
        <>
        &nbsp;  {popoverMessage && <ControlledPopover text={<HTML msgId={popoverMessage} />} /> }
        <Select
            { ...selectProps }
            id={id}
            value={infoFormat}
            clearable={false}
            disabled={disabled}
            options={options}
            onChange={(selected) => onInfoFormatChange(selected?.value)}
        /></>
    );

    return label
        ? (
            <FormGroup bsSize="small">
                <ControlLabel>{label}</ControlLabel>
                {select}
            </FormGroup>
        )
        : select;
}

FeatureInfoFormatSelector.propTypes = {
    id: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.func, PropTypes.string, PropTypes.object]),
    availableInfoFormat: PropTypes.object,
    infoFormat: PropTypes.string,
    popoverMessage: PropTypes.string,
    onInfoFormatChange: PropTypes.func,
    disabled: PropTypes.bool,
    selectProps: PropTypes.object
};

FeatureInfoFormatSelector.defaultProps = {
    id: "mapstore-feature-format-selector",
    availableInfoFormat: MapInfoUtils.getAvailableInfoFormat(),
    infoFormat: MapInfoUtils.getDefaultInfoFormatValue(),
    popoverMessage: "",
    onInfoFormatChange: function() {},
    selectProps: {}
};

export default FeatureInfoFormatSelector;
