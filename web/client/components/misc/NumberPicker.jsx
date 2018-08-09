/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

/**
 * This is a replacement of react-widgets Number Picker to avoid issues in
 *
 */
module.exports = ({ onChange = () => { }, disabled, value, props }) =>
    (<div className={`rw-numberpicker rw-widget ${disabled ? 'rw-state-disabled' : ''}`} style={{ borderColor: "rgb(222, 222, 222)" }}>
        <span className="rw-select">
            <button onMouseDown={() => {
                const v = parseFloat(value, 10);
                if (isNaN(v)) {
                    return onChange(1);
                }
                return onChange(v + 1);
            }} title="increment value" type="button" ariaLabel="increment value" className="rw-btn">
                <span ariaHidden="true" className="rw-i rw-i-caret-up"></span></button>
            <button onMouseDown={() => {
                const v = parseFloat(value, 10);
                if (isNaN(v)) {
                    return onChange(-1);
                }
                return onChange(v - 1);
            }} title="decrement value" type="button" ariaLabel="decrement value" className="rw-btn">
                <span ariaHidden="true" className="rw-i rw-i-caret-down"></span></button>
        </span>
        <input type="text" role="spinbutton" disabled={disabled} className="rw-input" {...props} value={value} onChange={e => onChange(parseFloat(e.target.value, 10))} />
    </div>);
