/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './css/settingsModal.css';

import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, Tabs, Tab } from 'react-bootstrap';
import assign from 'object-assign';

import General from './settings/General';
import Dialog from '../../misc/Dialog';
import Portal from '../../misc/Portal';
import Message from '../../I18N/Message';

import Button from '../../misc/Button';

class GroupSettingsModal extends React.Component {
    static propTypes = {
        element: PropTypes.object,
        settings: PropTypes.object,
        updateSettings: PropTypes.func,
        updateNode: PropTypes.func,
        hideSettings: PropTypes.func
    };

    static defaultProps = {
        element: {},
        settings: {expanded: false},
        updateSettings: () => {},
        updateNode: () => {},
        hideSettings: () => {}
    };

    state = {
        initialState: {},
        originalSettings: {}
    };

    UNSAFE_componentWillMount() {
        this.setState({
            initialState: this.props.element,
            originalSettings: this.props.element
        });
    }

    UNSAFE_componentWillUpdate(newProps, newState) {
        if (this.props.settings.expanded && !newProps.settings.expanded && !newState.save) {
            this.props.updateNode(
                this.props.settings.node,
                this.props.settings.nodeType,
                assign({}, this.props.settings.options, this.state.originalSettings)
            );
        }

        if (!this.props.settings.expanded && newProps.settings.expanded) {
            // update initial and original settings on show modal
            this.setState({
                initialState: this.props.element,
                originalSettings: this.props.element
            });
        }
    }

    onClose = () => {
        this.setState({save: false});
        this.props.hideSettings();
    };

    renderGeneral = () => {
        return (
            <General
                updateSettings={this.updateParams}
                element={this.props.element}
                key="general"
                nodeType="groups"/>
        );
    };

    render() {
        return this.props.settings.expanded ? (
            <Portal>
                <Dialog id="mapstore-layer-groups-settings" className="portal-dialog">
                    <div role="header">
                        <span>{<Message msgId="layerProperties.groupProperties" />}</span>
                        <button className="close" onClick={this.onClose}>
                            <Glyphicon glyph="1-close"/>
                        </button>
                    </div>
                    <div role="body">
                        <Tabs defaultActiveKey={1} id="layerProperties-tabs">
                            <Tab key={0} eventKey={1} title={<Message msgId="layerProperties.general" />}>
                                { this.renderGeneral() }
                            </Tab>
                        </Tabs>
                    </div>
                    <div role="footer">
                        <Button bsSize="sm" bsStyle="primary" onClick={() => { this.props.hideSettings(); this.setState({save: true}); }}>
                            {<Message msgId="save"/>}
                        </Button>
                    </div>
                </Dialog>
            </Portal>
        ) : null;
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

export default GroupSettingsModal;
