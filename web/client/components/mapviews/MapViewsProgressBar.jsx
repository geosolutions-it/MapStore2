/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import tooltip from '../misc/enhancers/tooltip';

const MapViewsProgressBarTick = tooltip(({
    left,
    active,
    ...props
}) => {
    return (
        <div
            {...props}
            className={`ms-map-view-progress-tick${active ? ' active' : ''}`}
            style={{ left }}
        />
    );
});

function MapViewsProgressBar({
    play,
    progress,
    segments,
    totalLength,
    onSelect,
    currentIndex
}) {
    return (
        <div className={`ms-map-view-progress-container${play ? ' playing' : ''}`}>
            <div className="ms-map-view-progress-bar" style={{ width: `${progress}%` }}></div>
            {segments
                ?.map(({ duration, view }, idx) => (
                    <MapViewsProgressBarTick
                        key={idx}
                        tooltip={view?.title}
                        active={idx <= currentIndex}
                        tooltipPosition="bottom"
                        left={`${Math.round(duration / totalLength * 100)}%`}
                        onClick={() => onSelect(view)}
                    />)
                )}
        </div>
    );
}

export default MapViewsProgressBar;
