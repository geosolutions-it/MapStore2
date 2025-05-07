/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useState, useEffect} from 'react';
import { Glyphicon, Button as ButtonRB, InputGroup, ControlLabel, FormGroup } from 'react-bootstrap';
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';
import omit from 'lodash/omit';
import uuidv1 from 'uuid/v1';

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
    clearSecurity,
    refreshSecurityLayers
} from '../actions/security';
import * as securityPopups from '../epics/security';
import Message from '../components/I18N/Message';
import tooltip from '../components/misc/enhancers/tooltip';
import {createPlugin} from '../utils/PluginsUtils';
import SecurityPopupDialog from '../components/security/SecurityPopupDialog';
import FlexBox from '../components/layout/FlexBox';
import { getCredentials } from '../utils/SecurityUtils';

const Button = tooltip(ButtonRB);

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
    const [creds, setCreds] = useState({});

    useEffect(() => {
        const credentials = getCredentials(id);
        setCreds(credentials);
    }, [id, currentFormIndex]);
    useEffect(() => {
        const credentials = getCredentials(id);
        setCreds(credentials);
        return () => {
            setCreds({});
        };
    }, []);
    function handleCancel() {
        const nextIndex = show ? currentFormIndex + 1 : 0;
        onSetShowModal(show);
        setCurrentFormIndex(nextIndex);
    }
    function handleClear() {
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
        onSetShowModal(show);
    }


    return showModal ? (
        <>
            <SecurityPopupDialog
                show={showModal}
                showClose
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
                <FlexBox inline>
                    <FormGroup style={{
                        flex: 1,
                        padding: "0px 5px 0px 0px"
                    }}>
                        <ControlLabel>
                            <Message msgId="securityPopup.username" />
                        </ControlLabel>
                        <InputControl
                            name={`username_${uuidv1()}`}
                            value={creds.username}
                            debounceTime={DEBOUNCE_TIME}
                            onChange={(username) => setCreds({...creds, username})}
                            maxLength={MAX_LENGTH}
                        />
                    </FormGroup>
                    <FormGroup style={{
                        flex: 1,
                        padding: "0px 5px 0px 0px"
                    }}>
                        <ControlLabel>
                            <Message msgId="securityPopup.pwd" />
                        </ControlLabel>
                        <InputGroup style={{width: "100%"}}>
                            <InputControl
                                name={`password_${uuidv1()}`}
                                autoComplete="new-password"
                                type={showPassword ? "text" : "password"}
                                value={creds.password}
                                debounceTime={DEBOUNCE_TIME}
                                onChange={(password) => setCreds({...creds, password })}
                                maxLength={MAX_LENGTH}
                            />
                            <InputGroup.Addon>
                                <Button
                                    tooltipId={showPassword ? "securityPopup.hide" : "securityPopup.show" }
                                    onClick={() => {setShowPassword(!showPassword);}}>
                                    <Glyphicon glyph={!showPassword ? "eye-open" : "eye-close"}/>
                                </Button>
                            </InputGroup.Addon>
                        </InputGroup>
                    </FormGroup>
                    <FormGroup style={{alignContent: "flex-end"}}>
                        <Button onClick={handleClear} tooltipId="securityPopup.remove" >
                            <Glyphicon glyph="trash"/>
                        </Button>
                    </FormGroup>
                </FlexBox>
            </SecurityPopupDialog>
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
