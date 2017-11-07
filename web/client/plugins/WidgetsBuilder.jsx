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
const {getEditingWidget, getEditorSettings} = require('../selectors/widgets');
const {getSelectedLayer} = require('../selectors/layers');
const {setControlProperty} = require('../actions/controls');
const {insertWidget, onEditorChange, setPage} = require('../actions/widgets');
const PropTypes = require('prop-types');
const builderConfiguration = require('../components/widgets/enhancers/builderConfiguration');
const BorderLayout = require('../components/layout/BorderLayout');

const wizardSelector = createSelector(
    getSelectedLayer,
    getEditingWidget,
    getEditorSettings,
    (layer, editorData, settings) => ({
        layer: editorData.layer || layer,
        editorData,
        settings
    })
);
const WidgetsBuilder = connect(
    wizardSelector,
     {
        insertWidget,
        setPage,
        onEditorChange
    }
)(builderConfiguration(require('../components/widgets/builder/WidgetsBuilder')));


const BuilderHeader = connect(() => {}, {
    onClose: setControlProperty.bind(null, "widgetBulder", "enabled", false, false)
})(require('../components/widgets/builder/BuilderHeader'));

class SideBarComponent extends React.Component {
     static propTypes = {
         id: PropTypes.string,
         enabled: PropTypes.bool,
         limitDockHeight: PropTypes.bool,
         fluid: PropTypes.bool,
         zIndex: PropTypes.number,
         dockSize: PropTypes.number,
         position: PropTypes.string,
         onMount: PropTypes.funct,
         onUnmount: PropTypes.funct,
         dimMode: PropTypes.string,
         src: PropTypes.string,
         style: PropTypes.object
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
         onUnmount: () => {}
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
            dockStyle={{ background: "white" /* TODO set it to undefined when you can inject a class inside Dock, to use theme */}}
        >
            <BorderLayout
                header={<BuilderHeader />}
                >
                {this.props.enabled ? <WidgetsBuilder /> : null}
            </BorderLayout>

        </Dock>);

    }
}

const Plugin = connect(
    createSelector(
        widgetBulderSelector,
        (enabled) => ({
            enabled
    })), {
        onMount: () => setControlProperty("widgetBulder", "available", true),
        onUnmount: () => setControlProperty("widgetBulder", "available", false)
    }

)(SideBarComponent);
module.exports = {
    WidgetsBuilderPlugin: Plugin,
    epics: require('../epics/widgetsbuilder')
};
