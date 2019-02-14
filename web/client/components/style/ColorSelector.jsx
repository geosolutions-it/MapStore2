/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const PropTypes = require('prop-types');
const ColorPicker = require('./ColorPicker');
const {Glyphicon} = require('react-bootstrap');

class ColorSelector extends React.Component {

    static propTypes = {
        color: PropTypes.shape({r: PropTypes.number, g: PropTypes.number, b: PropTypes.number, a: PropTypes.number}),
        checked: PropTypes.bool,
        line: PropTypes.bool,
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        onChangeColor: PropTypes.func
    };

    static defaultProps = {
        line: false,
        color: {r: 147, g: 96, b: 237, a: 100},
        checked: false
    };

    render() {
        return (<div className="ms-color-selector">
            <ColorPicker
                text=""
                line={this.props.line}
                value={this.props.color}
                style={{width: this.props.width}}
                onChangeColor={(color) => {
                    this.props.onChangeColor(color);
                }}/>
            <Glyphicon glyph="1-stilo" />
        </div>);
    }
}

module.exports = ColorSelector;
