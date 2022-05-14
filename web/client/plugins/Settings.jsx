/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './settings/css/settings.css';

import assign from 'object-assign';
import PropTypes from 'prop-types';
import React from 'react';
import { Col, FormGroup, Glyphicon, Panel, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { ActionCreators } from 'redux-undo';

import { toggleControl } from '../actions/controls';
import { loadLocale } from '../actions/locale';
import LangBarComp from '../components/I18N/LangBar';
import HistoryBar from '../components/mapcontrols/navigationhistory/HistoryBar';
import Dialog from '../components/misc/Dialog';
import { getSupportedLocales } from '../utils/LocaleUtils';
import Message from './locale/Message';
import SettingsPanel from './settings/SettingsPanel';

const LangBar = connect((state) => ({
    currentLocale: state.locale && state.locale.current
}), {
    onLanguageChange: loadLocale.bind(null, null)
})(LangBarComp);

const {undo, redo} = ActionCreators;

class SettingsButton extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        undo: PropTypes.func,
        redo: PropTypes.func,
        mapHistory: PropTypes.object,
        settings: PropTypes.object,
        overrideSettings: PropTypes.object,
        items: PropTypes.array,
        style: PropTypes.object,
        wrap: PropTypes.bool,
        wrapWithPanel: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        visible: PropTypes.bool,
        toggleControl: PropTypes.func,
        closeGlyph: PropTypes.string
    };

    static defaultProps = {
        id: "mapstore-settings",
        settings: {
            language: true,
            history: true
        },
        overrideSettings: {
            history: false
        },
        items: [],
        style: {
            width: "300px"
        },
        wrap: false,
        wrapWithPanel: false,
        panelStyle: {
            minWidth: "300px",
            zIndex: 1996,
            position: "absolute",
            overflow: "visible",
            top: "90px",
            left: "calc(50% - 150px)",
            backgroundColor: "white"
        },
        panelClassName: "toolbar-panel",
        visible: false,
        toggleControl: () => {},
        closeGlyph: "1-close"
    };

    renderSettings = () => {
        const settingsFirst = {
            language: (
                <span key="language-label">
                    <FormGroup>
                        <Row>
                            <Col xs={12}>
                                <label><Message msgId="language" /></label>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <LangBar dropdown={false} locales={getSupportedLocales()} key="langSelector"/>
                            </Col>
                        </Row>
                    </FormGroup>

                </span>)
        };
        const settingsLast = {
            history: <HistoryBar
                key="history"
                undoBtnProps={{
                    onClick: this.props.undo,
                    label: <Message msgId="history.undoBtnTooltip"/>,
                    disabled: this.props.mapHistory.past.length > 0 ? false : true
                }}
                redoBtnProps={{
                    onClick: this.props.redo,
                    label: <Message msgId="history.redoBtnTooltip" />,
                    disabled: this.props.mapHistory.future.length > 0 ? false : true
                }}/>
        };

        return Object.keys(settingsFirst)
            .filter(this.isEnabled)
            .map((setting) => settingsFirst[setting])
            // TODO: here every item (item.tool) we emit should have a "key" property
            .concat(this.props.items.map((item) => item.tool))
            .concat(
                Object.keys(settingsLast)
                    .filter(this.isEnabled)
                    .map((setting) => settingsLast[setting])
            );
    };

    render() {
        const settings =
            (<SettingsPanel key="SettingsPanel" role="body" style={this.props.style}>
                {this.renderSettings()}
            </SettingsPanel>);
        if (this.props.wrap) {
            if (this.props.visible) {
                if (this.props.wrapWithPanel) {
                    return (<Panel id={this.props.id} header={<span><span className="settings-panel-title"><Message msgId="settings"/></span><span className="settings-panel-close panel-close" onClick={this.props.toggleControl}></span></span>} style={this.props.panelStyle} className={this.props.panelClassName}>
                        {settings}
                    </Panel>);
                }
                return (<Dialog id={this.props.id} style={{...this.props.panelStyle, display: this.props.visible ? 'block' : 'none'}} className={this.props.panelClassName} draggable={false} modal>
                    <span role="header">
                        <span className="settings-panel-title"><Message msgId="settings"/></span>
                        <button onClick={this.props.toggleControl} className="settings-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
                    </span>
                    {settings}
                </Dialog>);
            }
        } else {
            return settings;
        }
        return null;
    }

    isEnabled = (setting) => {
        const settings = assign({}, this.props.settings, this.props.overrideSettings);
        return settings[setting];
    };
}

const SettingsPlugin = connect((state) => ({
    mapHistory: state.map && state.map.past && {past: state.map.past, future: state.map.future} || {past: [], future: []},
    visible: state.controls && state.controls.settings && state.controls.settings.enabled || false,
    settings: {
        language: state.locale && true || false,
        history: state.map && state.map.history && true || false
    }
}), {
    undo,
    redo,
    toggleControl: toggleControl.bind(null, 'settings', null)
})(SettingsButton);


/**
 * Settings window to configure some details of the current map.
 * Is also a container for settings coming from the other plugins.
 * Renders in {@link #plugins.BurgerMenu|BurgerMenu} an entry to open this window.
 * @name Settings
 * @class
 * @memberof plugins
 */
export default {
    SettingsPlugin: assign(SettingsPlugin, {
        Toolbar: {
            name: 'settings',
            position: 100,
            tooltip: "settings",
            help: <Message msgId="helptexts.settingsPanel"/>,
            icon: <Glyphicon glyph="cog"/>,
            panel: true,
            wrap: true,
            exclusive: true,
            priority: 1
        },
        DrawerMenu: {
            name: 'settings',
            position: 3,
            title: 'settings',
            priority: 2
        },
        BurgerMenu: {
            name: 'settings',
            position: 100,
            text: <Message msgId="settings"/>,
            tooltip: "settingsTooltip",
            icon: <Glyphicon glyph="cog"/>,
            action: toggleControl.bind(null, 'settings', null),
            priority: 4,
            doNotHide: true
        },
        SidebarMenu: {
            name: 'settings',
            position: 100,
            tooltip: "settingsTooltip",
            text: <Message msgId="settings"/>,
            icon: <Glyphicon glyph="cog"/>,
            toggle: true,
            action: toggleControl.bind(null, 'settings', null),
            priority: 3,
            doNotHide: true
        }
    }),
    reducers: {}
};
