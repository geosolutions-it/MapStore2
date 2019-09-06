/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import BorderLayout from '../layout/BorderLayout';
import Toolbar from '../misc/toolbar/Toolbar';
import MediaSelector from './MediaSelector';
import Message from '../I18N/Message';
/**
 * Full view of the media with selector and preview.
 * TODO: save in the state the local content to provide the correct preview
 * TODO: manage different types
 */
export default ({
    type,
    source,
    resources,
    saveState,
    selectedItem,
    mediaActive = "image",
    selectItem = () => {},
    setAddingMedia = () => {},
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
                        active: mediaActive === "image",
                        bsStyle: mediaActive === "image" ? "success" : "primary"
                    }, {
                        text: <Message msgId= "mediaEditor.videos"/>
                    }]} />
            </div>
        }
        columns={[ //
            <div key="selector" style={{ zIndex: 2, order: -1, width: 300, backgroundColor: '#ffffff' }} >
                <MediaSelector
                    selectedItem={selectedItem}
                    resources={resources}
                    mediaType={type}
                    mediaSource={source}
                    saveMedia={saveMedia}
                    setAddingMedia={setAddingMedia}
                    setEditingMedia={setEditingMedia}
                    selectItem={selectItem}
                    {...saveState}
                     />
            </div>
        ]}>
        <div key="preview" style={{ width: '100%', height: '100%', boxShadow: "inset 0px 0px 30px -5px rgba(0,0,0,0.16)" }}>
            {/* TODO this is just for showing images, this needs to be a new component  */}
            { selectedItem && selectedItem.data && selectedItem.data.src && <img src={selectedItem && selectedItem.data && selectedItem.data.src} style={{objectFit: "contain", width: "100%", height: "100%"}}/> }
        </div>
    </BorderLayout>);
