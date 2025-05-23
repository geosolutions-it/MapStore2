/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { connect } from 'react-redux';
import { get } from "lodash";
import { Glyphicon } from 'react-bootstrap';

import {
    openDetailsPanel,
    closeDetailsPanel,
    NO_DETAILS_AVAILABLE
} from "../actions/details";

import { detailsTextSelector, detailsUriSelector, detailsSettingsSelector } from '../selectors/details';
import { mapLayoutValuesSelector } from '../selectors/maplayout';

import DetailsViewer from '../components/resources/modals/fragments/DetailsViewer';
import DetailsPanel from '../components/details/DetailsPanel';

import Message from '../components/I18N/Message';
import ResizableModal from '../components/misc/ResizableModal';

import { createPlugin } from '../utils/PluginsUtils';

import details from '../reducers/details';
import * as epics from '../epics/details';
import {createStructuredSelector} from "reselect";
import { getDashboardId } from '../selectors/dashboard';
import { DEFAULT_PANEL_WIDTH } from '../utils/LayoutUtils';

/**
 * Allow to show details for the map.
 * "Details for a map" is a window with some HTML, editable from {@link #plugins.Save|Save}
 * or {@link #plugins.SaveAs|SaveAs} plugins.
 * If details for the current map are present, the plugin
 * renders an entry in {@link #plugins.BurgerMenu|BurgerMenu} to show it.
 * It supports as an alternative to render the entry as a
 * button in the {@link #plugins.Toolbar|Toolbar}
 * @class
 * @name Details
 * @memberof plugins
 */

const DetailsPlugin = ({
    active = false,
    dockStyle,
    detailsText,
    showAsModal = false,
    onClose = () => {},
    isDashboard
}) => {
    const viewer = (<DetailsViewer
        className="ms-details-preview-container"
        textContainerClassName="ms-details-preview"
        loading={!detailsText}
        detailsText={detailsText === NO_DETAILS_AVAILABLE ? null : detailsText}/>);

    return showAsModal && active ?
        <ResizableModal
            bodyClassName="details-viewer-modal"
            fitContent
            showFullscreen
            show={active}
            size="lg"
            title={<Message msgId="details.title"/>}
            onClose={onClose}>
            {viewer}
        </ResizableModal> : active &&
        <DetailsPanel
            isDashboard={isDashboard}
            width={DEFAULT_PANEL_WIDTH}
            dockStyle={dockStyle}
            active={active}
            onClose={onClose}>
            {viewer}
        </DetailsPanel>;
};

export default createPlugin('Details', {
    component: connect(createStructuredSelector({
        isDashboard: (state) => {
            return getDashboardId(state) ? true : false;
        },
        active: state => get(state, "controls.details.enabled"),
        dockStyle: state => {
            const isDashbaord = getDashboardId(state);
            let layoutValues = mapLayoutValuesSelector(state, { height: true, right: true }, true);
            if (isDashbaord) {
                layoutValues = { ...layoutValues, right: 0, height: '100%'};
            }
            return layoutValues;
        },
        detailsText: detailsTextSelector,
        showAsModal: state => {
            let detailsSettings = detailsSettingsSelector(state);
            if (detailsSettings && typeof detailsSettings === 'string') detailsSettings = JSON.parse(detailsSettings);
            return  detailsSettings?.showAsModal;
        }
    }), {
        onClose: closeDetailsPanel
    })(DetailsPlugin),
    containers: {
        BurgerMenu: {
            name: 'details',
            position: 1000,
            priority: 2,
            doNotHide: true,
            text: <Message msgId="details.title"/>,
            tooltip: "details.tooltip",
            icon: <Glyphicon glyph="sheet"/>,
            action: openDetailsPanel,
            selector: (state) => {
                const detailsUri = detailsUriSelector(state);
                if (detailsUri && detailsUri !== 'NODATA') {
                    return {};
                }
                return { style: {display: "none"} };
            }
        },
        Toolbar: {
            name: 'details',
            position: 2,
            priority: 0,
            tooltip: "details.title",
            alwaysVisible: true,
            doNotHide: true,
            icon: <Glyphicon glyph="sheet"/>,
            action: openDetailsPanel,
            selector: (state) => {
                const detailsUri = detailsUriSelector(state);
                if (detailsUri  && detailsUri !== 'NODATA') {
                    return {};
                }
                return { style: {display: "none"} };
            }
        },
        SidebarMenu: {
            name: "details",
            position: 4,
            text: <Message msgId="details.title"/>,
            tooltip: "details.tooltip",
            alwaysVisible: true,
            icon: <Glyphicon glyph="sheet"/>,
            action: openDetailsPanel,
            selector: (state) => {
                const detailsUri = detailsUriSelector(state);
                if (detailsUri && detailsUri !== 'NODATA') {
                    return {
                        bsStyle: state.controls.details && state.controls.details.enabled ? 'primary' : 'tray',
                        active: state.controls.details && state.controls.details.enabled || false
                    };
                }
                return {
                    style: {display: "none"}
                };
            },
            doNotHide: true,
            priority: 1
        }
    },
    epics,
    reducers: {
        details
    }
});
