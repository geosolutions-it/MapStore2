/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";

import { MediaTypes } from '../../../utils/GeoStoryUtils';
import emptyState from '../../misc/enhancers/emptyState';

const Preview = ({
    selectedItem
}) => {
    const src = selectedItem && selectedItem.data && selectedItem.data.src;
    return (
        <div key="preview" style = {{ width: '100%', height: '100%', boxShadow: "inset 0px 0px 30px -5px rgba(0,0,0,0.16)" }}>
            {
                src && <video src={src}/>
            }
        </div>
    );
};

export default emptyState(
    ({mediaType, selectedItem}) => mediaType === MediaTypes.VIDEO && !selectedItem,
    {
        style: { width: '100%', height: '100%', boxShadow: "inset 0px 0px 30px -5px rgba(0,0,0,0.16)" },
        iconFit: true,
        glyph: "playback",
        imageStyle: {display: "flex", flexDirection: "column", justifyContent: "center"}
    }
)(Preview);
