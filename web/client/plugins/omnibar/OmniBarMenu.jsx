
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import { NavDropdown, Glyphicon, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import { partial } from 'lodash';
import Message from '../locale/Message';
import Button from '../../components/misc/Button';

class OmniBarMenu extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func,
        items: PropTypes.array,
        title: PropTypes.node,
        onItemClick: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object,
        router: PropTypes.object
    };

    static defaultProps = {
        items: [],
        onItemClick: () => {},
        title: <MenuItem header><Message msgId="options"/></MenuItem>
    };

    renderNavItem = (tool) => {
        return (<MenuItem onSelect={(e) => {
            e.preventDefault();
            if (tool.action) {
                this.props.dispatch(partial(tool.action, this.context));
            } else {
                this.props.onItemClick(tool);
            }
        }}>{tool.icon} {tool.text}</MenuItem>);
    };

    render() {
        return (<NavDropdown noCaret pullRight bsStyle="primary" title={<Button bsStyle="primary" className="square-button"><Glyphicon glyph="menu-hamburger" /></Button>} >
            {this.props.title}
            {this.props.items.sort((a, b) => a.position - b.position).map(this.renderNavItem)}
        </NavDropdown>)
        ;
    }
}

export default connect()(OmniBarMenu);
