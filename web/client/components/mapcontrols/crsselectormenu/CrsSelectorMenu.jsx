/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const { ListGroupItem, ListGroup, FormControl } = require('react-bootstrap');

class CrsSelectorMenu extends React.Component {
    static propTypes = {
        selected: PropTypes.string,
        value: PropTypes.string,
        changeInputValue: PropTypes.func
    };

    static defaultProps = {
        value: '',
        changeInputValue: () => {}
    }

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
                    {children.filter(
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

    handleChange = (e) => {
        this.props.changeInputValue(e.target.value);
    }

}

module.exports = CrsSelectorMenu;
