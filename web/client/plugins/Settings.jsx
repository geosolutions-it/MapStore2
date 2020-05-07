const PropTypes = require('prop-types');
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

const {toggleControl} = require('../actions/controls');

const LangBar = connect((state) => ({
    currentLocale: state.locale && state.locale.current
}), {
    onLanguageChange: loadLocale.bind(null, null)
})(require('../components/I18N/LangBar'));

require('./settings/css/settings.css');

const HistoryBar = require('../components/mapcontrols/navigationhistory/HistoryBar');
const { ActionCreators } = require('redux-undo');
const {undo, redo} = ActionCreators;

const Message = require('./locale/Message');

const {Glyphicon, FormGroup, Row, Col} = require('react-bootstrap');

const assign = require('object-assign');

const SettingsPanel = require('./settings/SettingsPanel');
const LocaleUtils = require('../utils/LocaleUtils');
const {Panel} = require('react-bootstrap');
const Dialog = require('../components/misc/Dialog');

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
                                <LangBar dropdown={false} locales={LocaleUtils.getSupportedLocales()} key="langSelector"/>
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
            icon: <Glyphicon glyph="cog"/>,
            action: toggleControl.bind(null, 'settings', null),
            priority: 3,
            doNotHide: true
        }
    }),
    reducers: {}
};
