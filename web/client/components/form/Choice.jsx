/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Input} = require('react-bootstrap');

const Choice = React.createClass({
    propTypes: {
        items: React.PropTypes.array,
        label: React.PropTypes.string,
        onChange: React.PropTypes.func,
        selected: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            items: [],
            label: 'Choice',
            onChange: () => {},
            selected: ''
        };
    },
    onChange() {
        this.props.onChange(this.refs.input.getValue());
    },
    getValue() {
        return this.refs.input.getValue();
    },
    render() {
        const options = this.props.items
            .map((item) => <option key={item.value} value={item.value}>{item.name}</option>);
        return (
            <Input ref="input" value={this.props.selected} type="select" label={this.props.label} onChange={this.onChange}>
                {options}
            </Input>
        );
    }
});

module.exports = Choice;
