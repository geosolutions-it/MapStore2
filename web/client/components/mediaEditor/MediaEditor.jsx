/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactSelect from "react-select";

import Message from '../I18N/Message';
import BorderLayout from '../layout/BorderLayout';
import localizedProps from '../misc/enhancers/localizedProps';
import Toolbar from '../misc/toolbar/Toolbar';
import MediaPreview from './MediaPreview';
import includes from 'lodash/includes';
const Select = localizedProps(["placeholder", "clearValueText", "noResultsText"])(ReactSelect);

/**
 * Full view of the media with selector and preview.
 * TODO: save in the state the local content to provide the correct preview
 * TODO: manage different types
 */

export default ({
    mediaType = "image",
    saveState,
    selectedItem,
    selectedService,
    services = [{
        name: "Currently used",
        id: "geostory"
    }, {
        name: "Geostore",
        id: "geostore"
    }],
    setMediaType = () => { },
    setMediaService = () => { },
    mediaSelector,
    disabledMediaType
}) => (<BorderLayout
    className="ms-mediaEditor"
    header={
        <div className="ms-border-layout-header" style={{ padding: 4, zIndex: 2 }} >
            <Toolbar
                btnDefaultProps={{ bsSize: 'sm' }}
                buttons={[{
                    text: <Message msgId="mediaEditor.images" />,
                    active: mediaType === "image",
                    bsStyle: mediaType === "image" ? "primary" : "default",
                    onClick: () => { setMediaType("image"); },
                    disabled: (saveState && saveState.addingMedia) || includes(disabledMediaType, "image")
                }, {
                    text: <Message msgId="mediaEditor.videos" />,
                    active: mediaType === "video",
                    bsStyle: mediaType === "video" ? "primary" : "default",
                    onClick: () => { setMediaType("video"); },
                    disabled: (saveState && saveState.addingMedia) || includes(disabledMediaType, "video")
                }, {
                    text: <Message msgId="mediaEditor.maps" />,
                    active: mediaType === "map",
                    bsStyle: mediaType === "map" ? "primary" : "default",
                    onClick: () => { setMediaType("map"); },
                    disabled: (saveState && saveState.addingMedia) || includes(disabledMediaType, "map")
                }]} />
            <div className="ms-mediaEditor-services">
                <div className="ms-mediaEditor-label">
                    <strong><Message msgId="mediaEditor.mediaPicker.services" /></strong>
                </div>
                <Select
                    disabled={saveState && saveState.addingMedia}
                    noResultsText="mediaEditor.mediaPicker.noResults"
                    placeholder="mediaEditor.mediaPicker.selectService"
                    options={services.map(s => ({ label: <Message msgId={s.name} />, value: s.id }))}
                    onChange={setMediaService}
                    value={selectedService}
                    clearable={false}
                />
            </div>
        </div>
    }
    columns={[
        <div key="selector" className="ms-mediaSelector">
            {mediaSelector}
        </div>
    ]}>

    <MediaPreview
        selectedItem={selectedItem}
        mediaType={mediaType}
    />
</BorderLayout>);
