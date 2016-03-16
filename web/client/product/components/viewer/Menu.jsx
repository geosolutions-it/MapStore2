/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var {Glyphicon} = require('react-bootstrap');
var Sidebar = require('react-sidebar').default;
var Menu = React.createClass({
    propTypes: {
        title: React.PropTypes.node,
        alignment: React.PropTypes.string,
        activeKey: React.PropTypes.string,
        show: React.PropTypes.bool,
        onToggle: React.PropTypes.func,
        onChoose: React.PropTypes.func
    },
    renderChildren(child, index) {
        let props = {
          key: child.key ? child.key : index,
          onHeaderClick: this.props.onChoose,
          ref: child.ref,
          open: this.props.activeKey && this.props.activeKey === child.props.eventKey
        };
        return React.cloneElement(
          child,
          props
        );
    },
    renderContent() {
        return (<div className={"nav-content"}>
            <div className="navHeader" style={{width: "100%", minHeight: "35px"}}>
                <span className="title">{this.props.title}</span>
                <Glyphicon glyph="remove" onClick={this.props.onToggle} style={{position: "absolute", right: "0", padding: "15px", cursor: "pointer"}}/>
            </div>
            {this.props.children.map(this.renderChildren)}
        </div>);
    },
    render() {
        return (
            <Sidebar styles={{
                    sidebar: {
                        zIndex: 1022,
                        width: '300px'
                    },
                    overlay: {
                        zIndex: 1021
                    },
                     root: {
                         right: this.props.show ? 0 : 'auto',
                         width: '0',
                         overflow: 'visible'
                     }
                }} sidebarClassName="nav-menu" onSetOpen={() => {
                    this.props.onToggle();
                }} open={this.props.show} sidebar={this.renderContent()}>
                <div></div>
            </Sidebar>
        );
    }
});

module.exports = Menu;
