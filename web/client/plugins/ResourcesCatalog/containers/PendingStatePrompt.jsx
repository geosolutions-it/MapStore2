/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Prompt, withRouter } from 'react-router';
import ConfirmDialog from '../../../components/layout/ConfirmDialog';
import { connect } from 'react-redux';
import { push, replace } from 'connected-react-router';

function PendingStatePrompt({
    pendingState: pendingStateProp,
    show,
    onCancel,
    onConfirm,
    titleId,
    descriptionId,
    cancelId,
    confirmId,
    variant,
    history,
    onReplace,
    onPush
}) {
    const pendingState = useRef();
    pendingState.current = pendingStateProp;

    const [confirmed, setConfirmed] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // show alter when a user tries to close the browser
    useEffect(() => {
        function onBeforeUnload(event) {
            if (pendingState.current) {
                (event || window.event).returnValue = null;
            }
        }
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
        };
    }, []);

    // disable the back button when there are pending changes
    useEffect(() => {
        let popState;
        if (pendingStateProp) {
            popState = () => {
                window.history.go(1);
            };
            window.history.pushState(null, null, window.location.href);
            window.addEventListener('popstate', popState);
        }
        return () => {
            if (popState) {
                window.removeEventListener('popstate', popState);
                popState = undefined;
            }
        };
    }, [pendingStateProp]);

    function handleCancel() {
        setShowModal(false);
    }

    function handleConfirm() {
        const pathname = showModal.nextLocationPathname;
        setConfirmed(true);
        setShowModal(false);
        setTimeout(() => {
            onPush(pathname);
        });
    }

    return (
        <>
            <Prompt
                when={!confirmed && !!pendingStateProp}
                message={(nextLocation, actionType) => {
                    if (!confirmed && actionType !== 'REPLACE') {
                        setTimeout(() => onReplace(history?.location?.pathname));
                        setShowModal({
                            nextLocationPathname: nextLocation?.pathname,
                            prevLocationPathname: history?.location?.pathname
                        });
                        return false;
                    }
                    return true;
                }}
            />
            <ConfirmDialog
                show={show || showModal}
                onCancel={show ? onCancel : handleCancel}
                onConfirm={show ? onConfirm : handleConfirm}
                titleId={titleId}
                descriptionId={descriptionId}
                cancelId={cancelId}
                confirmId={confirmId}
                variant={variant}
            />
        </>
    );
}

export default connect(() => ({}), {
    onPush: push,
    onReplace: replace
})(withRouter(PendingStatePrompt));
