/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

function MapViewsProgressBar({
    progress,
    segments,
    totalLength
}) {
    return (
        <div className="ms-map-view-progress-container">
            <div className="ms-map-view-progress-bar" style={{ width: `${progress}%` }}></div>
            {segments
                ?.map((duration, idx) => (
                    <div
                        key={idx}
                        className="ms-map-view-progress-tick"
                        style={{ left: `${Math.round(duration / totalLength * 100)}%` }}
                    />)
                )}
        </div>
    );
}

export default MapViewsProgressBar;
