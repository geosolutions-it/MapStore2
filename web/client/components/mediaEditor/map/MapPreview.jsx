/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";

import { MediaTypes, defaultLayerMapPreview } from '../../../utils/GeoStoryUtils';
import emptyState from '../../misc/enhancers/emptyState';
import PreviewMap from '../../widgets/builder/wizard/map/PreviewMap';
import { isEmpty } from 'lodash';

const Preview = ({
    selectedItem
}) => {
    return (
        <PreviewMap
            styleMap={{height: "100%"}}
            center={selectedItem.center}
            zoom={selectedItem.zoom}
            id={"preview" + selectedItem.id}
            layers={ selectedItem.layers || [defaultLayerMapPreview]}
        />
    );
};


export default emptyState(
    ( {mediaType, selectedItem}) => mediaType === MediaTypes.MAP && (!selectedItem || isEmpty(selectedItem)),
    {
        iconFit: true,
        glyph: "1-map"
    }
)(Preview);
