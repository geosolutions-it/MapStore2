/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import Select from "react-select";

import BorderLayout from '../layout/BorderLayout';
import Toolbar from '../misc/toolbar/Toolbar';
import MediaSelector from './MediaSelector';
import Message from '../I18N/Message';
import PreviewImage from './image/Preview';
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
    selectItem = () => {},
    setAddingMedia = () => {},
    setMediaType = () => {},
    setMediaService = () => {},
    setEditingMedia = () => {},
    saveMedia = () => {}
}) => (<BorderLayout
        className="ms-mediaEditor"
        header={
            <div style={{ padding: 4, zIndex: 2 }} >
                <Toolbar
                    btnDefaultProps={{ bsSize: 'sm' }}
                    buttons={[{
                        text: <Message msgId= "mediaEditor.images"/>,
                        active: mediaType === "image",
                        bsStyle: mediaType === "image" ? "primary" : "default",
                        onClick: () => {setMediaType("image"); }
                    }, {
                        text: <Message msgId= "mediaEditor.videos"/>,
                        active: mediaType === "video",
                        bsStyle: mediaType === "video" ? "primary" : "default",
                        onClick: () => {setMediaType("video"); }
                    }, {
                        text: <Message msgId= "mediaEditor.maps"/>,
                        active: mediaType === "map",
                        bsStyle: mediaType === "map" ? "primary" : "default",
                        onClick: () => {setMediaType("map"); }
                    }]} />

            <div style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        width: "240px"
                    }}>
                        <strong>Servizi: </strong>
                <Select
                    clearValueText={"pulisci"}
                    noResultsText={"Nessun risultato"}
                    clearable
                    options={services.map(s => ({label: s.name, value: s.id}))} // todo: parametrize with other services
                    value={selectedService}
                    onChange={setMediaService}
                    placeholder={"seleziona un servizio"} />
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
            {mediaType === "image" && <PreviewImage selectedItem={selectedItem} />}
            {mediaType === "video" && null}
            {mediaType === "map" && null}
        </div>
    </BorderLayout>);
