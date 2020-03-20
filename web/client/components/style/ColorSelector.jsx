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
/**
 * color selector is a color picker that provide a different UI style
 * @prop {string} color color value can be expressed as object ({ r: 0, g: 0, b: 0, a: 1 }) or css color string ('#ff0000', 'rgba(255, 0, 0), ...')
 * @prop {string} format format the returned color of onChangeColor function, one of 'rgb', 'prgb', 'hex6', 'hex3', 'hex8', 'name', 'hsl' or 'hsv'
 * @prop {function} line show swatch for line style
 * @prop {function} onChangeColor return changed color
 * @prop {bool} disableAlpha disable alpha channel of picker
 * @prop {node} containerNode container node target for picker overlay
 * @prop {function} onOpen detect when color picker is open
 * @prop {array} presetColors preset colors to display under the color picker
 * @prop {string} placement preferred placement of picker, one of 'top', 'right', 'bottom' or 'left'
 */
function ColorSelector({
    color,
    format,
    line,
    onChangeColor,
    disableAlpha,
    containerNode,
    onOpen,
    presetColors,
    placement
}) {

    return (
        <div
            className="ms-color-selector">
            <ColorPicker
                text={<Glyphicon glyph="dropper" />}
                format={format}
                line={line}
                value={color}
                onChangeColor={onChangeColor}
                pickerProps={{
                    disableAlpha,
                    presetColors
                }}
                containerNode={containerNode}
                onOpen={onOpen}
                placement={placement}
            />
        </div>
    );
}

ColorSelector.propTypes = {
    color: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({r: PropTypes.number, g: PropTypes.number, b: PropTypes.number, a: PropTypes.number})
    ]),
    format: PropTypes.string,
    line: PropTypes.bool,
    onChangeColor: PropTypes.func,
    disableAlpha: PropTypes.bool,
    containerNode: PropTypes.node,
    onOpen: PropTypes.func,
    presetColors: PropTypes.array,
    placement: PropTypes.string
};

ColorSelector.defaultProps = {
    line: false,
    onChangeColor: () => {},
    onOpen: () => {}
};

export default ColorSelector;
