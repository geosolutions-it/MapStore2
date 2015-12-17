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
                <div className={"nav-content " + (this.state.visible ? "visible " : "") + this.props.alignment}>
                    <div className="navHeader" style={{width: "100%", minHeight: "35px"}}>
                        {this.props.title}
                        <Glyphicon glyph="remove" onClick={() => {this.hide(); }} style={{position: "absolute", right: "5px", padding: "10px", cursor: "pointer"}}/>
                    </div>
                    {this.props.children}
                </div>
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
