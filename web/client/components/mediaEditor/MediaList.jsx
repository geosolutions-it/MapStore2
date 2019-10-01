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
import Toolbar from '../misc/toolbar/Toolbar';
import MapList from "./map/MapList";
import ImageList from "./image/ImageList";


export default ({
    resources = [],
    selectedItem,
    selectedSource,
    selectedService,
    mediaType,
    onMapChoice = () => {},
    onMapSelected = () => {},
    selectItem = () => { },
    loadItems = () => {},
    setAddingMedia = () => {},
    setEditingMedia = () => {},
    buttons = [
        {
            glyph: 'plus',
            tooltipId: 'mediaEditor.mediaPicker.add',
            visible: mediaType !== MediaTypes.MAP,
            onClick: () => setAddingMedia(true)
        },
        {
            glyph: 'pencil',
            tooltipId: 'mediaEditor.mediaPicker.edit',
            visible: !isNil(selectedItem) && mediaType !== MediaTypes.MAP,
            onClick: () => setEditingMedia(true)
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
</div>);
