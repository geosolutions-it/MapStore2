/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Dropdown, FormControl, Glyphicon } from 'react-bootstrap';

class Menu extends React.Component {
    static propTypes = {
        placeholder: PropTypes.string,
        value: PropTypes.string,
        onChange: PropTypes.func
    }

    render() {
        const { placeholder, value, onChange } = this.props;
        return (
            <div>
                <FormControl
                    ref={this.input}
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>
        );
    }

    input = React.createRef();

    focusNext() {
        const input = ReactDOM.findDOMNode(this.input);
        if (input) input.focus();
    }
}

export const ToolbarDropdownWithInputButton = ({
    value,
    onChange,
    glyph = '',
    pullRight = false,
    placeholder,
    className = 'no-border square-button-md'
}) => (
    <Dropdown>
        <Dropdown.Toggle
            pullRight={pullRight}
            className={className}
            noCaret
        >
            <Glyphicon glyph={glyph}/>
        </Dropdown.Toggle>
        <Dropdown.Menu>
            <Menu
                bsRole="menu"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </Dropdown.Menu>
    </Dropdown>
);
