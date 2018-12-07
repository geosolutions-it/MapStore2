/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const PropTypes = require('prop-types');
const { Glyphicon, ListGroupItem, ListGroup, FormControl, Dropdown, Button: ButtonRB } = require('react-bootstrap');
const tooltip = require('../../misc/enhancers/tooltip');
const Button = tooltip(ButtonRB);
const CoordinatesUtils = require('../../../utils/CoordinatesUtils');


class CustomMenu extends React.Component {
    static propTypes = {
        selected: PropTypes.string,
        value: PropTypes.string,
        label: PropTypes.oneOfType([PropTypes.func, PropTypes.string, PropTypes.object]),
        availableCRS: PropTypes.object,
        filterAllowedCRS: PropTypes.array,
        projectionDefs: PropTypes.array,
        additionalCRS: PropTypes.object,
        crs: PropTypes.string,
        enabled: PropTypes.bool,
        onCRSChange: PropTypes.func,
        useRawInput: PropTypes.bool
    };
    static defaultProps = {
        value: '',
        availableCRS: CoordinatesUtils.getAvailableCRS(),
        crs: null,
        onCRSChange: function() {}
    };

    render() {
        const { children } = this.props;

        return (
            <div className="dropdown-menu" style={{
                left: 'auto',
                right: 0
            }}>
                <ListGroupItem
                    className="ms-prj-header"
                    bsSize="sm">
                    <div>Selected:</div>
                    <div>{this.props.selected}</div>
                </ListGroupItem>
                <ListGroup style={{ maxHeight: 150, overflowY: 'auto', marginBottom: 0}}>
                    {React.Children.toArray(children).filter(
                        child => !this.props.value.trim() || child.props.children.indexOf(this.props.value) !== -1
                    )}
                </ListGroup>
                <FormControl
                    ref={c => {
                        this.input = c;
                    }}
                    type="text"
                    placeholder="Filter projection"
                    onChange={this.handleChange}
                    value={this.props.value}
                />
            </div>
        );
    }

    // handleChange = (e) => {
    //     this.setState({ value: e.target.value });
    // }

    focusNext = () => {
        const input = ReactDOM.findDOMNode(this.input);

        if (input) {
            input.focus();
        }
    }
}

module.exports = CustomMenu;
