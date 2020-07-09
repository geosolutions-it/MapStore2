/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";

import { MediaTypes, Modes } from '../../../utils/GeoStoryUtils';
import emptyState from '../../misc/enhancers/emptyState';
import Video from '../../geostory/media/Video';

const Preview = ({
    selectedItem
}) => {
    const src = selectedItem?.data?.src;
    const thumbnail = selectedItem?.data?.thumbnail;
    return (
        <div
            key="preview"
            className="ms-video-preview"
            style = {{ width: '100%', height: '100%', boxShadow: "inset 0px 0px 30px -5px rgba(0,0,0,0.16)" }}>
            {src &&
                <Video
                    key={src}
                    thumbnail={thumbnail}
                    fit="contain"
                    src={src}
                    inView
                    mode={Modes.VIEW}
                />}
        </div>
    );
};

export default emptyState(
    ({mediaType, selectedItem}) => mediaType === MediaTypes.VIDEO && !selectedItem,
    {
        style: { width: '100%', height: '100%', boxShadow: "inset 0px 0px 30px -5px rgba(0,0,0,0.16)" },
        iconFit: true,
        glyph: "play",
        imageStyle: {display: "flex", flexDirection: "column", justifyContent: "center"}
    }
)(Preview);
