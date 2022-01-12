/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import Popover from '../styleeditor/Popover';
function MarkerPropertyPicker({
    disabled,
    containerNode,
    onOpen,
    placement,
    children,
    triggerNode
}) {

    const disabledClassName = disabled ? ' ms-disabled' : '';

    return (
        <Popover
            containerNode={containerNode}
            placement={placement}
            disabled={disabled}
            onOpen={(isOpen) => onOpen(isOpen)}
            content={
                <div className="ms-picker-node shadow-soft">
                    {children}
                </div>
            }
        >
            <div
                className={`ms-property-picker${disabledClassName}`}>
                <div
                    className="ms-property-picker-swatch"
                    style={{ padding: 0, boxShadow: 'none' }}
                >
                    {triggerNode}
                </div>
            </div>
        </Popover>
    );
}

MarkerPropertyPicker.propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({r: PropTypes.number, g: PropTypes.number, b: PropTypes.number, a: PropTypes.number})
    ]),
    format: PropTypes.string,
    onChangeColor: PropTypes.func,
    text: PropTypes.string,
    line: PropTypes.bool,
    disabled: PropTypes.bool,
    pickerProps: PropTypes.object,
    containerNode: PropTypes.node,
    onOpen: PropTypes.function,
    placement: PropTypes.string
};

MarkerPropertyPicker.defaultProps = {
    disabled: false,
    line: false,
    onChangeColor: () => {},
    pickerProps: {},
    onOpen: () => {}
};

export default MarkerPropertyPicker;
