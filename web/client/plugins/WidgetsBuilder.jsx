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
const {widgetBuilderSelector} = require('../selectors/controls');
const {getEditingWidget, getEditorSettings, getWidgetLayer, dependenciesSelector} = require('../selectors/widgets');

const {setControlProperty} = require('../actions/controls');
const {insertWidget, onEditorChange, setPage, openFilterEditor, changeEditorSetting} = require('../actions/widgets');
const PropTypes = require('prop-types');
const builderConfiguration = require('../components/widgets/enhancers/builderConfiguration');
const BorderLayout = require('../components/layout/BorderLayout');
const {mapLayoutValuesSelector} = require('../selectors/maplayout');

const wizardStateToProps = ( stateProps = {}, dispatchProps = {}, ownProps = {}) => ({
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        step: stateProps && stateProps.settings && stateProps.settings.step,
        valid: stateProps && stateProps.settings && stateProps.settings.valid,
        onFinish: () => dispatchProps.insertWidget && dispatchProps.insertWidget({
            layer: stateProps.layer,
            url: stateProps.layer && stateProps.layer.url,
            ...(stateProps.editorData || {})
        })
    });
const wizardSelector = createSelector(
    getWidgetLayer,
    getEditingWidget,
    getEditorSettings,
    dependenciesSelector,
    (layer, editorData, settings, dependencies) => ({
        layer: (editorData && editorData.layer) || layer,
        editorData,
        settings,
        dependencies
    })
);
const WidgetsBuilder = connect(
    wizardSelector,
     {
        setPage,
        setValid: valid => changeEditorSetting("valid", valid),
        onEditorChange,
        insertWidget
    },
    wizardStateToProps
)(builderConfiguration(require('../components/widgets/builder/WidgetsBuilder')));


const BuilderHeader = connect(wizardSelector, {
        openFilterEditor: openFilterEditor,
        setPage,
        insertWidget,
        onClose: setControlProperty.bind(null, "widgetBuilder", "enabled", false, false)
    },
    wizardStateToProps
)(require('../components/widgets/builder/BuilderHeader'));

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
            <BorderLayout
                header={<BuilderHeader />}
                >
                {this.props.enabled ? <WidgetsBuilder onFinish /> : null}
            </BorderLayout>

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
        onUnmount: () => setControlProperty("widgetBuilder", "available", false)
    }

)(SideBarComponent);
module.exports = {
    WidgetsBuilderPlugin: Plugin,
    epics: require('../epics/widgetsbuilder')
};
