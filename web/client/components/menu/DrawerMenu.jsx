/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var {Glyphicon} = require('react-bootstrap');
var Menu = React.createClass({
    propTypes: {
        title: React.PropTypes.string,
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
    render() {
        return (
            <div className="nav-menu">
                <div className={"nav-halo"}
                        style={{
                        visibility: this.state.visible ? "visible" : "hidden",
                        opacity: this.state.visible ? 1 : 0}}
                        onClick={()=> {this.hide(); }}></div>
                <div className={"nav-content " + (this.state.visible ? "visible " : "") + this.props.alignment}>
                    <div className="navHeader" style={{width: "100%", minHeight: "35px"}}>
                        <span className="title">{this.props.title}</span>
                        <Glyphicon glyph="remove" onClick={() => {this.hide(); }} style={{position: "absolute", right: "0", padding: "15px", cursor: "pointer"}}/>
                    </div>
                    {this.props.children.map(this.renderChildren)}
                </div>
            </div>
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
