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

import { mapIdSelector, mapInfoDetailsUriFromIdSelector, mapInfoDetailsSettingsFromIdSelector } from '../selectors/map';
import { detailsTextSelector } from '../selectors/details';
import { mapLayoutValuesSelector } from '../selectors/maplayout';

import DetailsViewer from '../components/resources/modals/fragments/DetailsViewer';
import DetailsPanel from '../components/details/DetailsPanel';

import Message from '../components/I18N/Message';
import ResizableModal from '../components/misc/ResizableModal';

import { createPlugin } from '../utils/PluginsUtils';

import details from '../reducers/details';
import * as epics from '../epics/details';
import {createStructuredSelector} from "reselect";

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
    onClose = () => {}
}) => {
    const viewer = (<DetailsViewer
        className="ms-details-preview-container"
        textContainerClassName="ms-details-preview"
        loading={!detailsText}
        detailsText={detailsText === NO_DETAILS_AVAILABLE ? null : detailsText}/>);

    return showAsModal ?
        <ResizableModal
            bodyClassName="details-viewer-modal"
            fitContent
            showFullscreen
            show={active}
            size="lg"
            title={<Message msgId="details.title"/>}
            onClose={onClose}>
            {viewer}
        </ResizableModal> :
        <DetailsPanel
            width={550}
            dockStyle={dockStyle}
            active={active}
            onClose={onClose}>
            {viewer}
        </DetailsPanel>;
};

export default createPlugin('Details', {
    component: connect(createStructuredSelector({
        active: state => get(state, "controls.details.enabled"),
        dockStyle: state => mapLayoutValuesSelector(state, { height: true, right: true }, true),
        detailsText: detailsTextSelector,
        showAsModal: state => mapInfoDetailsSettingsFromIdSelector(state)?.showAsModal
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
                const mapId = mapIdSelector(state);
                const detailsUri = mapId && mapInfoDetailsUriFromIdSelector(state, mapId);
                if (detailsUri) {
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
                const mapId = mapIdSelector(state);
                const detailsUri = mapId && mapInfoDetailsUriFromIdSelector(state, mapId);
                if (detailsUri) {
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
                const mapId = mapIdSelector(state);
                const detailsUri = mapId && mapInfoDetailsUriFromIdSelector(state, mapId);
                if (detailsUri) {
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
