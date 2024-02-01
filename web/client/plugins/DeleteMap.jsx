/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from "prop-types";
import { Glyphicon } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import ConfirmDialog from '../components/misc/ConfirmDialog';
import { createPlugin } from '../utils/PluginsUtils';
import { deleteMap } from '../actions/maps';
import { toggleControl } from '../actions/controls';
import { mapIdSelector } from '../selectors/mapInitialConfig';
import { showConfirmDeleteMapModalSelector } from '../selectors/controls';
import Message from '../components/I18N/Message';

class DeleteConfirmDialog extends React.Component {

    static propTypes = {
        show: PropTypes.bool,
        mapId: PropTypes.string,
        onConfirmDelete: PropTypes.func,
        onClose: PropTypes.func
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        show: false,
        mapId: '',
        onConfirmDelete: () => {},
        onClose: () => {}
    };

    render() {
        return (
            <ConfirmDialog
                show={this.props.show}
                onClose={this.props.onClose}
                title={<Message msgId="map.mapDelete" />}
                onConfirm={() => {
                    this.context.router.history.push("/");
                    this.props.onConfirmDelete(this.props.mapId);
                }}
                fitContent
            >
                <div className="ms-detail-body">
                    <Message msgId="resources.deleteConfirmMessage" />
                </div>
            </ConfirmDialog>
        );
    }
}

export default createPlugin('DeleteMap', {
    component:
        connect(createSelector(
            showConfirmDeleteMapModalSelector,
            mapIdSelector,
            (show, mapId) => {
                return { show, mapId };
            }
        ),
        {
            onConfirmDelete: (mapId) => deleteMap(mapId),
            onClose: toggleControl.bind(null, 'mapDelete', false)
        })(DeleteConfirmDialog),
    containers: {
        BurgerMenu: {
            name: 'mapDelete',
            position: 36,
            text: <Message msgId="map.mapDelete"/>,
            icon: <Glyphicon glyph="trash"/>,
            action: toggleControl.bind(null, 'mapDelete', null),
            tooltip: "mapDeleteDialog.mapDeleteTooltip",
            selector: (state) => {
                const { canDelete = false } = state?.map?.present?.info || {};
                return canDelete ? {} : { style: {display: "none"} };
            },
            priority: 2,
            doNotHide: true
        },
        SidebarMenu: {
            name: 'mapDelete',
            position: 36,
            text: <Message msgId="map.mapDelete"/>,
            icon: <Glyphicon glyph="trash"/>,
            action: toggleControl.bind(null, 'mapDelete', null),
            toggle: true,
            tooltip: "manager.deleteMap",
            selector: (state) => {
                const { canDelete = false } = state?.map?.present?.info || {};
                return canDelete ? {} : { style: {display: "none"} };
            },
            priority: 1,
            doNotHide: true
        }
    }
});
