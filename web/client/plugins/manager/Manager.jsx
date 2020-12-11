/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import { itemSelected } from '../../actions/manager';
import { Nav, NavItem, Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Message } from '../../components/I18N/I18N';
import './style/manager.css';

class Manager extends React.Component {
    static propTypes = {
        navStyle: PropTypes.object,
        items: PropTypes.array,
        itemSelected: PropTypes.func,
        selectedTool: PropTypes.string
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        items: [],
        mapType: "openlayers",
        selectedTool: "importer",
        itemSelected: () => {},
        navStyle: {
            flex: "inherit"
        }
    };

    renderToolIcon = (tool) => {
        if (tool.glyph) {
            return <Glyphicon glyph={tool.glyph} />;
        }
        return null;
    };

    renderNavItems = () => {
        return this.props.items.map((tool) =>
            (<NavItem
                eventKey={tool.id}
                key={tool.id}
                href="#"
                onClick={(event) => {
                    event.preventDefault();
                    this.props.itemSelected(tool.id);
                    this.context.router.history.push("/manager/" + tool.id);
                }}>
                {this.renderToolIcon(tool)}
                <span className="nav-msg">&nbsp;{tool.msgId ? <Message msgId={tool.msgId} /> : tool.title || tool.id}</span>
            </NavItem>));
    };

    renderPlugin = () => {
        for ( let i = 0; i < this.props.items.length; i++) {
            let tool = this.props.items[i];
            if (tool.id === this.props.selectedTool) {
                return <tool.plugin key={tool.id} {...tool.cfg} />;
            }
        }
        return null;

    };

    render() {
        return (<div className="Manager-Container">
            <Nav className="Manager-Tools-Nav" bsStyle="pills" stacked activeKey={this.props.selectedTool} style={this.props.navStyle}>
                {this.renderNavItems()}
            </Nav>
            <div style={{
                flex: 1
            }}>{this.renderPlugin()} </div>
        </div>);
    }
}

/**
 * Base container for Manager plugins like {@link #plugins.UserManager|UserManager} or
 * {@link #plugins.GroupManager|GroupManager}
 * usually rendered in {@link #pages.Manager|Manager Page}.
 * @name Manager
 * @class
 * @memberof plugins
 */
export default {
    ManagerPlugin: connect((state, ownProps) => ({
        selectedTool: ownProps.tool
    }),
    {
        itemSelected
    })(Manager)
};
