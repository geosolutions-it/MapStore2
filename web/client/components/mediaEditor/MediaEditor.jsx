/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import ReactSelect from "react-select";

import { MediaTypes } from '../../utils/GeoStoryUtils';
import Message from '../I18N/Message';
import BorderLayout from '../layout/BorderLayout';
import localizedProps from '../misc/enhancers/localizedProps';
import Toolbar from '../misc/toolbar/Toolbar';
import ImagePreview from './image/ImagePreview';
import MapPreview from './map/MapPreview';
import MediaSelector from './MediaSelector';
import VideoPreview from './video/VideoPreview';

const Select = localizedProps(["placeholder", "clearValueText", "noResultsText"])(ReactSelect);

// import LocaleUtils from '../../utils/LocaleUtils';

/**
 * Full view of the media with selector and preview.
 * TODO: save in the state the local content to provide the correct preview
 * TODO: manage different types
 */

export default ({
    mediaType = "image",
    source,
    resources,
    saveState,
    selectedItem,
    // messages,
    selectedService = "current",
    services = [{
        name: "Currently used",
        id: "geostory"
    }, {
        name: "Geostore",
        id: "geostore"
    }],
    selectItem = () => { },
    setAddingMedia = () => { },
    setMediaType = () => { },
    setMediaService = () => { },
    setEditingMedia = () => { },
    saveMedia = () => { }
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
                    onClick: () => { setMediaType("image"); }
                }, {
                    text: <Message msgId="mediaEditor.videos" />,
                    active: mediaType === "video",
                    bsStyle: mediaType === "video" ? "primary" : "default",
                    onClick: () => { setMediaType("video"); }
                }, {
                    text: <Message msgId="mediaEditor.maps" />,
                    active: mediaType === "map",
                    bsStyle: mediaType === "map" ? "primary" : "default",
                    onClick: () => { setMediaType("map"); }
                }]} />

            <div style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "240px",
                display: "flex",
                alignItems: "center"
            }}>
                <div className="ms-label-services">
                    <strong><Message msgId="mediaEditor.mediaPicker.services" /></strong>
                </div>
                <Select
                    clearValueText="mediaEditor.mediaPicker.clean"
                    noResultsText="mediaEditor.mediaPicker.noResults"
                    placeholder="mediaEditor.mediaPicker.selectService"
                    clearable
                    options={services.map(s => ({ label: s.name, value: s.id }))}
                    onChange={setMediaService}
                    value={selectedService}
                />
            </div>
        </div>
    }
    columns={[ //
        <div key="selector" style={{ zIndex: 2, order: -1, width: 300, backgroundColor: '#ffffff' }} >
            <MediaSelector
                selectedItem={selectedItem}
                resources={resources}
                mediaType={mediaType}
                mediaSource={source}
                saveMedia={saveMedia}
                services={services}
                selectedService={selectedService}
                setAddingMedia={setAddingMedia}
                setEditingMedia={setEditingMedia}
                setMediaService={setMediaService}
                selectItem={selectItem}
                {...saveState}
            />
        </div>
    ]}>
    <div key="preview" style={{ width: '100%', height: '100%', boxShadow: "inset 0px 0px 30px -5px rgba(0,0,0,0.16)" }}>
        {mediaType === MediaTypes.IMAGE && <ImagePreview selectedItem={selectedItem} mediaType={mediaType} />}
        {mediaType === MediaTypes.VIDEO && <VideoPreview mediaType={mediaType} />}
        {mediaType === MediaTypes.MAP && <MapPreview mediaType={mediaType} />}
    </div>
</BorderLayout>);
