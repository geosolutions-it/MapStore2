/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
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
const LayersUtils = require('../../../utils/LayersUtils');

class SettingsModal extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        settings: PropTypes.object,
        element: PropTypes.object,
        updateSettings: PropTypes.func,
        hideSettings: PropTypes.func,
        updateNode: PropTypes.func,
        removeNode: PropTypes.func,
        retrieveLayerData: PropTypes.func,
        titleText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        opacityText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        elevationText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        saveText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        deleteText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        confirmDeleteText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        closeText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
        options: PropTypes.object,
        chartStyle: PropTypes.object,
        showElevationChart: PropTypes.bool,
        buttonSize: PropTypes.string,
        closeGlyph: PropTypes.string,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        includeCloseButton: PropTypes.bool,
        includeDeleteButton: PropTypes.bool,
        realtimeUpdate: PropTypes.bool,
        groups: PropTypes.array,
        getDimension: PropTypes.func
    };

    static defaultProps = {
        id: "mapstore-layer-settings",
        settings: {expanded: false},
        options: {},
        updateSettings: () => {},
        hideSettings: () => {},
        updateNode: () => {},
        removeNode: () => {},
        retrieveLayerData: () => {},
        buttonSize: "large",
        closeGlyph: "1-close",
        panelStyle: {},
        panelClassName: "toolbar-panel portal-dialog",
        includeCloseButton: true,
        includeDeleteButton: true,
        realtimeUpdate: true,
        deleteText: <Message msgId="layerProperties.delete" />,
        confirmDeleteText: <Message msgId="layerProperties.confirmDelete" />,
        getDimension: LayersUtils.getDimension
    };

    state = {
        initialState: {},
        originalSettings: {}
    };

    componentWillMount() {
        this.setState({initialState: this.props.element});
    }

    componentWillUpdate(newProps, newState) {
        if (this.props.settings.expanded && !newProps.settings.expanded && !newState.save) {
            this.props.updateNode(
                this.props.settings.node,
                this.props.settings.nodeType,
                assign({}, this.props.settings.options, this.state.originalSettings)
            );
        }
    }

    onDelete = () => {
        this.props.removeNode(
            this.props.settings.node,
            this.props.settings.nodeType
        );
        this.props.hideSettings();
    };

    onClose = () => {
        this.setState({save: false});
        this.props.hideSettings();
    };

    renderGeneral = () => {
        return (<General
            updateSettings={this.updateParams}
            element={this.props.element}
            groups={this.props.groups}
            key="general"/>);
    };

    renderDisplay = () => {
        return (<Display
           opacityText={this.props.opacityText}
           element={this.props.element}
           settings={this.props.settings}
           onChange={(key, value) => this.updateParams({[key]: value}, this.props.realtimeUpdate)} />);
    };

    renderStyleTab = () => {
        if (this.props.element.type === "wms") {
            return (<WMSStyle
                    retrieveLayerData={this.props.retrieveLayerData}
                    updateSettings={this.updateParams}
                    element={this.props.element}
                    key="style"/>);
        }
    };

    renderElevationTab = () => {
        const elevationDim = this.props.getDimension(this.props.element.dimensions, 'elevation');
        if (this.props.element.type === "wms" && this.props.element.dimensions && elevationDim) {
            return (<Elevation
               elevationText={this.props.elevationText}
               chartStyle={this.props.chartStyle}
               showElevationChart={this.props.showElevationChart}
               element={this.props.element}
               elevations={elevationDim}
               appState={this.state || {}}
               onChange={(key, value) => this.updateParams({[key]: value}, this.props.realtimeUpdate)} />);
        }
    };

    render() {
        const general = this.renderGeneral();
        const display = this.renderDisplay();
        const style = this.renderStyleTab();
        const elevation = this.renderElevationTab();
        const availableTabs = [<Tab key={1} eventKey={1} title={<Message msgId="layerProperties.general" />}>{general}</Tab>,
            <Tab key={2} eventKey={2} title={<Message msgId="layerProperties.display" />}>{display}</Tab>,
            <Tab key={3} eventKey={3} title={<Message msgId="layerProperties.style" />} disabled={!style} >{style}</Tab>]
            .concat(elevation ? [<Tab key={4} eventKey={4} title={<Message msgId="layerProperties.elevation" />}>{elevation}</Tab>] : []);
        const tabs = <Tabs defaultActiveKey={1} id="layerProperties-tabs">{availableTabs}</Tabs>;
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
                this.setState({save: true});
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
    }

    updateParams = (newParams, updateNode = true) => {
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
    };
}

module.exports = SettingsModal;
