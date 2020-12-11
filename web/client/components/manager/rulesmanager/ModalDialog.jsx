/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import Message from '../../I18N/Message';
import Portal from '../../misc/Portal';
import ResizableModal from '../../misc/ResizableModal';

export default ({title = "", showDialog = false, buttons = [], closeAction = () => {}, msg = "Missing message"}) => {
    return (
        <Portal>
            <ResizableModal
                title={<Message msgId={title}/>}
                size="xs"
                show={showDialog}
                onClose={closeAction}
                buttons={buttons}>
                <div className="ms-alert">
                    <div className="ms-alert-center rm-alert-padded">
                        <Message msgId={msg}/>
                    </div>
                </div>
            </ResizableModal>
        </Portal>
    );
};
