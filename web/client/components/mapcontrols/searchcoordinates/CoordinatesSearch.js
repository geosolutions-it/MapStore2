/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {isNumber} from "lodash";
import {FormGroup, Glyphicon, InputGroup, MenuItem, Row} from "react-bootstrap";

import Message from "../../I18N/Message";
import CoordinateEntry from "../../misc/coordinateeditors/CoordinateEntry";
import DropdownToolbarOptions from "../../misc/toolbar/DropdownToolbarOptions";
const { zoomAndAddPoint, changeCoord} = require("../../../actions/search");

/**
 * CoordinateOptions for Search bar
 * @memberof CoordinatesSearch
 *
 */
export const CoordinateOptions = ({
    clearCoordinates: (onClearCoordinatesSearch, onChangeCoord) =>{
        onClearCoordinatesSearch({owner: "search"});
        onChangeCoord("lat", "");
        onChangeCoord("lon", "");
    },
    areValidCoordinates: (coordinate) => isNumber(coordinate?.lon) && isNumber(coordinate?.lat),
    zoomToPoint: (onZoomToPoint, coordinate, defaultZoomLevel = 12) => {
        onZoomToPoint({
            x: parseFloat(coordinate.lon),
            y: parseFloat(coordinate.lat)
        }, defaultZoomLevel, "EPSG:4326");
    },
    coordinateFormatChange: (format, onChangeFormat, showOptions, activeTool) => ({
        buttonConfig: {
            title: <Glyphicon glyph="cog"/>,
            tooltipId: "search.changeSearchInputField",
            tooltipPosition: "bottom",
            className: "square-button-md no-border",
            pullRight: true
        },
        menuOptions: [
            {
                active: format === "decimal",
                onClick: () => onChangeFormat("decimal"),
                text: <Message msgId="search.decimal"/>
            }, {
                active: format === "aeronautical",
                onClick: () => onChangeFormat("aeronautical"),
                text: <Message msgId="search.aeronautical"/>
            }
        ],
        visible: showOptions && activeTool === "coordinatesSearch",
        Element: DropdownToolbarOptions
    }),
    removeIcon: (
        activeTool,
        coordinate,
        onClearCoordinatesSearch,
        onChangeCoord) =>({
        visible: activeTool === "coordinatesSearch" && (isNumber(coordinate.lon) || isNumber(coordinate.lat)),
        onClick: () => CoordinateOptions.clearCoordinates(onClearCoordinatesSearch, onChangeCoord)
    }),
    searchIcon: (activeTool, coordinate, onZoomToPoint, defaultZoomLevel) => ({
        visible: activeTool === "coordinatesSearch",
        onClick: () => {
            if (activeTool === "coordinatesSearch" && CoordinateOptions.areValidCoordinates(coordinate)) {
                CoordinateOptions.zoomToPoint(onZoomToPoint, coordinate, defaultZoomLevel);
            }
        }
    }),
    coordinatesMenuItem: ({activeTool, searchText, clearSearch, onChangeActiveSearchTool, onClearBookmarkSearch}) =>(
        <MenuItem active={activeTool === "coordinatesSearch"} onClick={() => {
            if (searchText !== undefined && searchText !== "") {
                clearSearch();
            }
            onClearBookmarkSearch("selected");
            onChangeActiveSearchTool("coordinatesSearch");
            document.dispatchEvent(new MouseEvent('click'));
        }}>
            <Glyphicon glyph={"search-coords"}/> <Message msgId="search.coordinatesSearch"/>
        </MenuItem>
    )
});


/**
 * CoordinatesSearch component
 * @param {object} props Component props
 * @param {object} props.coordinate coordinate position in lat lon
 * @param {string} props.format current format to display the coordinates
 * @param {func} props.onClearCoordinatesSearch on click clear coordinates
 * @param {func} props.onZoomToPoint on click zoom to extent
 * @param {number} props.defaultZoomLevel default zoom level on zoom to extent
 * @param {func} props.onChangeCoord triggered on changing coordinate position
 *
 */

const CoordinatesSearch = ({
    coordinate = {},
    format,
    onClearCoordinatesSearch,
    onZoomToPoint,
    onChangeCoord,
    defaultZoomLevel,
    aeronauticalOptions = {
        seconds: {
            decimals: 4,
            step: 0.0001
        }
    },
    constraintsCoordEditor = {
        decimal: {
            lat: {
                min: -90,
                max: 90
            },
            lon: {
                min: -180,
                max: 180
            }
        }
    }}) => {

    const {zoomToPoint, areValidCoordinates} = CoordinateOptions;

    const changeCoordinates = (coord, value) => {
        let val = isNaN(parseFloat(value)) ? "" : parseFloat(value);

        onChangeCoord(coord, val);
        if (!areValidCoordinates()) {
            onClearCoordinatesSearch({owner: "search"});
        }
    };

    const onZoom = () => {
        zoomToPoint(onZoomToPoint, coordinate, defaultZoomLevel);
    };

    return (
        <div className="coordinateEditor" style={{flexWrap: format === "decimal" ? "nowrap" : "wrap" }}>
            <Row className={`entryRow ${format}`}>
                <FormGroup>
                    <InputGroup >
                        <InputGroup.Addon style={{minWidth: 45}}><Message msgId="search.latitude"/></InputGroup.Addon>
                        <CoordinateEntry
                            format={format}
                            aeronauticalOptions={aeronauticalOptions}
                            coordinate="lat"
                            idx={1}
                            value={coordinate.lat}
                            constraints={constraintsCoordEditor}
                            onChange={(dd) => changeCoordinates("lat", dd)}
                            onKeyDown={() => {
                                if (areValidCoordinates(coordinate)) {
                                    onZoom();
                                }
                            }}
                        />
                    </InputGroup>
                </FormGroup>
            </Row>
            <Row className={`entryRow ${format}`}>
                <FormGroup>
                    <InputGroup>
                        <InputGroup.Addon style={{minWidth: 45}}><Message msgId="search.longitude"/></InputGroup.Addon>
                        <CoordinateEntry
                            format={format}
                            aeronauticalOptions={aeronauticalOptions}
                            coordinate="lon"
                            idx={2}
                            value={coordinate.lon}
                            constraints={constraintsCoordEditor}
                            onChange={(dd) => changeCoordinates("lon", dd)}
                            onKeyDown={() => {
                                if (areValidCoordinates(coordinate)) {
                                    onZoom();
                                }
                            }}
                        />
                    </InputGroup>
                </FormGroup>
            </Row>
        </div>
    );
};

CoordinatesSearch.propTypes = {
    coordinate: PropTypes.object,
    format: PropTypes.string,
    onClearCoordinatesSearch: PropTypes.func,
    onZoomToPoint: PropTypes.func,
    onChangeCoord: PropTypes.func,
    defaultZoomLevel: PropTypes.number
};

export default connect((state)=>{
    return {
        coordinate: state.search.coordinate || {}
    };
}, {
    onZoomToPoint: zoomAndAddPoint,
    onChangeCoord: changeCoord
})(CoordinatesSearch);
