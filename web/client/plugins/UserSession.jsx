/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect } from "react";
import {connect} from "react-redux";
import {createPlugin} from "../utils/PluginsUtils";
import usersession from "../reducers/usersession";
import {saveUserSessionEpicCreator, autoSaveSessionEpicCreator, loadUserSessionEpicCreator,
    removeUserSessionEpicCreator, stopSaveSessionEpic, reloadOriginalConfigEpic} from "../epics/usersession";
import Message from "../components/I18N/Message";
import {Glyphicon} from "react-bootstrap";
import {toggleControl} from "../actions/controls";
import { removeUserSession, enableAutoSave} from "../actions/usersession";
import ConfirmModal from "../components/resources/modals/ConfirmModal";

const ResetUserSession = connect((state) => ({
    enabled: state?.controls?.resetUserSession?.enabled ?? false
}), {
    setAutoSave: enableAutoSave,
    onClose: toggleControl.bind(null, 'resetUserSession', null),
    onConfirm: removeUserSession
})(({ enabled = false, onClose, onConfirm, setAutoSave = () => {}}) => {
    const confirm = () => {
        onClose();
        onConfirm();
    };
    useEffect(() => {
        setAutoSave(true);
        // Specify how to clean up after this effect:
        return function cleanup() {
            setAutoSave(false);
        };
    }, []);
    return (<ConfirmModal onClose={onClose}
        onConfirm={confirm} show={enabled} buttonSize="large">
        <Message msgId="userSession.confirmRemove"/></ConfirmModal>);
});

const hasSession = (state) => state?.usersession?.session;

const saveUserSessionEpic = saveUserSessionEpicCreator();
const autoSaveSessionEpic = autoSaveSessionEpicCreator();
const loadUserSessionEpic = loadUserSessionEpicCreator();
const removeUserSessionEpic = removeUserSessionEpicCreator();

export default createPlugin('UserSession', {
    component: ResetUserSession,
    containers: {
        BurgerMenu: {
            name: 'UserSession',
            position: 1500,
            text: <Message msgId="userSession.remove" />,
            icon: <Glyphicon glyph="trash" />,
            action: toggleControl.bind(null, 'resetUserSession', null),
            selector: (state) => {
                return { style: hasSession(state) ? {} : {display: "none"} };
            },
            priority: 2,
            doNotHide: true
        }
    },
    reducers: {
        usersession
    },
    epics: {
        saveUserSessionEpic, autoSaveSessionEpic, stopSaveSessionEpic, loadUserSessionEpic, removeUserSessionEpic, reloadOriginalConfigEpic
    }
});
