/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useState} from 'react';
import { Button as ButtonRB, InputGroup, ControlLabel, FormGroup } from 'react-bootstrap';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';
import omit from 'lodash/omit';
import uuidv1 from 'uuid/v1';

import ConfirmDialog from '../components/layout/ConfirmDialog';
import InputControl from './ResourcesCatalog/components/InputControl';
import security from '../reducers/security';
import {
    showModalSelector,
    protectedServicesSelector
} from '../selectors/security';

import {
    setCredentialsAction,
    setShowModalStatus,
    setProtectedServices,
    clearSecurity
} from '../actions/security';
import {
    refreshSecurityLayers
} from '../actions/layers';
import * as securityPopups from '../epics/security';
import Message from '../components/I18N/Message';
import tooltip from '../components/misc/enhancers/tooltip';
import {createPlugin} from '../utils/PluginsUtils';

const Button = tooltip(ButtonRB);

/**
 *
 * @memberof plugins
 * @class
 * @name SecurityPopup
 * @prop {function} onSetCredentials used to update credentials for a catalog service
 * @prop {function} onSetShowModal used to update flag to show or not the modal
 * @prop {function} onSetProtectedServices used to update protected services
 * @prop {function} onRefreshLayers used to trigger state update of layers that have been provided credentials
 * @prop {function} onClear used to clean up protection to layers
 * @prop {boolean} showModal flag to show or not the modal
 * @prop {object[]} services data related to services
 */
function SecurityPopup({
    showModal,
    services = [],
    onClear = () => {},
    onRefreshLayers = () => {},
    onSetCredentials = () => {},
    onSetProtectedServices = () => {},
    onSetShowModal = () => {}
}) {
    const [currentFormIndex, setCurrentFormIndex] = useState(0);
    const [creds, setCreds] = useState({});
    const DEBOUNCE_TIME = 300;
    const MAX_LENGTH = 255;
    function handleCancel() {
        const show = currentFormIndex < services.length - 1;
        const nextIndex = show ? currentFormIndex + 1 : 0;
        onSetShowModal(show);
        setCurrentFormIndex(nextIndex);
    }
    function handleClear() {
        const id = services[currentFormIndex]?.protectedId;
        const show = currentFormIndex < services.length - 1;
        const nextIndex = show ? currentFormIndex + 1 : 0;
        const newService = omit(services[currentFormIndex], ["protectedId" ]);
        sessionStorage.removeItem(id);
        setCreds({});
        onSetCredentials(newService, {});
        onSetProtectedServices(services.map((service, index) => {
            return index === currentFormIndex ? newService : service;
        }));
        onSetShowModal(show);
        onClear(id);
        setCurrentFormIndex(nextIndex);
    }

    function handleConfirm() {
        onSetCredentials(
            {
                ...services[currentFormIndex],
                protectedId: services[currentFormIndex]?.protectedId || uuidv1() || null
            },
            creds
        );
        setCreds({});
        if (services.length - 1 === currentFormIndex ) {
            onRefreshLayers();
            setCurrentFormIndex(0);
        } else {
            setCurrentFormIndex(currentFormIndex + 1);
        }
        onSetShowModal(services.length - 1 !== currentFormIndex );
    }

    return (
        <>
            <ConfirmDialog
                show={showModal}
                preventHide
                disabled={!(creds.username && creds.password)}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                titleId={`securityPopup.title`}
                variant="success"
            >
                <FormGroup>
                    <InputGroup>
                        {services[currentFormIndex]?.url}
                    </InputGroup>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>
                        <Message msgId="securityPopup.username" />
                    </ControlLabel>
                    <InputControl
                        autoComplete="new-username"
                        name="serviceUsername"
                        value={creds.username}
                        debounceTime={DEBOUNCE_TIME}
                        onChange={(username) => setCreds({...creds, username})}
                        maxLength={MAX_LENGTH}
                    />
                    <ControlLabel>
                        <Message msgId="securityPopup.pwd" />
                    </ControlLabel>
                    <InputControl
                        autoComplete="new-password"
                        name="servicePassword"
                        type="password"
                        value={creds.password}
                        debounceTime={DEBOUNCE_TIME}
                        onChange={(password) => setCreds({...creds, password })}
                        maxLength={MAX_LENGTH}
                    />
                </FormGroup>
                <FormGroup>
                    <Button onClick={handleClear} tooltipId="securityPopup.remove" >
                        <Message msgId="securityPopup.removeClear" />
                    </Button>
                </FormGroup>

            </ConfirmDialog>
        </>
    );
}

const ConnectedPlugin = connect(
    createStructuredSelector({
        showModal: showModalSelector,
        services: protectedServicesSelector
    }),
    {
        onClear: clearSecurity,
        onSetCredentials: setCredentialsAction,
        onRefreshLayers: refreshSecurityLayers,
        onSetProtectedServices: setProtectedServices,
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
                    onSetCredentials: setCredentialsAction,
                    onSetProtectedServices: setProtectedServices
                }
            )(({onSetCredentials, onSetProtectedServices, onSetShowModal, service, itemComponent}) => {
                // itemComponent is the default component defined in MainForm.jsx
                const Component = itemComponent;
                return (<Component
                    onClick={(value) => {
                        onSetShowModal(true);
                        onSetCredentials(value);
                        onSetProtectedServices([value]);
                    }}
                    btnClassName={service.protectedId ? "btn-success" : ""}
                    glyph="1-user-mod"
                    tooltipId="securityPopup.insertCredentials"
                />  );
            })
        }
    },
    reducers: {
        security
    },
    epics: securityPopups
});

export default SecurityPopupPlugin;
