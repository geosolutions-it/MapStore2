/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');

const {loadLocale} = require('../actions/locale');

const LangBar = connect((state) => ({
    currentLocale: state.locale && state.locale.current
}), {
    onLanguageChange: loadLocale.bind(null, null)
})(require('../components/I18N/LangBar'));


const HistoryBar = require('../components/mapcontrols/navigationhistory/HistoryBar');
const { ActionCreators } = require('redux-undo');
const {undo, redo} = ActionCreators;

const Message = require('./locale/Message');

const {Glyphicon} = require('react-bootstrap');

const assign = require('object-assign');

const SettingsPanel = require('./settings/SettingsPanel');

const SettingsButton = React.createClass({
    propTypes: {
        undo: React.PropTypes.func,
        redo: React.PropTypes.func,
        mapHistory: React.PropTypes.object,
        settings: React.PropTypes.object,
        overrideSettings: React.PropTypes.object,
        items: React.PropTypes.array,
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            settings: {
                language: true,
                history: true
            },
            items: [],
            style: {
                width: "300px"
            }
        };
    },
    renderSettings() {
        const settingsFirst = {
            language: <LangBar key="langSelector"/>
        };
        const settingsLast = {
            history: <HistoryBar
                key="history"
                undoBtnProps={{
                    onClick: this.props.undo,
                    label: <Message msgId="history.undoBtnTooltip"/>,
                    disabled: (this.props.mapHistory.past.length > 0) ? false : true
                }}
                redoBtnProps={{
                    onClick: this.props.redo,
                    label: <Message msgId="history.redoBtnTooltip" />,
                    disabled: (this.props.mapHistory.future.length > 0) ? false : true
            }}/>
        };

        return Object.keys(settingsFirst)
            .filter(this.isEnabled)
            .map((setting) => settingsFirst[setting])
            .concat(this.props.items.map((item) => item.tool))
            .concat(
                Object.keys(settingsLast)
                    .filter(this.isEnabled)
                    .map((setting) => settingsLast[setting])
            );
    },
    render() {
        return (
            <SettingsPanel style={this.props.style}>
                <h5><Message msgId="language" /></h5>
                {this.renderSettings()}
            </SettingsPanel>
        );
    },
    isEnabled(setting) {
        const settings = assign({}, this.props.settings, this.props.overrideSettings);
        return settings[setting];
    }
});

const SettingsPlugin = connect((state) => ({
    mapHistory: state.map && state.map.past && {past: state.map.past, future: state.map.future} || {past: [], future: []},
    settings: {
        language: state.locale && true || false,
        history: state.map && state.map.history && true || false
    }
}), {
    undo,
    redo
})(SettingsButton);

module.exports = {
    SettingsPlugin: assign(SettingsPlugin, {
        Toolbar: {
            name: 'settings',
            position: 100,
            tooltip: "settings",
            help: <Message msgId="helptexts.settingsPanel"/>,
            icon: <Glyphicon glyph="cog"/>,
            panel: true,
            wrap: true,
            exclusive: true
        },
        DrawerMenu: {
            name: 'settings',
            position: 3,
            title: 'settings'
        }
    }),
    reducers: {}
};
