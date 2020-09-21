/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {connect} from 'react-redux';
import {get} from "lodash";
import {Glyphicon} from 'react-bootstrap';

import Message from '../components/I18N/Message';
import {mapIdSelector, mapInfoDetailsUriFromIdSelector, mapInfoDetailsSettingsFromIdSelector} from '../selectors/map';
import {mapLayoutValuesSelector} from '../selectors/maplayout';
import {openDetailsPanel, closeDetailsPanel, NO_DETAILS_AVAILABLE} from "../actions/maps";

import DetailsViewer from '../components/resources/modals/fragments/DetailsViewer';
import DetailsPanel from '../components/details/DetailsPanel';

import ResizableModal from '../components/misc/ResizableModal';
import {createPlugin} from '../utils/PluginsUtils';

/**
 * Details plugin used for fetching details of the map
 * @class
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
            showFullscreen
            show={active}
            size="lg"
            title={<Message msgId="details.title"/>}
            onClose={onClose}>
            {viewer}
        </ResizableModal> :
        <DetailsPanel
            dockStyle={dockStyle}
            active={active}
            onClose={onClose}>
            {viewer}
        </DetailsPanel>;
};

export default createPlugin('Details', {
    component: connect((state) => ({
        active: get(state, "controls.details.enabled"),
        dockStyle: mapLayoutValuesSelector(state, {height: true}),
        detailsText: state.maps.detailsText,
        showAsModal: mapInfoDetailsSettingsFromIdSelector(state)?.showAsModal
    }), {
        onClose: closeDetailsPanel
    })(DetailsPlugin),
    containers: {
        BurgerMenu: {
            name: 'details',
            position: 1000,
            priority: 1,
            doNotHide: true,
            text: <Message msgId="details.title"/>,
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
            tooltip: <Message msgId="details.title" />,
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
        }
    }
});
