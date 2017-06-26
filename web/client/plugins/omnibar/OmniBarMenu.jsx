const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {NavDropdown, Button, Glyphicon, MenuItem} = require('react-bootstrap');
const {connect} = require("react-redux");
const {partial} = require('lodash');
const Message = require('../locale/Message');

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

module.exports = connect()(OmniBarMenu);
