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
/**
 * @deprecated
 */
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
    const viewer = (<DetailsViewer
        className="ms-details-preview-container"
        textContainerClassName="ms-details-preview"
        loading={loading}
        detailsText={detailsText}/>);
    return (
        <Portal>
            {readOnly ? (
                <ResizableModal
                    size="lg"
                    bodyClassName="details-viewer-modal"
                    showFullscreen
                    fitContent
                    onClose={() => onClose()}
                    title={<Message msgId="map.details.title" msgParams={{ name: title }} />}
                    show={show}
                >
                    {viewer}
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
