/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var Menu = React.createClass({
    propTypes: {
        alignment: React.PropTypes.string
    },
    getInitialState() {
        return {
            visible: false
        };
    },

    render() {
        return (
            <div className="nav-menu">
                <div className={"nav-halo"}
                        style={{
                        visibility: this.state.visible ? "visible" : "hidden",
                        opacity: this.state.visible ? 1 : 0}}
                        onClick={()=> {this.hide(); }}></div>
                <div className={"nav-content " + (this.state.visible ? "visible " : "") + this.props.alignment}>{this.props.children}</div>
            </div>
        );
    },

    show() {
        this.setState({ visible: true });
        // document.addEventListener("click", this.hide.bind(this));
    },

    hide() {
        // document.removeEventListener("click", this.hide.bind(this));
        this.setState({ visible: false });
    }
});

module.exports = Menu;
