/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import MapViewItem from './MapViewItem';

function MapViewsList({
    views,
    selectedId,
    onSelect,
    onRemove,
    onMove,
    onMoveEnd,
    options,
    edit
}) {
    return (
        <div className="ms-map-views-list">
            <div className="ms-map-views-list-header">
                {options}
            </div>
            <div className="ms-map-views-list-body">
                <ul>
                    {views.map((view, idx) => (
                        <MapViewItem
                            key={view.id}
                            id={view.id}
                            selected={selectedId === view.id}
                            index={idx}
                            title={view.title}
                            onSelect={() => onSelect(view)}
                            onRemove={edit ? () => onRemove(view) : undefined}
                            isSortable={!!edit}
                            onMove={onMove}
                            onMoveEnd={onMoveEnd}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default MapViewsList;
