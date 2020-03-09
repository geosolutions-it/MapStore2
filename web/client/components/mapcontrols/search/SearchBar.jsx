/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { FormGroup, Glyphicon, Row, Col } from 'react-bootstrap';
import { isNumber } from 'lodash';

import CoordinateEntry from '../../misc/coordinateeditors/CoordinateEntry';
import Message from '../../I18N/Message';
import DropdownToolbarOptions from '../../misc/toolbar/DropdownToolbarOptions';
import Toolbar from '../../misc/toolbar/Toolbar';

import SearchBarBase from '../../search/SearchBarBase';
import SearchBarInput from '../../search/SearchBarInput';
import SearchBarToolbar from '../../search/SearchBarToolbar';

import { defaultSearchWrapper } from '../../search/SearchBarUtils';

export default ({
    activeSearchTool = 'addressSearch',
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
    error,
    format = 'decimal',
    placeholder,
    placeholderMsgId = "search.addressSearch",
    showOptions = true,
    showAddressSearchOption = true,
    showCoordinatesSearchOption = true,
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
    onPurgeResults
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

    const getActiveTool = () => {
        let activeTool = activeSearchTool;
        if (showAddressSearchOption && !showCoordinatesSearchOption) {
            activeTool = "addressSearch";
        }
        if (!showAddressSearchOption && showCoordinatesSearchOption) {
            activeTool = "coordinatesSearch";
        }
        return activeTool;
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

    let activeTool = getActiveTool();
    let searchMenuOptions = [];
    if (showAddressSearchOption && showCoordinatesSearchOption) {
        searchMenuOptions.push({
            active: activeTool === "addressSearch",
            onClick: () => {
                onClearCoordinatesSearch({owner: "search"});
                onChangeActiveSearchTool("addressSearch");
            },
            glyph: searchIcon,
            text: <Message msgId="search.addressSearch"/>
        });
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

    return (<SearchBarBase>
        <FormGroup>
            <div className="input-group">
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
                {activeTool !== "addressSearch" && showCoordinatesSearchOption &&
                    <div className="coordinateEditor">
                        <Row className="entryRow">
                            <Col xs={3} className="coordinateLabel">
                                <Message msgId="latitude"/>
                            </Col>
                            <Col xs={9}>
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
                            </Col>
                        </Row>
                        <Row className="entryRow">
                            <Col xs={3} className="coordinateLabel">
                                <Message msgId="longitude"/>
                            </Col>
                            <Col xs={9}>
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
                            </Col>
                        </Row>
                    </div>
                }
                <SearchBarToolbar
                    splitTools={false}
                    loading={loading}
                    toolbarButtons={[{
                        glyph: removeIcon,
                        className: "square-button-md no-border",
                        bsStyle: "default",
                        pullRight: true,
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
                        visible: activeTool === "addressSearch" &&
                            (!(searchText !== "" || selectedItems && selectedItems.length > 0) || !splitTools) ||
                            activeTool === "coordinatesSearch",
                        onClick: () => {
                            if (activeTool === "coordinatesSearch" && areValidCoordinates()) {
                                zoomToPoint();
                            }
                            if (isSearchClickable) {
                                search();
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
                            ...searchMenuOptions, {
                                onClick: () => {
                                    if (!enabledSearchServicesConfig) {
                                        onToggleControl("searchservicesconfig");
                                    }
                                },
                                glyph: "cog",
                                text: <Message msgId="search.searchservicesbutton"/>
                            }
                        ],
                        visible: showOptions,
                        Element: DropdownToolbarOptions
                    }]}
                >
                    {
                        showOptions && activeTool === "coordinatesSearch" ? <Toolbar
                            btnGroupProps = {{ className: 'btn-group-menu-options-format'}}
                            transitionProps = {null}
                            btnDefaultProps = {{ className: 'square-button-md', bsStyle: 'primary' }}
                            buttons={[
                                {
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
                                }
                            ]}
                        /> : null
                    }
                </SearchBarToolbar>
            </div>
        </FormGroup>
    </SearchBarBase>);
};
