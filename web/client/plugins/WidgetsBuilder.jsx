/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Dock = require('react-dock').default;
const {createSelector} = require('reselect');
const {connect} = require('react-redux');
const {widgetBulderSelector} = require('../selectors/controls');
const {setControlProperty} = require('../actions/controls');
const {insertWidget} = require('../actions/widgets');
const PropTypes = require('prop-types');
const WidgetsBuilder = connect(
    () => {}, {
        insertWidget
    }
)(require('../components/widgets/builder/WidgetsBuilder'));


const BuilderHeader = connect(() => {}, {
    onClose: setControlProperty("widgetBulder", "enabled", false, false)
})(require('../components/widgets/builder/BuilderHeader'));

class SideBarComponent extends React.Component {
     static propTypes = {
         id: PropTypes.string,
         enabled: PropTypes.isVisible,
         limitDockHeight: PropTypes.bool,
         fluid: PropTypes.bool,
         zIndex: PropTypes.number,
         dockSize: PropTypes.number,
         position: PropTypes.string,
         dimMode: PropTypes.dimMode,
         src: PropTypes.string,
         style: PropTypes.object
     };
     static defaultProps = {
         id: "widgets-plugin",
         enabled: false,
         dockSize: 500,
         limitDockHeight: true,
         zIndex: 10000,
         fluid: false,
         dimMode: "none",
         position: "left"
     };
    render() {
        return (<Dock
            id={this.props.id}
            zIndex={this.props.zIndex}
            position={this.props.position}
            size={this.props.dockSize}
            dimMode={this.props.dimMode}
            isVisible={this.props.enabled}
            onSizeChange={this.limitDockHeight}
            fluid={this.props.fluid}
            dimStyle={{ background: 'rgba(0, 0, 100, 0.2)' }}
        >
            <BuilderHeader />
            <WidgetsBuilder />
        </Dock>);

    }
}

const Plugin = connect(
    createSelector(
        widgetBulderSelector,
        (enabled) => ({
            enabled
    }))
)(SideBarComponent);
module.exports = {
    WidgetsBuilderPlugin: Plugin
};
