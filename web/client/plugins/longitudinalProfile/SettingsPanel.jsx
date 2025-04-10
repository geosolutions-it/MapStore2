/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Dialog from "../../components/misc/Dialog";
import Properties from "./Properties";
import { setControlProperty } from "../../actions/controls";
import Message from "../../plugins/locale/Message";
import SettingsPanelComp from "../../plugins/settings/SettingsPanel";
import {
    isParametersOpenSelector
} from '../../selectors/longitudinalProfile';

const Panel = ({
    isParametersOpen,
    panelStyle = {width: '330px'},
    onToggleParameters
}) => {

    return (<Dialog
        id={"LongitudinalSettingsPanel"}
        style={{...panelStyle, display: isParametersOpen ? 'block' : 'none'}}
        draggable={false}
        modal
    >
        <span role="header">
            <span className="modal-title settings-panel-title">
                <Message msgId="settings"/>
            </span>
            <button
                onClick={onToggleParameters}
                className="settings-panel-close close"
            >
                {<Glyphicon glyph="1-close"/>}
            </button>
        </span>
        <SettingsPanelComp key="LongitudinalSettingsPanel" role="body">
            <Properties />
        </SettingsPanelComp>
    </Dialog>);
};

const PanelConnected = connect(
    createSelector(
        [
            isParametersOpenSelector
        ],
        (
            isParametersOpen
        ) => ({
            isParametersOpen
        })), {
        onToggleParameters: setControlProperty.bind(this, "LongitudinalProfileToolParameters", "enabled", true, true)
    })(Panel);

export default PanelConnected;
