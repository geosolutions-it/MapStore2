/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = require('react');
var {Glyphicon, Button} = require('react-bootstrap');
var Sidebar = require('react-sidebar').default;

var Menu = React.createClass({
    propTypes: {
        title: React.PropTypes.node,
        alignment: React.PropTypes.string,
        activeKey: React.PropTypes.string,
        docked: React.PropTypes.bool,
        show: React.PropTypes.bool,
        onToggle: React.PropTypes.func,
        onChoose: React.PropTypes.func,
        single: React.PropTypes.bool,
        width: React.PropTypes.number,
        overlapMap: React.PropTypes.bool,
        changeMapStyle: React.PropTypes.func
    },
    getDefaultProps() {
        return {
            docked: false,
            single: false,
            width: 300,
            overlapMap: true
        };
    },
    componentDidMount() {
        if (!this.overlapMap && this.props.show) {
            let style = {left: this.props.width, width: `calc(100% - ${this.props.width}px)`};
            this.props.changeMapStyle(style, "drawerMenu");
        }
    },
    componentDidUpdate(prevProps) {
        if (!this.props.overlapMap && prevProps.show !== this.props.show) {
            let style = this.props.show ? {left: this.props.width, width: `calc(100% - ${this.props.width}px)`} : {};
            this.props.changeMapStyle(style, "drawerMenu");
        }
    },
    renderChildren(child, index) {
        let props = {
          key: child.key ? child.key : index,
          onHeaderClick: this.props.onChoose,
          ref: child.ref,
          open: this.props.activeKey && this.props.activeKey === child.props.eventKey,
          icon: ""
        };
        return React.cloneElement(
          child,
          props
        );
    },
    renderButtons() {
        return this.props.children.map((child) => (
            <Button key={child.props.eventKey} bsSize="large" className={(child.props.buttonConfig && child.props.buttonConfig.buttonClassName) ? child.props.buttonConfig.buttonClassName : "square-button"} onClick={this.props.onChoose.bind(null, child.props.eventKey)} bsStyle={this.props.activeKey === child.props.eventKey ? 'default' : 'primary'}>
                {child.props.glyph ? <Glyphicon glyph={child.props.glyph} /> : child.props.icon}
            </Button>
        ));
    },
    renderContent() {
        const header = this.props.single ? (
            <div className="navHeader" style={{width: "100%", minHeight: "35px"}}>
                <Glyphicon glyph="1-close" className="no-border btn-default" onClick={this.props.onToggle} style={{position: "absolute", left: "0", padding: "15px", paddingTop: "10px", cursor: "pointer"}}/>
                <div className="navButtons">
                    {this.renderButtons()}
                </div>
            </div>
        ) : (<div className="navHeader" style={{width: "100%", minHeight: "35px"}}>
            <span className="title">{this.props.title}</span>
            <Glyphicon glyph="1-close" className="no-border btn-default" onClick={this.props.onToggle} style={{position: "absolute", right: "0", padding: "15px", cursor: "pointer"}}/>
        </div>);
        return (<div className={"nav-content"}>
            {header}
            <div className={"nav-body"}>
            {this.props.children.filter((child) => !this.props.single || this.props.activeKey === child.props.eventKey).map(this.renderChildren)}
            </div>
        </div>);
    },
    render() {
        return (
            <Sidebar styles={{
                    sidebar: {
                        zIndex: 1022,
                        width: this.props.width
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
                }} open={this.props.show} docked={this.props.docked} sidebar={this.renderContent()}>
                <div></div>
            </Sidebar>
        );
    }
});

module.exports = Menu;
