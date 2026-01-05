/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useEffect, useState } from 'react';
import {FormGroup, Glyphicon, MenuItem} from 'react-bootstrap';
import { isEmpty, isEqual, isUndefined, get, isNumber } from 'lodash';

import Message from '../../I18N/Message';
import SearchBarMenu from './SearchBarMenu';

import SearchBarBase from '../../search/SearchBarBase';
import SearchBarInput from '../../search/SearchBarInput';
import SearchBarToolbar from '../../search/SearchBarToolbar';

import { defaultSearchWrapper } from '../../search/SearchBarUtils';
import BookmarkSelect, {BookmarkOptions} from "../searchbookmarkconfig/BookmarkSelect";
import CoordinatesSearch, {CoordinateOptions} from "../searchcoordinates/CoordinatesSearch";
import CurrentMapCRSCoordSearch from '../searchcoordinates/CurrentMapCRSCoordSearch';
import tooltip from '../../misc/enhancers/tooltip';

const TDiv = tooltip('div');

const SearchServicesContainer = ({activeTool, searchIcon, bottomMenuServices, services = [], selectedService = -1, onServiceSelect = () => {}}) => {
    const menuClassName = `search-services-submenus ${bottomMenuServices ? "search-services-submenus-bottom" : ""}`;
    return (
        <>
            { !bottomMenuServices &&
            <MenuItem className="trigger-item" active={activeTool === "addressSearch"} onClick={() => onServiceSelect(-1)}>
                <Glyphicon glyph={searchIcon}/>
                <Message msgId="search.addressSearch"/>
            </MenuItem>
            }
            <div className={menuClassName}>
                <TDiv tooltipPosition="left" tooltipId="search.searchOnAllServices" className={`search-services-item all-services-item ${activeTool === "addressSearch" && selectedService === -1 ? "active" : ""}`}  onClick={() => onServiceSelect(-1)}>
                    <Glyphicon glyph={searchIcon}/>
                    <Message msgId="search.addressSearch"/>
                </TDiv>
                {services.map((service, index) => {
                    const name = service.name || service.type;
                    return (
                        <TDiv
                            key={index}
                            tooltip={get(service, 'options.tooltip', `Search on ${name}`)}
                            tooltipPosition="left"
                            onClick={() => onServiceSelect(index)}
                            className={`search-services-item ${activeTool === "addressSearch" && selectedService === index ? "active" : ""}`}
                        >
                            <span className="search-services-item-icon">
                                <Glyphicon glyph={searchIcon}/>
                                {name}
                            </span>
                        </TDiv>
                    );
                })}
            </div>
        </>
    );
};

const SearchServicesSelectorMenu = ({activeTool, searchIcon, bottomMenuServices = false, services = [], selectedService = -1, onServiceSelect = () => {}}) => {

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

    return (<SearchServicesContainer
        activeTool={activeTool}
        searchIcon={searchIcon}
        services={services}
        bottomMenuServices={bottomMenuServices}
        selectedService={selectedService}
        onServiceSelect={onServiceSelect}
    />);
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
    currentMapCRS = 'EPSG:4326',
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
    useEffect(()=>{
        // clear coord search/ crs search marker
        if (!['mapCRSCoordinatesSearch', 'coordinatesSearch'].includes(activeTool)) {
            onClearCoordinatesSearch({owner: "search"});
            if (isNumber(coordinate?.lon) && isNumber(coordinate?.lat)) {
                const clearedFields = ["lat", "lon", "xCoord", "yCoord", "currentMapXYCRS"];
                const resetVal = '';
                clearedFields.forEach(field => onChangeCoord(field, resetVal));
            }
        }
    }, [activeTool]);
    useEffect(() => {
        // Switch back to coordinate search when map CRS is EPSG:4326 and active tool is Map CRS coordinate search
        if (currentMapCRS === 'EPSG:4326' && activeTool === 'mapCRSCoordinatesSearch') {
            onChangeActiveSearchTool('coordinatesSearch');
        }
    }, [currentMapCRS]);

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
                bottomMenuServices={searchOptions?.bottomMenuServices}
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
                currentMapCRS={currentMapCRS}
                onChangeFormat={onChangeFormat}
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

    // Move custom services at bottom menu
    if (searchOptions?.bottomMenuServices && showAddressSearchOption && searchMenuOptions.length > 1) {
        const [topmenu, ...rest] = searchMenuOptions;
        searchMenuOptions = [...rest, topmenu];
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
                    <CoordinatesSearch currentMapCRS={currentMapCRS} format={format} defaultZoomLevel={defaultZoomLevel} onClearCoordinatesSearch={onClearCoordinatesSearch} />
                }
                {activeTool === "mapCRSCoordinatesSearch" && showCoordinatesSearchOption && currentMapCRS &&
                    <CurrentMapCRSCoordSearch currentMapCRS={currentMapCRS} format={format} defaultZoomLevel={defaultZoomLevel} onClearCoordinatesSearch={onClearCoordinatesSearch} />
                }
                {
                    activeTool === "bookmarkSearch" && showBookMarkSearchOption &&
                        <BookmarkSelect mapInitial={props.mapInitial}/>
                }
                <SearchBarToolbar
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
                            ...(["coordinatesSearch", "mapCRSCoordinatesSearch"].includes(activeTool)  &&
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
                            ...(["coordinatesSearch", "mapCRSCoordinatesSearch"].includes(activeTool) &&
                                CoordinateOptions.searchIcon(activeTool, coordinate, onZoomToPoint, defaultZoomLevel, currentMapCRS)),
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
