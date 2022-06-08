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
import { setControl } from '../actions/geostory';
import ConfirmDialog from '../components/misc/ConfirmDialog';
import { createPlugin } from '../utils/PluginsUtils';
import { Controls } from '../utils/GeoStoryUtils';
import { deleteGeostory } from '../actions/geostories';
import { geostoryIdSelector, deleteDialogSelector, resourceSelector } from '../selectors/geostory';
import { isLoggedIn } from '../selectors/security';
import Message from '../components/I18N/Message';

class DeleteConfirmDialog extends React.Component {

    static propTypes = {
        show: PropTypes.bool,
        geostoryId: PropTypes.string,
        onConfirmDelete: PropTypes.func,
        onClose: PropTypes.func
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        show: false,
        geostoryId: '',
        onConfirmDelete: () => {},
        onClose: () => {}
    };

    render() {
        return (
            <ConfirmDialog
                show={this.props.show}
                onClose={this.props.onClose}
                title={<Message msgId="geostory.delete" />}
                onConfirm={() => {
                    this.context.router.history.push("/");
                    this.props.onClose();
                    this.props.onConfirmDelete(this.props.geostoryId);
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

export default createPlugin('DeleteGeoStory', {
    component:
        connect(createSelector(
            deleteDialogSelector,
            geostoryIdSelector,
            (show, geostoryId) => {
                return { show, geostoryId };
            }
        ),
        {
            onConfirmDelete: (geostoryId) => deleteGeostory(geostoryId),
            onClose: setControl.bind(null, Controls.SHOW_DELETE, false)
        })(DeleteConfirmDialog),
    containers: {
        BurgerMenu: {
            name: 'geostoryDelete',
            position: 5,
            text: <Message msgId="geostory.delete"/>,
            icon: <Glyphicon glyph="trash"/>,
            action: setControl.bind(null, Controls.SHOW_DELETE, true),
            selector: createSelector(
                isLoggedIn,
                resourceSelector,
                (loggedIn, {canEdit, id} = {}) => ({
                    style: loggedIn && (id && canEdit) ? {} : { display: "none" } // save is present only if the resource already exists and you can save
                })
            ),
            priority: 1,
            doNotHide: true
        }
    }
});
