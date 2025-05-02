/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState } from 'react';
import { InputGroup, ControlLabel, FormGroup } from 'react-bootstrap';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

import ConfirmDialog from '../components/layout/ConfirmDialog';
import InputControl from './ResourcesCatalog/components/InputControl';
import security from '../reducers/security';
import {
    showModalSelector,
    protectedServiceSelector
} from '../selectors/security';
import {
    setCredentials,
    setShowModalStatus
} from '../actions/security';
import Message from '../components/I18N/Message';

import {createPlugin} from '../utils/PluginsUtils';

/**
 *
 * @memberof plugins
 * @class
 * @name SecurityPopup
 * @prop {function} onSetCredentials used to update credentials for a catalog service
 * @prop {function} onSetShowModal used to update flag to show or not the modal
 * @prop {boolean} showModal flag to show or not the modal
 * @prop {object} service data related to a service
 */
function SecurityPopup({
    showModal,
    service = {},
    onSetCredentials = () => {},
    onSetShowModal = () => {}
}) {
    const [newService, setNewService] = useState(() => service || {});
    function handleCancel() {
        onSetShowModal(false);
        onSetCredentials({
            ...newService,
            isProtected: false
        });
    }

    function handleConfirm() {
        onSetCredentials({
            ...newService,
            isProtected: true
        });
        onSetShowModal(false);
    }

    return (
        <>
            <ConfirmDialog
                show={showModal}
                preventHide
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                // descriptionId={"securityPopup.descriptionId"}
                titleId={`securityPopup.title`}
                // cancelId={`resourcesCatalog.${messagePrefix}Cancel`}
                // confirmId={`resourcesCatalog.${messagePrefix}Confirm`}
                variant="success"
            >
                <FormGroup>
                    <InputGroup>
                        {service.title}
                    </InputGroup>
                    <InputGroup>
                        {service.url}
                    </InputGroup>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="securityPopup.username" />
                    </ControlLabel>
                    <InputControl
                        value={newService.username}
                        debounceTime={300}
                        onChange={(username) => setNewService({...newService, username })}
                        maxLength={255}
                    />
                    <ControlLabel>
                        <Message msgId="securityPopup.pwd" />
                    </ControlLabel>
                    <InputControl
                        value={newService.password}
                        debounceTime={300}
                        onChange={(password) => setNewService({...newService, password })}
                        maxLength={255}
                    />
                </FormGroup>
            </ConfirmDialog>
        </>
    );
}

const ConnectedPlugin = connect(
    createStructuredSelector({
        showModal: showModalSelector,
        service: protectedServiceSelector
    }),
    {
        onSetCredentials: setCredentials,
        onSetShowModal: setShowModalStatus
    }
)(SecurityPopup);

const SecurityPopupPlugin = createPlugin('SecurityPopup', {
    component: ConnectedPlugin,
    containers: {
        MetadataExplorer: {
            target: 'url-addon',
            Component: connect(null,
                {
                    onSetShowModal: setShowModalStatus,
                    onSetCredentials: setCredentials
                }
            )(({onSetCredentials, onSetShowModal, service, itemComponent}) => {
                const Component = itemComponent; // itemComponent is the default component defined in MainForm.jsx
                return (<Component
                    onClick={(value) => {
                        onSetShowModal(true);
                        onSetCredentials(value);
                    }}
                    btnClassName={service.isProtected ? "btn-success" : ""}
                    glyph="1-user-mod"
                    tooltipId="securityPopup.insertCredentials"
                />);
            })
        }
    },
    reducers: {
        security
    }
});

export default SecurityPopupPlugin;
