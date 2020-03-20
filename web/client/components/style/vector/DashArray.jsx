/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const PropTypes = require('prop-types');
const React = require('react');
const Select = require('react-select').default;
const { join} = require('lodash');
require('react-widgets/lib/less/react-widgets.less');

/**
 * Component used to manage dashArray property for a stroke style
*/
class DashArray extends React.Component {
    static propTypes = {
        dashArray: PropTypes.array,
        menuPlacement: PropTypes.string,
        clearable: PropTypes.bool,
        value: PropTypes.string,
        optionRenderer: PropTypes.func,
        styleRendererPattern: PropTypes.node,
        valueRenderer: PropTypes.func,
        onChange: PropTypes.func,
        options: PropTypes.array
    };

    static defaultProps = {
        dashArray: ['1', '0'],
        menuPlacement: "top",
        clearable: false,
        onChange: () => {},
        // these should come from configuration
        options: [{value: "1 0"}, {value: "10 50 30"}, {value: "6 6"}, {value: "20 20"}, {value: "30 30"}]
    };

    render() {
        return (
            <Select
                options={this.props.options}
                menuPlacement={this.props.menuPlacement}
                clearable={this.props.clearable}
                optionRenderer={this.props.optionRenderer || this.styleRenderer}
                valueRenderer={this.props.valueRenderer || this.styleRenderer}
                value={join(this.props.dashArray || "1 0", ' ')}
                onChange={({value}) => {
                    const dashArray = value.split(' ');
                    this.props.onChange(dashArray);
                }}
            />);
    }

    /**
     * function used to render a pattern for the linedash
     * @prop {object} option to render
    */
    styleRenderer = (option) => {
        const pattern = this.props.styleRendererPattern ||
            (<svg style={{ height: 33, width: '100%' }} viewBox="0 0 300 25">
                <path
                    stroke={'#333333'}
                    strokeWidth={4}
                    strokeDasharray={option.value}
                    d="M0 12.5, 300 12.5" />
            </svg>);
        return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingRight: 25 }}>
                {pattern}
            </div>);
    }
}

module.exports = DashArray;
