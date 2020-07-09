/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { InputGroup, FormGroup, Glyphicon, Row } from 'react-bootstrap';
import { isNumber, isEmpty, some, isUndefined } from 'lodash';

import CoordinateEntry from '../../misc/coordinateeditors/CoordinateEntry';
import Message from '../../I18N/Message';
import DropdownToolbarOptions from '../../misc/toolbar/DropdownToolbarOptions';

import SearchBarBase from '../../search/SearchBarBase';
import SearchBarInput from '../../search/SearchBarInput';
import SearchBarToolbar from '../../search/SearchBarToolbar';

import { defaultSearchWrapper } from '../../search/SearchBarUtils';
import BookmarkSelect from "../searchbookmarkconfig/BookmarkSelect";

export default ({
    activeSearchTool: activeTool = 'addressSearch',
    removeIcon = '1-close',
    searchIcon = 'search',
    isSearchClickable = true,
    splitTools,
    searchText = '',
    maxResults = 15,
    searchOptions,
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
    },
    loading,
    delay,
    blurResetDelay,
    typeAhead,
    coordinate = {},
    selectedItems = [],
    defaultZoomLevel = 12,
    enabledSearchServicesConfig = false,
    enabledSearchBookmarkConfig = false,
    error,
    format = 'decimal',
    placeholder,
    placeholderMsgId = "search.addressSearch",
    showOptions = true,
    showAddressSearchOption = true,
    showCoordinatesSearchOption = true,
    showBookMarkSearchOption = true,
    onSearch,
    onSearchReset,
    onSearchTextChange,
    onCancelSelectedItem,
    onChangeCoord = () => {},
    onChangeActiveSearchTool = () => {},
    onClearCoordinatesSearch = () => {},
    onChangeFormat = () => {},
    onToggleControl = () => {},
    onZoomToPoint = () => {},
    onPurgeResults,
    items = [],
    ...props
}) => {
    const search = defaultSearchWrapper({searchText, selectedItems, searchOptions, maxResults, onSearch, onSearchReset});

    const clearSearch = () => {
        onSearchReset();
    };

    const clearCoordinates = () => {
        onClearCoordinatesSearch({owner: "search"});
        onChangeCoord("lat", "");
        onChangeCoord("lon", "");
    };

    const zoomToPoint = () => {
        onZoomToPoint({
            x: parseFloat(coordinate.lon),
            y: parseFloat(coordinate.lat)
        }, defaultZoomLevel, "EPSG:4326");
    };

    const searchByBookmark = () => {
        const {bookmarkConfig, onLayerVisibilityLoad, mapInitial, onZoomToExtent} = props;
        const {options: bbox = {}, layerVisibilityReload = false} = bookmarkConfig && bookmarkConfig.selected;
        if (layerVisibilityReload) {
            onLayerVisibilityLoad({
                ...mapInitial,
                map: {
                    ...mapInitial.map,
                    bookmark_search_config: bookmarkConfig && bookmarkConfig.bookmarkSearchConfig
                }
            }, null, [bbox.west, bbox.south, bbox.east, bbox.north]);
        } else if (bbox && !isEmpty(bbox)) {
            onZoomToExtent([bbox.west, bbox.south, bbox.east, bbox.north], "EPSG:4326");
        }
    };

    const areValidCoordinates = () => isNumber(coordinate.lon) && isNumber(coordinate.lat);

    const changeCoord = (coord, value) => {
        let val = isNaN(parseFloat(value)) ? "" : parseFloat(value);

        onChangeCoord(coord, val);
        if (!areValidCoordinates()) {
            onClearCoordinatesSearch({owner: "search"});
        }
    };

    const getError = (e) => {
        if (e) {
            return (<Message msgId={e.msgId || "search.generic_error"} msgParams={{message: e.message, serviceType: e.serviceType}}/>);
        }
        return null;
    };

    let searchMenuOptions = [];
    if (showAddressSearchOption) {
        searchMenuOptions.push({
            active: activeTool === "addressSearch",
            onClick: () => {
                onClearCoordinatesSearch({owner: "search"});
                onChangeActiveSearchTool("addressSearch");
            },
            glyph: searchIcon,
            text: <Message msgId="search.addressSearch"/>
        });
    }
    if (showCoordinatesSearchOption) {
        searchMenuOptions.push({
            active: activeTool === "coordinatesSearch",
            onClick: () => {
                if (searchText !== undefined && searchText !== "") {
                    clearSearch();
                }
                onChangeActiveSearchTool("coordinatesSearch");
            },
            glyph: "search-coords",
            text: <Message msgId="search.coordinatesSearch"/>
        });
    }

    let searchByBookmarkConfig;
    // Search by bookmark option
    if (showBookMarkSearchOption && !isEmpty(items)) {
        const [item] = items;
        if (some(items, "menuItem")) {
            searchMenuOptions.push(
                item.menuItem(onChangeActiveSearchTool, activeTool)
            );
        }
        if (some(items, "bookmarkConfig")) {
            searchByBookmarkConfig = item.bookmarkConfig(onToggleControl, enabledSearchBookmarkConfig, activeTool);
        }
    }

    const searchConfig = {
        onClick: () => {
            if (!enabledSearchServicesConfig) {
                onToggleControl("searchservicesconfig");
            }
        },
        glyph: "cog",
        className: "square-button-md no-border ",
        tooltip: <Message msgId="search.searchservicesbutton"/>,
        tooltipPosition: "bottom",
        bsStyle: "default",
        pullRight: true,
        visible: showOptions && activeTool === "addressSearch"
    };

    const coordinateFormatChange = {
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
    };

    return (<SearchBarBase>
        <FormGroup>
            <div className="input-group" style={{display: "flex"}}>
                {selectedItems && selectedItems.map((item, index) =>
                    <span key={"selected-item" + index} className="input-group-addon"><div className="selectedItem-text">{item.text}</div></span>
                )}
                <SearchBarInput
                    show={activeTool === 'addressSearch'}
                    delay={delay}
                    typeAhead={typeAhead}
                    blurResetDelay={blurResetDelay}
                    placeholder={placeholder}
                    placeholderMsgId={placeholderMsgId}
                    searchText={searchText}
                    selectedItems={selectedItems}
                    onSearch={search}
                    onSearchTextChange={onSearchTextChange}
                    onCancelSelectedItem={onCancelSelectedItem}
                    onPurgeResults={onPurgeResults}/>
                {activeTool === "coordinatesSearch" && showCoordinatesSearchOption &&
                    <div className="coordinateEditor" style={{flexWrap: format === "decimal" ? "nowrap" : "wrap" }}>
                        <Row className="entryRow">
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
                                        onChange={(dd) => changeCoord("lat", dd)}
                                        onKeyDown={(e) => {
                                            if (areValidCoordinates() && e.keyCode === 13) {
                                                zoomToPoint();
                                            }
                                        }}
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Row>
                        <Row className="entryRow">
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
                                        onChange={(dd) => changeCoord("lon", dd)}
                                        onKeyDown={(e) => {
                                            if (areValidCoordinates() && e.keyCode === 13) {
                                                zoomToPoint();
                                            }
                                        }}
                                    />
                                </InputGroup>
                            </FormGroup>
                        </Row>
                    </div>
                }
                {
                    activeTool === "bookmarkSearch" && showBookMarkSearchOption &&
                        <BookmarkSelect bookmarkConfig={props.bookmarkConfig} onPropertyChange={props.onPropertyChange}/>
                }
                <SearchBarToolbar
                    splitTools={false}
                    toolbarButtons={[{
                        ...(activeTool === "addressSearch" ? searchConfig :
                            showOptions && activeTool === "coordinatesSearch" ? coordinateFormatChange :
                                showOptions && activeTool === "bookmarkSearch" ? searchByBookmarkConfig : {})
                    },
                    {
                        glyph: removeIcon,
                        className: "square-button-md no-border",
                        bsStyle: "default",
                        pullRight: true,
                        loading: !isUndefined(loading) && loading,
                        visible: activeTool === "addressSearch" &&
                            (searchText !== "" || selectedItems && selectedItems.length > 0) ||
                            activeTool === "coordinatesSearch" && (isNumber(coordinate.lon) || isNumber(coordinate.lat)),
                        onClick: () => {
                            if (activeTool === "addressSearch") {
                                clearSearch();
                            } else {
                                clearCoordinates();
                            }
                        }
                    }, {
                        glyph: searchIcon,
                        className: "square-button-md no-border " +
                            (isSearchClickable || activeTool !== "addressSearch" ? "magnifying-glass clickable" : "magnifying-glass"),
                        bsStyle: "default",
                        pullRight: true,
                        tooltipId: activeTool === "bookmarkSearch" ? "search.zoomToBookmark" : "",
                        tooltipPosition: "bottom",
                        visible: activeTool === "addressSearch" &&
                            (!(searchText !== "" || selectedItems && selectedItems.length > 0) || !splitTools) ||
                            activeTool === "coordinatesSearch" || activeTool === "bookmarkSearch",
                        disabled: activeTool === "bookmarkSearch" && props.bookmarkConfig && !props.bookmarkConfig.selected,
                        onClick: () => {
                            if (activeTool === "coordinatesSearch" && areValidCoordinates()) {
                                zoomToPoint();
                            }
                            if (isSearchClickable) {
                                search();
                            }
                            if (activeTool === "bookmarkSearch") {
                                searchByBookmark();
                            }
                        }
                    }, {
                        tooltip: getError(error),
                        tooltipPosition: "bottom",
                        className: "square-button-md no-border",
                        glyph: "warning-sign",
                        bsStyle: "danger",
                        glyphClassName: "searcherror",
                        visible: !!error,
                        onClick: clearSearch
                    }, {
                        buttonConfig: {
                            title: <Glyphicon glyph="menu-hamburger"/>,
                            tooltipId: "search.changeSearchInputField",
                            tooltipPosition: "bottom",
                            className: "square-button-md no-border",
                            pullRight: true
                        },
                        menuOptions: [
                            ...searchMenuOptions
                        ],
                        visible: showOptions,
                        Element: DropdownToolbarOptions
                    }]}
                />
            </div>
        </FormGroup>
    </SearchBarBase>);
};
