const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {FormControl, FormGroup, ControlLabel} = require('react-bootstrap');

class Choice extends React.Component {
    static propTypes = {
        items: PropTypes.array,
        label: PropTypes.string,
        onChange: PropTypes.func,
        selected: PropTypes.string
    };

    static defaultProps = {
        items: [],
        label: 'Choice',
        onChange: () => {},
        selected: ''
    };

    onChange = (e) => {
        this.props.onChange(e.target.value);
    };

    render() {
        const options = this.props.items
            .map((item) => <option key={item.value} value={item.value}>{item.name}</option>);
        return (
            <FormGroup>
                {this.props.label ? <ControlLabel>{this.props.label}</ControlLabel> : null}
                <FormControl ref="input" value={this.props.selected} componentClass="select" onChange={this.onChange}>
                    {options}
                </FormControl>
            </FormGroup>
        );
    }
}

module.exports = Choice;
