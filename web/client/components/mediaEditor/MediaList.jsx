/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from "react";
import {isNil} from 'lodash';

import { MediaTypes } from '../../utils/GeoStoryUtils';
import { SourceTypes } from '../../utils/MediaEditorUtils';
import Toolbar from '../misc/toolbar/Toolbar';
import MapList from './map/MapList';
import ImageList from './image/ImageList';
import withMapEditing from  './enhancers/withMapEditing';

export default withMapEditing(({
    resources = [],
    selectedItem,
    selectedSource = {},
    selectedService,
    mediaType,
    onMapChoice = () => {},
    onMapSelected = () => {},
    selectItem = () => { },
    loadItems = () => {},
    setAddingMedia = () => {},
    setEditingMedia = () => {},
    editRemoteMap = () => {},
    buttons = [
        {
            glyph: 'plus',
            tooltipId: 'mediaEditor.mediaPicker.add',
            visible: selectedSource.type === SourceTypes.GEOSTORY,
            onClick: () => setAddingMedia(true)
        },
        {
            glyph: 'pencil',
            tooltipId: 'mediaEditor.mediaPicker.edit',
            visible: selectedSource.type === SourceTypes.GEOSTORY && !isNil(selectedItem),
            onClick: () => setEditingMedia(true)
        },
        {
            glyph: 'pencil',
            tooltipId: 'mediaEditor.mediaPicker.edit',
            visible: selectedSource.type === SourceTypes.GEOSTORE && mediaType === MediaTypes.MAP && !isNil(selectedItem),
            onClick: editRemoteMap
        }

    ]
}) => (
    <div style={{position: 'relative'}} className="ms-mediaList">
        {
        // when no buttons visible, do not render toolbar components
            buttons.filter(b => !isNil(b.visible) ? b.visible : true).length > 0 &&
        <div
            className="ms-media-toolbar"
            key="toolbar">
            <Toolbar
                btnDefaultProps={{
                    bsStyle: 'primary',
                    className: 'square-button-md'
                }}
                buttons={buttons} />
        </div>
        }
        {
            mediaType === MediaTypes.MAP &&
            <MapList
                selectedItem={selectedItem}
                loadItems={loadItems}
                resources={resources}
                mediaType={mediaType}
                onMapChoice={onMapChoice}
                onMapSelected={onMapSelected}
                selectItem={selectItem}
                selectedSource={selectedSource}
                selectedService={selectedService}
            />
        }
        { mediaType === MediaTypes.IMAGE &&
            <ImageList
                selectedItem={selectedItem}
                resources={resources}
                onMapChoice={onMapChoice}
                selectItem={selectItem}
                selectedSource={selectedSource}
            />
        }
    </div>));
