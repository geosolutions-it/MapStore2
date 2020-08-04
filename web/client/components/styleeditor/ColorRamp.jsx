/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import ColorUtils from '../../utils/ColorUtils';
import Select from 'react-select';
import find from 'lodash/find';
import Message from '../I18N/Message';

const ColorRampItem = ({ ramp, name, label }) => {
    const tick = 1 / ramp.length;
    const linearGradient = (ramp || [])
        .reduce((acc, color, idx) =>
            `${acc}, ${color} ${idx / ramp.length * 100}%, ${color} ${(idx / ramp.length + tick) * 100}%`,
        'linear-gradient(to right');
    return (<div
        style={{
            backgroundImage: `${linearGradient})`,
            width: '100%',
            display: 'inline-block',
            verticalAlign: 'middle',
            padding: '0 2px'
        }}>
        <span style={{
            color: '#000000',
            backgroundColor: 'rgba(255, 255, 255, 0.75)',
            padding: '0 4px'
        }}>
            <Message msgId={label || name} msgParams={{ number: ramp.length }} />
        </span>
    </div>);
};

function ColorRamp({
    value,
    samples,
    onChange,
    items: propItems,
    rampFunction,
    disabled
}) {

    const items = propItems.map(({options = {}, ...item}) => ({
        ...item,
        options,
        ramp: rampFunction
            ? rampFunction(item, options)
            // TODO: replace with tynicolor
            : (ColorUtils.sameToneRangeColors(options.base, options.range, samples + 1, options.options) || ["#AAA"]).splice(1)
    }));

    const selectedValue = find(items, (item = {}) => item === value || item.name === (value && value.name));

    return (
        <Select
            valueKey="name"
            className="color-ramp-selector"
            clearable={false}
            value={selectedValue}
            options={items}
            disabled={disabled}
            valueRenderer={ColorRampItem}
            optionRenderer={ColorRampItem}
            onChange={(ramp) => {
                if (ramp) {
                    onChange(ramp);
                }
            }}
        />
    );
}

ColorRamp.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    samples: PropTypes.number,
    onChange: PropTypes.func,
    items: PropTypes.array,
    rampFunction: PropTypes.func,
    disabled: PropTypes.bool
};

ColorRamp.defaultProps = {
    samples: 5,
    onChange: () => {},
    items: [{
        name: 'global.colors.blue',
        schema: 'sequencial',
        options: {base: 190, range: 20}
    }, {
        name: 'global.colors.red',
        schema: 'sequencial',
        options: {base: 10, range: 4}
    }, {
        name: 'global.colors.green',
        schema: 'sequencial',
        options: {base: 120, range: 4}
    }, {
        name: 'global.colors.brown',
        schema: 'sequencial',
        options: {base: 30, range: 4, s: 1, v: 0.5}
    }, {
        name: 'global.colors.purple',
        schema: 'sequencial',
        options: {base: 300, range: 4}
    }, {
        name: 'global.colors.random',
        schema: 'qualitative',
        options: {base: 190, range: 340, options: {base: 10, range: 360, s: 0.67, v: 0.67}}
    }],
    disabled: false
};

export default ColorRamp;
