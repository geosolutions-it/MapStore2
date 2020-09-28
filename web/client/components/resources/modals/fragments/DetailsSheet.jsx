/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import ResizableModal from '../../../misc/ResizableModal';
import Portal from '../../../misc/Portal';
import Message from '../../../I18N/Message';

import DetailsViewer from './DetailsViewer';

export default ({
    children,
    loading = false,
    show = false,
    readOnly = false,
    title,
    detailsText,
    bodyClassName,
    onClose = () => {},
    onSave = () => {}
}) => {
    return (
        <Portal>
            {readOnly ? (
                <ResizableModal size="lg"
                    showFullscreen
                    onClose={() => onClose()}
                    title={<Message msgId="map.details.title" msgParams={{ name: title }} />}
                    show={show}
                >
                    <DetailsViewer className="ms-detail-body" textContainerClassName="ql-editor" loading={loading} detailsText={detailsText}/>
                </ResizableModal>
            ) : (<ResizableModal
                show={show}
                title={<Message msgId="map.details.title" msgParams={{ name: title }} />}
                bodyClassName={bodyClassName}
                size="lg"
                clickOutEnabled={false}
                showFullscreen
                fullscreenType="full"
                onClose={() => onClose()}
                buttons={[{
                    text: <Message msgId="map.details.back" />,
                    onClick: () => onClose()
                }, {
                    text: <Message msgId="map.details.save" />,
                    onClick: () => onSave(detailsText)
                }]}>
                {children}
            </ResizableModal>)}
        </Portal>
    );
};
