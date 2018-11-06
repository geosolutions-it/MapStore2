/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { SketchPicker } = require('react-color');
const tinycolor = require('tinycolor2');

/**
 * Inline widget structure for Style Editor (Editor)
 * @prop {string} type identifier
 * @prop {function} active if return the inline widget it applied, arg. token from codemirror
 * @prop {function|object} style style of widget, base a square positioned before token string, function arg. token
 * @prop {function} Widget the component selector (triggered by clicking on widget button), props {token = {}, value = '', onChange = () => {}}
 */

module.exports = [
    {
        type: 'color',
        active: token => token.type === 'atom' && tinycolor(token.string).isValid(),
        style: token => ({backgroundColor: token.string}),
        Widget: ({token, value, onChange = () => {}}) => (
            <SketchPicker
                color={{ hex: value || token.string }}
                onChange={color => onChange(color.hex)}/>
        )
    }
];
