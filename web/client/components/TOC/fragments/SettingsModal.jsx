/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Button, Glyphicon, Tabs, Tab} = require('react-bootstrap');

require("./css/settingsModal.css");

const Dialog = require('../../misc/Dialog');
const ConfirmButton = require('../../buttons/ConfirmButton');
const General = require('./settings/General');
const Display = require('./settings/Display');
const WMSStyle = require('./settings/WMSStyle');
const Elevation = require('./settings/Elevation');
const Portal = require('../../misc/Portal');
const assign = require('object-assign');
const Message = require('../../I18N/Message');

const SettingsModal = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        settings: React.PropTypes.object,
        element: React.PropTypes.object,
        updateSettings: React.PropTypes.func,
        hideSettings: React.PropTypes.func,
        updateNode: React.PropTypes.func,
        removeNode: React.PropTypes.func,
        retrieveLayerData: React.PropTypes.func,
        titleText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        opacityText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        elevationText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        saveText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        deleteText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        confirmDeleteText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        closeText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        options: React.PropTypes.object,
        chartStyle: React.PropTypes.object,
        buttonSize: React.PropTypes.string,
        closeGlyph: React.PropTypes.string,
        panelStyle: React.PropTypes.object,
        panelClassName: React.PropTypes.string,
        includeCloseButton: React.PropTypes.bool,
        includeDeleteButton: React.PropTypes.bool,
        realtimeUpdate: React.PropTypes.bool,
        groups: React.PropTypes.array,
        elevations: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            id: "mapstore-layer-settings",
            settings: {expanded: false},
            options: {},
            elevations: {},
            updateSettings: () => {},
            hideSettings: () => {},
            updateNode: () => {},
            removeNode: () => {},
            retrieveLayerData: () => {},
            buttonSize: "large",
            closeGlyph: "",
            panelStyle: {
                minWidth: "300px",
                zIndex: 2000,
                position: "absolute",
                // overflow: "auto",
                top: "100px",
                left: "calc(50% - 150px)"
            },
            panelClassName: "toolbar-panel",
            includeCloseButton: true,
            includeDeleteButton: true,
            realtimeUpdate: true,
            deleteText: <Message msgId="layerProperties.delete" />,
            confirmDeleteText: <Message msgId="layerProperties.confirmDelete" />
        };
    },
    getInitialState() {
        return {
            initialState: {},
            originalSettings: {}
        };
    },
    componentWillMount() {
        this.setState({initialState: this.props.element});
    },
    onDelete() {
        this.props.removeNode(
            this.props.settings.node,
            this.props.settings.nodeType
        );
        this.props.hideSettings();
    },
    onClose() {
        this.props.updateNode(
            this.props.settings.node,
            this.props.settings.nodeType,
            assign({}, this.props.settings.options, this.state.originalSettings)
        );
        this.props.hideSettings();
    },
    renderGeneral() {
        return (<General
            updateSettings={this.updateParams}
            element={this.props.element}
            groups={this.props.groups}
            key="general"
            on/>);
    },
    renderDisplay() {
        return (<Display
           opacityText={this.props.opacityText}
           element={this.props.element}
           settings={this.props.settings}
           onChange={(key, value) => this.updateParams({[key]: value}, this.props.realtimeUpdate)} />);
    },
    renderStyleTab() {
        if (this.props.element.type === "wms") {
            return (<WMSStyle
                    retrieveLayerData={this.props.retrieveLayerData}
                    updateSettings={this.updateParams}
                    element={this.props.element}
                    key="style"
                    o/>);
        }
    },
    renderElevationTab() {
        if (this.props.element.type === "wms" && this.props.element.elevations) {
            return (<Elevation
               elevationText={this.props.elevationText}
               chartStyle={this.props.chartStyle}
               element={this.props.element}
               elevations={this.props.element.elevations}
               appState={this.state || {}}
               onChange={(key, value) => this.updateParams({[key]: value}, this.props.realtimeUpdate)} />);
        }
    },
    render() {
        const general = this.renderGeneral();
        const display = this.renderDisplay();
        const style = this.renderStyleTab();
        const elevation = this.renderElevationTab();
        const tabs = (<Tabs defaultActiveKey={1} id="layerProperties-tabs">
            <Tab eventKey={1} title={<Message msgId="layerProperties.general" />}>{general}</Tab>
            <Tab eventKey={2} title={<Message msgId="layerProperties.display" />}>{display}</Tab>
            <Tab eventKey={3} title={<Message msgId="layerProperties.style" />} disabled={!style} >{style}</Tab>
            <Tab eventKey={4} title={<Message msgId="layerProperties.elevation" />} disabled={!elevation} >{elevation}</Tab>
          </Tabs>);
        const footer = (<span role="footer">
            {this.props.includeCloseButton ? <Button bsSize={this.props.buttonSize} onClick={this.onClose}>{this.props.closeText}</Button> : <span/>}
            {this.props.includeDeleteButton ?
                <ConfirmButton
                  onConfirm={this.onDelete}
                  text={this.props.deleteText}
                  confirming={{
                      text: this.props.confirmDeleteText
                  }}
                />
            : <span/>}
            <Button bsSize={this.props.buttonSize} bsStyle="primary" onClick={() => {
                this.updateParams(this.props.settings.options.opacity, true);
                this.props.hideSettings();
            }}>{this.props.saveText}</Button>
        </span>);

        if (this.props.settings.expanded) {
            return (<Portal><Dialog id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
                <span role="header">
                    <span className="layer-settings-panel-title">{this.props.titleText}</span>
                    <button onClick={this.onClose} className="layer-settings-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
                </span>
                <div role="body">
                    {tabs}
                </div>
                {footer}
            </Dialog></Portal>);
        }
        return null;
    },
    updateParams(newParams, updateNode = true) {
        let originalSettings = assign({}, this.state.originalSettings);
        // TODO one level only storage of original settings for the moment
        Object.keys(newParams).forEach((key) => {
            originalSettings[key] = this.state.initialState[key];
        });
        this.setState({originalSettings});
        this.props.updateSettings(newParams);
        if (updateNode) {
            this.props.updateNode(
                this.props.settings.node,
                this.props.settings.nodeType,
                assign({}, this.props.settings.props, newParams)
            );
        }
    }
});

module.exports = SettingsModal;
