/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Spinner from 'react-spinkit';
import ReactQuill from 'react-quill';

import ResizableModal from '../../../misc/ResizableModal';
import Portal from '../../../misc/Portal';
import Message from '../../../I18N/Message';

import 'react-quill/dist/quill.snow.css';

export default ({
    show = false,
    resource = {},
    readOnly = false,
    detailsText,
    modules = {
        toolbar: [
            [{ 'size': ['small', false, 'large', 'huge'] }, 'bold', 'italic', 'underline', 'blockquote'],
            [{ 'list': 'bullet' }, { 'align': [] }],
            [{ 'color': [] }, { 'background': [] }, 'clean'], ['image', 'link']
        ]
    },
    onClose = () => {},
    onSave = () => {},
    onUpdate = () => {}
}) => {
    return (
        <Portal>
            {readOnly ? (
                <ResizableModal size="lg"
                    showFullscreen
                    onClose={() => onClose()}
                    title={<Message msgId="map.details.title" msgParams={{ name: resource.metadata?.name }} />}
                    show
                >
                    <div className="ms-detail-body">
                        {!detailsText ? <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /> : <div className="ql-editor" dangerouslySetInnerHTML={{ __html: detailsText || '' }} />}
                    </div>
                </ResizableModal>
            ) : (<ResizableModal
                show={show}
                title={<Message msgId="map.details.title" msgParams={{ name: resource.metadata?.name }} />}
                bodyClassName="ms-modal-quill-container"
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
                <div id="ms-details-editor">
                    <ReactQuill
                        bounds={"#ms-details-editor"}
                        value={detailsText === 'NODATA' ? '<p></p>' : detailsText}
                        onChange={(details) => {
                            if (details && details !== '<p><br></p>') {
                                onUpdate(details);
                            }
                        }}
                        modules={modules} />
                </div>
            </ResizableModal>)}
        </Portal>
    );
};
