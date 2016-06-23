/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Modal, Label, Button, Glyphicon} = require('react-bootstrap');
const Slider = require('react-nouislider');

require("./settingsModal.css");

const Dialog = require('../../misc/Dialog');
const {Portal} = require('react-overlays');
const assign = require('object-assign');

const SettingsModal = React.createClass({
    propTypes: {
        id: React.PropTypes.string,
        settings: React.PropTypes.object,
        updateSettings: React.PropTypes.func,
        hideSettings: React.PropTypes.func,
        updateNode: React.PropTypes.func,
        opacityText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        saveText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        closeText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        options: React.PropTypes.object,
        asModal: React.PropTypes.bool,
        buttonSize: React.PropTypes.string,
        closeGlyph: React.PropTypes.string,
        panelStyle: React.PropTypes.object,
        panelClassName: React.PropTypes.string,
        includeCloseButton: React.PropTypes.bool,
        realtimeUpdate: React.PropTypes.bool
    },
    getDefaultProps() {
        return {
            id: "mapstore-layer-settings",
            settings: {expanded: false},
            options: {},
            updateSettings: () => {},
            hideSettings: () => {},
            updateNode: () => {},
            asModal: true,
            buttonSize: "large",
            closeGlyph: "",
            panelStyle: {
                minWidth: "300px",
                zIndex: 100,
                position: "absolute",
                overflow: "auto",
                top: "100px",
                left: "calc(50% - 150px)",
                backgroundColor: "white"
            },
            panelClassName: "toolbar-panel",
            includeCloseButton: true,
            realtimeUpdate: true
        };
    },
    getInitialState() {
        return {
            initialOpacity: 1
        };
    },
    componentWillMount() {
        this.setState({initialOpacity: this.props.settings.options.opacity});
    },
    onClose() {
        this.props.updateNode(
            this.props.settings.node,
            this.props.settings.nodeType,
            assign({}, this.props.settings.options, {opacity: this.state.initialOpacity})
        );
        this.props.hideSettings();
    },
    render() {
        const settings = (<span role="body"><Slider start={[Math.round(this.props.settings.options.opacity * 100)]}
                range={{min: 0, max: 100}}
                onChange={(opacity) => this.updateOpacity(opacity / 100, this.props.realtimeUpdate)}/>
            <Label>{Math.round(this.props.settings.options.opacity * 100) + "%"}</Label></span>);
        const footer = (<span role="footer">
            {this.props.includeCloseButton ? <Button bsSize={this.props.buttonSize} onClick={this.onClose}>{this.props.closeText}</Button> : <span/>}
            <Button bsSize={this.props.buttonSize} bsStyle="primary" onClick={() => {
                this.updateOpacity(this.props.settings.options.opacity, true);
                this.props.hideSettings();
            }}>{this.props.saveText}</Button>
        </span>);

        if (this.props.settings.expanded) {
            return this.props.asModal ? (
                <Modal {...this.props.options} show={this.props.settings.expanded} container={document.getElementById("body")}>
                    <Modal.Header><Modal.Title>{this.props.opacityText}</Modal.Title></Modal.Header>
                    <Modal.Body>
                        {settings}
                    </Modal.Body>
                    <Modal.Footer>
                        {footer}
                    </Modal.Footer>
                </Modal>
            ) : (<Portal><Dialog id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
                <span role="header">
                    <span className="layer-settings-panel-title">{this.props.opacityText}</span>
                    <button onClick={this.onClose} className="layer-settings-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
                </span>
                {settings}
                {footer}
            </Dialog></Portal>);
        }
        return null;
    },
    updateOpacity(opacity, updateNode) {
        this.props.updateSettings({"opacity": opacity});
        if (updateNode) {
            this.props.updateNode(
                this.props.settings.node,
                this.props.settings.nodeType,
                assign({}, this.props.settings.options, {opacity})
            );
        }

    }
});

module.exports = SettingsModal;
