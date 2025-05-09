/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useState} from 'react';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import uuidv1 from 'uuid/v1';
import { getCredentials } from '../utils/SecurityUtils';

import security from '../reducers/security';
import {
    showModalSelector,
    protectedServicesSelector
} from '../selectors/security';

import {
    setCredentialsAction,
    setShowModalStatus,
    setProtectedServices,
    clearSecurity,
    refreshSecurityLayers
} from '../actions/security';
import * as securityPopups from '../epics/security';
import {createPlugin} from '../utils/PluginsUtils';
import SecurityPopupDialog from '../components/security/SecurityPopupDialog';

/**
 *
 * @memberof plugins
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
    const DEBOUNCE_TIME = 300;
    const MAX_LENGTH = 255;

    const [currentFormIndex, setCurrentFormIndex] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    const id = services[currentFormIndex]?.protectedId;
    const show = currentFormIndex + 1 < services.length;

    function handleCancel() {
        const nextIndex = show ? currentFormIndex + 1 : 0;
        onSetShowModal(show);
        setCurrentFormIndex(nextIndex);
    }
    function handleClear() {
        const nextIndex = show ? currentFormIndex + 1 : 0;
        const newService = omit(services[currentFormIndex], ["protectedId" ]);
        sessionStorage.removeItem(id);
        onSetCredentials(newService, {});
        onSetProtectedServices(services.map((service, index) => {
            return index === currentFormIndex ? newService : service;
        }));
        onSetShowModal(show);
        onClear(id);
        setCurrentFormIndex(nextIndex);
    }

    function handleConfirm(creds) {
        onSetCredentials(
            {
                ...services[currentFormIndex],
                protectedId: services[currentFormIndex]?.protectedId || uuidv1() || null
            },
            creds
        );
        if (services.length - 1 === currentFormIndex ) {
            onRefreshLayers();
            setCurrentFormIndex(0);
        } else {
            setCurrentFormIndex(currentFormIndex + 1);
        }
        onSetShowModal(show);
    }


    return showModal ? (
        <>
            <SecurityPopupDialog
                key={`${id}-${currentFormIndex}`}
                show={showModal}
                showClose
                preventHide
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                onClear={handleClear}
                titleId={`securityPopup.title`}
                variant="success"
                service={services[currentFormIndex]}
                debounceTime={DEBOUNCE_TIME}
                maxLength={MAX_LENGTH}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />
        </>
    ) : null;
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
                const isProtectedAndStorageIsPresent = !isEmpty(getCredentials(service?.protectedId));
                return (<Component
                    onClick={(value) => {
                        onSetShowModal(true);
                        onSetCredentials(value);
                        onSetProtectedServices([value]);
                    }}
                    btnClassName={isProtectedAndStorageIsPresent ? "btn-success" : ""}
                    glyph="1-user-mod"
                    tooltipId={isProtectedAndStorageIsPresent ? "securityPopup.updateCredentials" : "securityPopup.insertCredentials"}
                />  );
            })
        },
        DashboardEditor: {
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
                const isProtectedAndStorageIsPresent = !isEmpty(getCredentials(service?.protectedId));
                return (<Component
                    onClick={(value) => {
                        onSetShowModal(true);
                        onSetCredentials(value);
                        onSetProtectedServices([value]);
                    }}
                    btnClassName={isProtectedAndStorageIsPresent ? "btn-success" : ""}
                    glyph="1-user-mod"
                    tooltipId={ isProtectedAndStorageIsPresent ? "securityPopup.updateCredentials" : "securityPopup.insertCredentials" }
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
