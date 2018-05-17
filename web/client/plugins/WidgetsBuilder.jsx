/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');

const Dock = require('react-dock').default;

const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const { compose } = require('recompose');

const {setControlProperty} = require('../actions/controls');

const {mapLayoutValuesSelector} = require('../selectors/maplayout');
const {widgetBuilderSelector} = require('../selectors/controls');
const { dependenciesSelector, availableDependenciesSelector} = require('../selectors/widgets');
const { toggleConnection } = require('../actions/widgets');
const withMapExitButton = require('./widgetbuilder/enhancers/withMapExitButton');
const Builder = compose(
    connect(
        createSelector(
            dependenciesSelector,
            availableDependenciesSelector,
            (dependencies, availableDependenciesProps) => ({ dependencies, ...availableDependenciesProps }))
    , { toggleConnection }),
    withMapExitButton
)(require('./widgetbuilder/WidgetTypeBuilder'));

class SideBarComponent extends React.Component {
     static propTypes = {
         id: PropTypes.string,
         enabled: PropTypes.bool,
         limitDockHeight: PropTypes.bool,
         fluid: PropTypes.bool,
         zIndex: PropTypes.number,
         dockSize: PropTypes.number,
         position: PropTypes.string,
         onMount: PropTypes.func,
         onUnmount: PropTypes.func,
         onClose: PropTypes.func,
         dimMode: PropTypes.string,
         src: PropTypes.string,
         style: PropTypes.object,
         layout: PropTypes.object
     };
     static defaultProps = {
         id: "widgets-builder-plugin",
         enabled: false,
         dockSize: 500,
         limitDockHeight: true,
         zIndex: 10000,
         fluid: false,
         dimMode: "none",
         position: "left",
         onMount: () => {},
         onUnmount: () => {},
         onClose: () => {},
         layout: {}
     };
    componentDidMount() {
        this.props.onMount();
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }
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
            dockStyle={{...this.props.layout, background: "white" /* TODO set it to undefined when you can inject a class inside Dock, to use theme */}}
        >
            <Builder enabled={this.props.enabled} onClose={this.props.onClose} typeFilter={({ type } = {}) => type !== 'map' && type !== 'legend' }/>
        </Dock>);

    }
}

const Plugin = connect(
    createSelector(
        widgetBuilderSelector,
        state => mapLayoutValuesSelector(state, {height: true}),
        (enabled, layout) => ({
            enabled,
            layout
    })), {
        onMount: () => setControlProperty("widgetBuilder", "available", true),
        onUnmount: () => setControlProperty("widgetBuilder", "available", false),
        onClose: setControlProperty.bind(null, "widgetBuilder", "enabled", false, false)
    }

)(SideBarComponent);
module.exports = {
    WidgetsBuilderPlugin: Plugin,
    epics: require('../epics/widgetsbuilder')
};
