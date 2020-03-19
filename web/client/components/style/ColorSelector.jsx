/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

import ColorPicker from './ColorPicker';

function ColorSelector({
    color,
    format,
    line,
    width,
    onChangeColor,
    disableAlpha,
    containerNode,
    onOpen,
    popover,
    presetColors
}) {

    return (
        <div
            className="ms-color-selector">
            <ColorPicker
                text={<Glyphicon glyph="dropper" />}
                format={format}
                line={line}
                value={color}
                style={{ width }}
                onChangeColor={onChangeColor}
                pickerProps={{
                    disableAlpha,
                    presetColors
                }}
                containerNode={containerNode}
                popover={popover}
                onOpen={onOpen}
            />
        </div>
    );
}

ColorSelector.propTypes = {
    color: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({r: PropTypes.number, g: PropTypes.number, b: PropTypes.number, a: PropTypes.number})
    ]),
    line: PropTypes.bool,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChangeColor: PropTypes.func,
    onOpen: PropTypes.func
};

ColorSelector.defaultProps = {
    line: false,
    onChangeColor: () => {},
    onOpen: () => {}
};

export default ColorSelector;
