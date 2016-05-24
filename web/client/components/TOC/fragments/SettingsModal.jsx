/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Modal, Label, Button} = require('react-bootstrap');
const Slider = require('react-nouislider');

require("./settingsModal.css");

const SettingsModal = React.createClass({
    propTypes: {
        settings: React.PropTypes.object,
        updateSettings: React.PropTypes.func,
        hideSettings: React.PropTypes.func,
        updateNode: React.PropTypes.func,
        opacityText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        saveText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        closeText: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.element]),
        options: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            settings: {expanded: false},
            options: {},
            updateSettings: () => {},
            hideSettings: () => {},
            updateNode: () => {}
        };
    },
    render() {
        if (this.props.settings.expanded) {
            return (
                <Modal {...this.props.options} show={this.props.settings.expanded} container={document.getElementById("body")}>
                    <Modal.Header><Modal.Title>{this.props.opacityText}</Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Slider start={[Math.round(this.props.settings.options.opacity * 100)]}
                                range={{min: 0, max: 100}}
                                onChange={(opacity) => this.props.updateSettings({"opacity": opacity / 100})}/>
                        <Label>{Math.round(this.props.settings.options.opacity * 100) + "%"}</Label>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.props.hideSettings}>{this.props.closeText}</Button>
                        <Button bsStyle="primary" onClick={() => {
                            this.props.updateNode(
                                this.props.settings.node,
                                this.props.settings.nodeType,
                                this.props.settings.options
                            );
                            this.props.hideSettings();
                        }}>{this.props.saveText}</Button>
                    </Modal.Footer>
            </Modal>
            );
        }
        return null;
    }
});

module.exports = SettingsModal;
