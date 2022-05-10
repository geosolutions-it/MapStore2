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
import { Controls } from '../utils/DashboardUtils';
import { deleteDashboard, setControl } from '../actions/dashboards';
import { getDashboardId, dashboardResource } from '../selectors/dashboard';
import { deleteDialogSelector } from '../selectors/dashboards';
import { isLoggedIn } from '../selectors/security';
import Message from '../components/I18N/Message';

class DeleteConfirmDialog extends React.Component {

    static propTypes = {
        show: PropTypes.bool,
        dashboardId: PropTypes.string,
        onConfirmDelete: PropTypes.func,
        onClose: PropTypes.func
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        show: false,
        dashboardId: '',
        onConfirmDelete: () => {},
        onClose: () => {}
    };

    render() {
        return (
            <ConfirmDialog
                show={this.props.show}
                onClose={this.props.onClose}
                title={<Message msgId="dashboard.delete" />}
                onConfirm={() => {
                    this.context.router.history.push("/");
                    this.props.onClose();
                    this.props.onConfirmDelete(this.props.dashboardId);
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

export default createPlugin('DeleteDashboard', {
    component:
        connect(createSelector(
            deleteDialogSelector,
            getDashboardId,
            (show, dashboardId) => {
                return { show, dashboardId };
            }
        ),
        {
            onConfirmDelete: (dashboardId) => deleteDashboard(dashboardId),
            onClose: setControl.bind(null, Controls.SHOW_DELETE, false)
        })(DeleteConfirmDialog),
    containers: {
        BurgerMenu: {
            name: 'dashboardDelete',
            position: 300,
            text: <Message msgId="dashboard.delete"/>,
            icon: <Glyphicon glyph="trash"/>,
            action: setControl.bind(null, Controls.SHOW_DELETE, true),
            selector: createSelector(
                isLoggedIn,
                dashboardResource,
                (loggedIn, {canEdit, id} = {}) => ({
                    style: loggedIn && (id && canEdit) ? {} : { display: "none" } // save is present only if the resource already exists and you can save
                })
            ),
            priority: 1,
            doNotHide: true
        }
    }
});
