/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var {Glyphicon} = require('react-bootstrap');
var Section = React.createClass({
    propTypes: {
        key: React.PropTypes.string,
        eventKey: React.PropTypes.string,
        headerClassName: React.PropTypes.string,
        open: React.PropTypes.bool,
        onHeaderClick: React.PropTypes.func,
        header: React.PropTypes.node
    },
    getDefaultProps() {
        return {
            headerClassName: 'panel-heading'
        };
    },
    onHeaderClick() {
        this.props.onHeaderClick(this.props.eventKey);
    },
    getHeight() {
        if (this.props.open) {
            return this.refs.sectionContent.getDOMNode().scrollHeight + 10;
        }
        return "0";
    },
    render() {
        var style = {
            maxHeight: this.getHeight(),
            overflow: this.props.open ? "auto" : "hidden",
            padding: !this.props.open ? "0" : null
        };
        return (
            <div className={"section"}>
                <div className="sectionHeader" style={{width: "100%"}} onClick={this.onHeaderClick}>
                    <Glyphicon glyph="triangle-right" style={this.props.open ? {transform: "rotate(90deg)"} : {} } />
                    <span className={this.headerClassName} ref="sectionTitle" className="sectionTitle" >{this.props.header}</span>
                </div>
                <div ref="sectionContent" className="sectionContent" style={style} >{this.props.children}</div>
            </div>
        );
    }

});
module.exports = Section;
