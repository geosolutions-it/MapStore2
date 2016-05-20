/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');

const {changeMousePositionCrs, changeMousePositionState} = require('../../../actions/mousePosition');
const {loadLocale} = require('../../../actions/locale');

const Settings = require('../../components/viewer/Settings');

const LangBar = connect((state) => ({
    currentLocale: state.locale.current
}), {
    onLanguageChange: loadLocale.bind(null, 'translations')
})(require('../../../components/I18N/LangBar'));


const CRSSelector = connect((state) => ({
    crs: state.mousePosition && state.mousePosition.crs || state.map && state.map.present && state.map.present.projection || 'EPSG:3857'
}), {
    onCRSChange: changeMousePositionCrs
})(require('../../../components/mapcontrols/mouseposition/CRSSelector'));

const MousePositionButton = connect((state) => ({
    pressed: state.mousePosition && state.mousePosition.enabled
}), {
    onClick: changeMousePositionState
})(require('../../../components/buttons/ToggleButton'));

const Message = require('../../../components/I18N/Message');

const SettingsButton = React.createClass({
    propTypes: {
        undo: React.PropTypes.func,
        redo: React.PropTypes.func,
        mapHistory: React.PropTypes.object
    },
    render() {
        return (
            <Settings>
                <h5><Message msgId="language" /></h5>
                <LangBar key="langSelector"/>
                <CRSSelector
                    key="crsSelector"
                    enabled={true}
                    inputProps={{
                        label: <Message msgId="mousePositionCoordinates" />,
                        buttonBefore: <MousePositionButton
                            isButton={true}
                            text={<Message msgId="enable" />}
                            glyphicon="eye-open"
                        />
                    }}
                    />
            </Settings>
        );
    }
});
module.exports = SettingsButton;
