
/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useEffect, useRef, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import { Glyphicon } from 'react-bootstrap';

import FlexBox from '../../layout/FlexBox';
import CoordinatesRow from '../../misc/coordinateeditors/CoordinatesRow';
import Button from '../../misc/Button';
import draggableComponent from '../../misc/enhancers/draggableComponent';
import SearchAutoComplete from './SearchAutoComplete';

/**
 * Waypoint component
 **/
const Waypoint = draggableComponent(({
    isDraggable,
    waypoint,
    index,
    locations,
    onLocationChange,
    onLocationSelect,
    onSearchByLocationName,
    searchResults,
    searchLoading,
    connectDragSource,
    onRemoveWaypoint,
    onSelectLocationFromMap,
    onToggleCoordinateEditor,
    isDragging,
    isOver
}) => {
    const dragHandle = <div className="drag-handle"><Glyphicon glyph="grab-handle" /></div>;

    const [showCoordinatesEditor, setShowCoordinatesEditor] = useState(false);
    const [lon, lat] = locations[index] ?? [];
    const coordinate = isNil(lat) || isNil(lon) ? {} : { lat: Number(lat), lon: Number(lon) };

    const prevCoordinate = useRef(coordinate);
    useEffect(() => {
        if (!isEmpty(coordinate) && !isEqual(prevCoordinate.current, coordinate)) {
            prevCoordinate.current = coordinate;
            onToggleCoordinateEditor((prev) => {
                const newState = [...prev];
                newState[index] = false;
                return newState;
            });
        }
    }, [coordinate]);

    const handleToggleCoordinatesEditor = () => {
        const toggleState = !showCoordinatesEditor;
        setShowCoordinatesEditor(toggleState);
        if (toggleState) {
            onSelectLocationFromMap(index);
            onToggleCoordinateEditor((prev) => {
                const newState = [...prev];
                newState[index] = toggleState;
                return newState;
            });
        }
    };

    return (
        <FlexBox
            className="geosearch-waypoint-item"
            centerChildrenVertically
            gap="sm"
            style={{
                opacity: isDragging ? 0.5 : 1,
                backgroundColor: isOver ? '#f0f8ff' : 'transparent',
                border: isOver ? '2px dashed #007cba' : 'none',
                borderRadius: '4px',
                margin: isOver ? '2px' : '0px',
                transition: 'all 0.2s ease'
            }}
        >
            {isDraggable
                ? (
                    <>
                        {connectDragSource ? connectDragSource(dragHandle) : dragHandle}
                        <FlexBox centerChildren className="ms-secondary-colors _relative indicator-circle">
                            {index + 1}
                            <div className="waypoint-connector"></div>
                        </FlexBox>
                    </>
                )
                : null}
            <FlexBox.Fill flexBox>
                <FlexBox style={{flex: 2}}>
                    {showCoordinatesEditor
                        ? <CoordinatesRow
                            format={"decimal"}
                            idx={index}
                            key="coordinate-editor-geosearch"
                            showToolButtons={false}
                            component={coordinate}
                            customClassName="geosearch-coord-editor"
                            isDraggable={false}
                            showDraggable={false}
                            formatVisible={false}
                            showLabels={false}
                            removeVisible={false}
                            onSubmit={onLocationSelect}
                            renderer="annotations"
                        />
                        : <SearchAutoComplete
                            value={waypoint.value}
                            onChange={(value) => onLocationChange(index, value)}
                            onSearch={(value) => onSearchByLocationName(index, value)}
                            results={searchResults}
                            loading={searchLoading?.[index] ?? false}
                            placeholder="Search by location name..."
                            onSelect={(result) => onLocationSelect(index, result)}
                        />
                    }
                </FlexBox>
                <Button
                    square
                    className="waypoint-locate"
                    onClick={handleToggleCoordinatesEditor}
                >
                    <Glyphicon glyph={showCoordinatesEditor ? "search" : "point"} />
                </Button>
                {isDraggable
                    ? <Button
                        variant="default"
                        className="waypoint-delete"
                        onClick={() => onRemoveWaypoint(index)}
                        square
                    >
                        <Glyphicon glyph="trash" />
                    </Button> : null}
            </FlexBox.Fill>
        </FlexBox>
    );
});

Waypoint.defaultProps = {
    isDraggable: true,
    waypoint: {},
    index: 0,
    locations: [],
    searchLoading: [],
    onLocationChange: () => {},
    onLocationSelect: () => {},
    onSearchByLocationName: () => {},
    searchResults: [],
    onRemoveWaypoint: () => {},
    onSelectLocationFromMap: () => {},
    onToggleCoordinateEditor: () => {}
};

export default Waypoint;
