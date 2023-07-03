/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createSelector } from 'reselect';
import { Panel } from 'react-bootstrap';

import { isGeoProcessingToolsEnabledSelector } from '../../selectors/controls';
import { dockStyleSelector } from '../../selectors/maplayout';
import Message from '../../components/I18N/Message';
import ResponsivePanel from "../../components/misc/panels/ResponsivePanel";

const PanelComp = ({
    dockStyle,
    enabled,
    panelStyle = {
        zIndex: 100,
        overflow: "hidden",
        height: "100%"
    },
    panelClassName = "catalog-panel",
    onClose
}) => {
    return enabled ?
        (
            <ResponsivePanel
                containerStyle={dockStyle}
                containerId="geoProcessing-root"
                containerClassName={enabled ? 'catalog-active' : ''}
                open={enabled}
                size={550}
                dock
                position="right"
                bsStyle="primary"
                title={<Message msgId="catalog.title"/>}
                onClose={onClose}
                glyph="folder-open"
                style={dockStyle}
            >
                <Panel id={"geoProcessing-panel"} style={panelStyle} className={panelClassName}>
                    test
                </Panel>
            </ResponsivePanel>
        ) : null;
};

PanelComp.propTypes = {
    dockStyle: PropTypes.object,
    panelStyle: PropTypes.object,
    panelClassName: PropTypes.string,
    enabled: PropTypes.bool,
    onClose: PropTypes.func
};

const PanelCompConnected = connect(
    createSelector(
        [
            isGeoProcessingToolsEnabledSelector,
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
    })(PanelComp);

export default PanelCompConnected;
