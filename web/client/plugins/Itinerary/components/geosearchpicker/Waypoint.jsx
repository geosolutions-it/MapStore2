
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
import castArray from 'lodash/castArray';
import { Glyphicon } from 'react-bootstrap';

import FlexBox from '../../../../components/layout/FlexBox';
import CoordinatesRow from '../../../../components/misc/coordinateeditors/CoordinatesRow';
import { ButtonWithTooltip } from '../../../../components/misc/Button';
import draggableComponent from '../../../../components/misc/enhancers/draggableComponent';
import SearchAutoComplete from './SearchAutoComplete';

const dragHandle = <div className="drag-handle"><Glyphicon glyph="grab-handle" /></div>;

/**
 * Waypoint component
 **/
const Waypoint = draggableComponent(({
    displayName,
    isDraggable,
    waypoint,
    waypoints,
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
    onUpdateLocations,
    isDragging,
    isOver,
    iconSrc
}) => {
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
        // reset location when toggling coordinates editor
        if (!isEmpty(locations)) {
            const newLocations = [...locations];
            newLocations[index] = null;
            onUpdateLocations(newLocations);
        }
    };

    return (
        <FlexBox
            className={`geosearch-waypoint ${isOver ? 'is-over' : ''}`}
            centerChildrenVertically
            gap="sm"
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            {isDraggable
                ? (
                    <>
                        {connectDragSource ? connectDragSource(dragHandle) : dragHandle}
                        <FlexBox centerChildren className="_relative indicator-circle">
                            {iconSrc ? <img src={iconSrc}/> : null}
                            <div className="waypoint-connector"></div>
                        </FlexBox>
                    </>
                )
                : null
            }
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
                            results={searchResults}
                            displayName={displayName}
                            loading={searchLoading ? castArray(searchLoading)[index] ?? false : false}
                            onSearch={(value) => onSearchByLocationName(value, index)}
                            onChange={(value) => onLocationChange(index, value)}
                            onSelect={(result) => onLocationSelect(index, result)}
                        />
                    }
                </FlexBox>
                <ButtonWithTooltip
                    square
                    className="waypoint-locate"
                    onClick={handleToggleCoordinatesEditor}
                    tooltipId={`itinerary.${showCoordinatesEditor ? 'toggleSearchTooltip' : 'togglePointTooltip'}`}
                >
                    <Glyphicon glyph={showCoordinatesEditor ? "search" : "point"} />
                </ButtonWithTooltip>
                {isDraggable && waypoints.length > 2
                    ? <ButtonWithTooltip
                        variant="default"
                        className="waypoint-delete"
                        onClick={() => onRemoveWaypoint(index)}
                        square
                        tooltipId="itinerary.removeWaypointTooltip"
                    >
                        <Glyphicon glyph="trash" />
                    </ButtonWithTooltip> : null}
            </FlexBox.Fill>
        </FlexBox>
    );
});

Waypoint.defaultProps = {
    isDraggable: true,
    waypoint: {},
    waypoints: [],
    index: 0,
    locations: [],
    searchLoading: [],
    onLocationChange: () => {},
    onLocationSelect: () => {},
    onSearchByLocationName: () => {},
    searchResults: [],
    onRemoveWaypoint: () => {},
    onSelectLocationFromMap: () => {},
    onToggleCoordinateEditor: () => {},
    onUpdateLocations: () => {}
};

export default Waypoint;
