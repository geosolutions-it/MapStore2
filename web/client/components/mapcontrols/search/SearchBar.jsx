/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useEffect, useState } from 'react';
import {FormGroup, Glyphicon, MenuItem} from 'react-bootstrap';
import { isEmpty, isEqual, isUndefined, get } from 'lodash';

import Message from '../../I18N/Message';
import SearchBarMenu from './SearchBarMenu';

import SearchBarBase from '../../search/SearchBarBase';
import SearchBarInput from '../../search/SearchBarInput';
import SearchBarToolbar from '../../search/SearchBarToolbar';

import { defaultSearchWrapper } from '../../search/SearchBarUtils';
import BookmarkSelect, {BookmarkOptions} from "../searchbookmarkconfig/BookmarkSelect";
import CoordinatesSearch, {CoordinateOptions} from "../searchcoordinates/CoordinatesSearch";
import tooltip from '../../misc/enhancers/tooltip';

const TMenuItem = tooltip(MenuItem);
const SearchServicesSelectorMenu = ({activeTool, searchIcon, services = [], selectedService = -1, onServiceSelect = () => {}}) => {
    if (services.length === 0) {
        return null;
    }
    if (services.length === 1) {
        return (
            <MenuItem active={activeTool === "addressSearch"} onClick={() => onServiceSelect(-1)}>
                <Glyphicon glyph={searchIcon}/>
                <Message msgId="search.addressSearch"/>
            </MenuItem>
        );
    }
    return (<>
        <TMenuItem
            tooltipId="search.searchOnAllServices"
            tooltipPosition="left"
            active={activeTool === "addressSearch" && selectedService === -1}
            onClick={() => onServiceSelect(-1)}
        >
            <Glyphicon glyph={searchIcon}/>
            <Message msgId="search.addressSearch"/>
        </TMenuItem>
        {services.map((service, index) => {
            const name = service.name || service.type;
            return (<TMenuItem
                tooltip={get(service, 'options.tooltip', `Search on ${name}`)}
                tooltipPosition="left"
                onClick={() => onServiceSelect(index)}
                key={index}
                active={activeTool === "addressSearch" && selectedService === index}
            >
                <span style={{marginLeft: 20}}>
                    <Glyphicon glyph={searchIcon}/>
                    {name}
                </span>
            </TMenuItem>);
        })}
        <MenuItem divider/>
    </>);
};

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
    const [selectedSearchService, setSearchServiceSelected] = useState(-1);
    useEffect(() => {
        // Reset selected service, when service changes
        if (!isEqual(searchOptions?.services, searchOptions?.services)) {
            setSearchServiceSelected(-1);
        }
    }, [searchOptions?.services]);

    const selectedServices = searchOptions?.services?.filter((_, index) => selectedSearchService >= 0 ? selectedSearchService === index : true) ?? [];
    const search = defaultSearchWrapper({
        searchText,
        selectedItems,
        searchOptions: {
            ...searchOptions,
            services: selectedServices
        },
        maxResults, onSearch, onSearchReset
    });

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
            <SearchServicesSelectorMenu
                searchIcon={searchIcon}
                activeTool={activeTool}
                selectedService={selectedSearchService}
                onServiceSelect={(index) => {
                    setSearchServiceSelected(index === -1 ? undefined : index);
                    onClearCoordinatesSearch({owner: "search"});
                    onClearBookmarkSearch("selected");
                    onChangeActiveSearchTool("addressSearch");
                    return;
                }}
                services={searchOptions?.services}
            />
        );
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
        const item = items.find(({ name }) => name === 'SearchByBookmark') || {};
        if (item.menuItem) {
            const BookmarkMenuItem = item.menuItem;
            searchMenuOptions.push(<BookmarkMenuItem/>);
        }
        if (item.bookmarkConfig) {
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
        if (showOptions) {
            if (activeTool === "coordinatesSearch") {
                return CoordinateOptions.coordinateFormatChange(format, onChangeFormat, showOptions, activeTool);
            } else if (activeTool === "bookmarkSearch") {
                return searchByBookmarkConfig;
            }
        }
        return null;
    };

    const getPlaceholder = () => {
        // when placeholder is present, nested service's placeholder is applied
        if (!placeholder && selectedServices?.length === 1 && searchOptions?.services?.length > 1) {
            const [service] = selectedServices;
            const name = service.name || service.type;
            return get(service, 'options.placeholder', `Search by ${name}`);
        }
        return placeholder;
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
                    placeholder={getPlaceholder()}
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
                <Message msgId="catalog.search">
                    {(searchButtonText) => <SearchBarToolbar
                        splitTools={false}
                        toolbarButtons={[
                            ...(getConfigButtons() ? [{...getConfigButtons()}] : []),
                            ...items
                                .filter(({ target }) => target === 'button')
                                .map(({ component: Element }) => ({
                                    visible: !!showOptions,
                                    Element
                                })),
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
                                'aria-label': searchButtonText,
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
                    />}
                </Message>
            </div>
        </FormGroup>
    </SearchBarBase>);
};
