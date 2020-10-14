/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import {FormGroup, Glyphicon, MenuItem} from 'react-bootstrap';
import {isEmpty, some, isUndefined} from 'lodash';

import Message from '../../I18N/Message';
import SearchBarMenu from './SearchBarMenu';

import SearchBarBase from '../../search/SearchBarBase';
import SearchBarInput from '../../search/SearchBarInput';
import SearchBarToolbar from '../../search/SearchBarToolbar';

import { defaultSearchWrapper } from '../../search/SearchBarUtils';
import BookmarkSelect, {BookmarkOptions} from "../searchbookmarkconfig/BookmarkSelect";
import CoordinatesSearch, {CoordinateOptions} from "../searchcoordinates/CoordinatesSearch";

export default ({
    activeSearchTool: activeTool = 'addressSearch',
    removeIcon = '1-close',
    searchIcon = 'search',
    isSearchClickable = true,
    splitTools,
    searchText = '',
    maxResults = 15,
    searchOptions,
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
    onClearBookmarkSearch = () => {},
    onPurgeResults,
    items = [],
    ...props
}) => {

    const search = defaultSearchWrapper({searchText, selectedItems, searchOptions, maxResults, onSearch, onSearchReset});

    const clearSearch = () => {
        onSearchReset();
    };

    const getError = (e) => {
        if (e) {
            return (<Message msgId={e.msgId || "search.generic_error"} msgParams={{message: e.message, serviceType: e.serviceType}}/>);
        }
        return null;
    };

    let searchMenuOptions = [];
    if (showAddressSearchOption) {
        searchMenuOptions.push(
            <MenuItem active={activeTool === "addressSearch"} onClick={()=>{
                onClearCoordinatesSearch({owner: "search"});
                onClearBookmarkSearch("selected");
                onChangeActiveSearchTool("addressSearch");
            }}
            >
                <Glyphicon glyph={searchIcon}/> <Message msgId="search.addressSearch"/>
            </MenuItem>);
    }
    if (showCoordinatesSearchOption) {
        searchMenuOptions.push(
            <CoordinateOptions.coordinatesMenuItem
                activeTool={activeTool}
                searchText={searchText}
                clearSearch={clearSearch}
                onChangeActiveSearchTool={onChangeActiveSearchTool}
                onClearBookmarkSearch={onClearBookmarkSearch}
            />);
    }

    let searchByBookmarkConfig;
    if (showBookMarkSearchOption && !isEmpty(items)) {
        const {allowUser, bookmarkSearchConfig: config} = props.bookmarkConfig || {};
        const [item] = items;
        if (some(items, "menuItem")) {
            const BookmarkMenuItem = item.menuItem;
            searchMenuOptions.push(<BookmarkMenuItem/>);
        }
        if (some(items, "bookmarkConfig")) {
            searchByBookmarkConfig = {
                ...item.bookmarkConfig(onToggleControl, enabledSearchBookmarkConfig, activeTool),
                ...(!allowUser && {visible: false})
            };
        }
        // Reset activeTool when no valid permission for bookmark
        if (!allowUser && config?.bookmarks?.length === 0 && activeTool === "bookmarkSearch") {
            onChangeActiveSearchTool("addressSearch");
        }
    }

    const getConfigButtons = () => {
        if (activeTool === "addressSearch") {
            return {
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
        } else if (showOptions) {
            if (activeTool === "coordinatesSearch") {
                return CoordinateOptions.coordinateFormatChange(format, onChangeFormat, showOptions, activeTool);
            } else if (activeTool === "bookmarkSearch") {
                return searchByBookmarkConfig;
            }
        }
        return {};
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
                    <CoordinatesSearch format={format} defaultZoomLevel={defaultZoomLevel} onClearCoordinatesSearch={onClearCoordinatesSearch} />
                }
                {
                    activeTool === "bookmarkSearch" && showBookMarkSearchOption &&
                        <BookmarkSelect mapInitial={props.mapInitial}/>
                }
                <SearchBarToolbar
                    splitTools={false}
                    toolbarButtons={[{...getConfigButtons()},
                        {
                            glyph: removeIcon,
                            className: "square-button-md no-border",
                            bsStyle: "default",
                            pullRight: true,
                            loading: !isUndefined(loading) && loading,
                            visible: activeTool === "addressSearch" &&
                            (searchText !== "" || selectedItems && selectedItems.length > 0),
                            onClick: () => {
                                if (activeTool === "addressSearch") {
                                    clearSearch();
                                }
                            },
                            ...(activeTool === "coordinatesSearch" &&
                                CoordinateOptions.removeIcon(activeTool, coordinate, onClearCoordinatesSearch, onChangeCoord))
                        }, {
                            glyph: searchIcon,
                            className: "square-button-md no-border " +
                            (isSearchClickable || activeTool !== "addressSearch" ? "magnifying-glass clickable" : "magnifying-glass"),
                            bsStyle: "default",
                            pullRight: true,
                            tooltipPosition: "bottom",
                            visible: activeTool === "addressSearch" &&
                            (!(searchText !== "" || selectedItems && selectedItems.length > 0) || !splitTools),
                            onClick: () => isSearchClickable && search(),
                            ...(activeTool === "coordinatesSearch" &&
                                CoordinateOptions.searchIcon(activeTool, coordinate, onZoomToPoint, defaultZoomLevel)),
                            ...(activeTool === "bookmarkSearch" &&
                                    BookmarkOptions.searchIcon(activeTool, props))
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
                            visible: showOptions,
                            renderButton: <SearchBarMenu disabled={showOptions} menuItems={searchMenuOptions} />
                        }]}
                />
            </div>
        </FormGroup>
    </SearchBarBase>);
};
