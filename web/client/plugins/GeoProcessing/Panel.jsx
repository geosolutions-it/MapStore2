/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Message from '../../components/I18N/Message';
import BorderLayout from '../../components/layout/BorderLayout';
import ResponsivePanel from "../../components/misc/panels/ResponsivePanel";
import GeoProcessingMain from './Main';
import { toggleControl } from '../../actions/controls';
import { initPlugin } from '../../actions/geoProcessing';
import { isGeoProcessingEnabledSelector } from '../../selectors/controls';
import { dockStyleSelector } from '../../selectors/maplayout';
import { DEFAULT_PANEL_WIDTH } from '../../utils/LayoutUtils';

const PanelComp = ({
    dockStyle,
    enabled,
    pluginCfg,
    onClose,
    onMount
}) => {
    useEffect( () => {
        onMount(pluginCfg);
    }, []);
    return enabled ?
        (
            <ResponsivePanel
                containerStyle={dockStyle}
                containerClassName="dock-container"
                containerId="GeoProcessing-root"
                open={enabled}
                size={DEFAULT_PANEL_WIDTH}
                dock
                position="right"
                title={<Message msgId="GeoProcessing.title"/>}
                onClose={onClose}
                glyph="globe-settings"
                style={dockStyle}
            >
                <BorderLayout
                    key="gpt-BorderLayout"
                    className="geo-processing-tool-panel"
                >
                    <GeoProcessingMain/>
                </BorderLayout>
            </ResponsivePanel>
        ) : null;
};

PanelComp.propTypes = {
    enabled: PropTypes.bool,
    dockStyle: PropTypes.object,
    pluginCfg: PropTypes.object,
    onClose: PropTypes.func,
    onMount: PropTypes.func
};

const PanelCompConnected = connect(
    createSelector(
        [
            isGeoProcessingEnabledSelector,
            dockStyleSelector
        ],
        (
            enabled,
            dockStyle
        ) => ({
            enabled,
            dockStyle
        })),
    {
        onMount: initPlugin,
        onClose: toggleControl.bind(null, 'GeoProcessing', null)
    })(PanelComp);

export default PanelCompConnected;
