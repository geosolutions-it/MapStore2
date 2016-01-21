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
        activeKey: React.PropTypes.string
    },
    getInitialState() {
        return {
            visible: false,
            activeKey: this.props.activeKey
        };
    },

    onHeaderClick( eventKey ) {
        this.setState({visible: this.state.visible, activeKey: this.state.activeKey === eventKey ? null : eventKey });
    },
    renderChildren(child, index) {
        let props = {
          key: child.key ? child.key : index,
          onHeaderClick: this.onHeaderClick,
          ref: child.ref,
          open: this.state.activeKey && this.state.activeKey === child.props.eventKey
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
                <Glyphicon glyph="remove" onClick={() => {this.hide(); }} style={{position: "absolute", right: "0", padding: "15px", cursor: "pointer"}}/>
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
                         right: this.state.visible ? 0 : 'auto',
                         width: '0',
                         overflow: 'visible'
                     }
                }} sidebarClassName="nav-menu" onSetOpen={(open) => {
                    if (open) {
                        this.show();
                    } else {
                        this.hide();
                    } }} open={this.state.visible} sidebar={this.renderContent()}>
                <div></div>
            </Sidebar>
        );
    },

    show() {
        this.setState({ visible: true, activeKey: this.state.activeKey });
        // document.addEventListener("click", this.hide.bind(this));
    },

    hide() {
        // document.removeEventListener("click", this.hide.bind(this));
        this.setState({ visible: false, activeKey: this.state.activeKey });
    }
});

module.exports = Menu;
