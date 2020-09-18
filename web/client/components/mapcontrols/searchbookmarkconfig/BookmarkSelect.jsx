/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import Select from 'react-select';
import {isEmpty} from 'lodash';

import {setSearchBookmarkConfig} from '../../../actions/searchbookmarkconfig';
import {zoomToExtent} from "../../../actions/map";
import {configureMap} from "../../../actions/config";
import localizedProps from '../../misc/enhancers/localizedProps';
const SelectLocalized = localizedProps(['placeholder', 'clearValueText', 'noResultsText'])(Select);

/**
 * BookmarkOptions for Search bar
 * @memberof BookmarkSelect
 *
 */
export const BookmarkOptions = ({
    searchByBookmark: (
        selectedBookmark,
        onLayerVisibilityLoad,
        mapInitial,
        bookmarkSearchConfig,
        onZoomToExtent) => {
        const {options: bbox = {}, layerVisibilityReload = false} = selectedBookmark;
        if (layerVisibilityReload) {
            onLayerVisibilityLoad({
                ...mapInitial,
                map: {
                    ...mapInitial.map,
                    bookmark_search_config: bookmarkSearchConfig
                }
            }, null, {bounds: [bbox.west, bbox.south, bbox.east, bbox.north], crs: mapInitial?.map?.center?.crs || "EPSG:4326"});
        } else if (bbox && !isEmpty(bbox)) {
            onZoomToExtent([bbox.west, bbox.south, bbox.east, bbox.north], "EPSG:4326");
        }
    },
    searchIcon: (activeTool, {onLayerVisibilityLoad, mapInitial, bookmarkConfig, onZoomToExtent})=>({
        tooltipId: activeTool === "bookmarkSearch" ? "search.zoomToBookmark" : "",
        tooltipPosition: "bottom",
        visible: activeTool === "bookmarkSearch" && !bookmarkConfig?.zoomOnSelect,
        disabled: activeTool === "bookmarkSearch" && !bookmarkConfig.selected,
        onClick: () => {
            if (activeTool === "bookmarkSearch") {
                BookmarkOptions.searchByBookmark(bookmarkConfig.selected,
                    onLayerVisibilityLoad,
                    mapInitial,
                    bookmarkConfig.bookmarkSearchConfig || {},
                    onZoomToExtent);
            }
        }
    })
});

/**
 * BookmarkSelect component
 * @param {object} props Component props
 * @param {object} props.bookmarkConfig coordinate position in lat lon
 * @param {func} props.onPropertyChange triggered on changing the properties of the bookmark
 * @param {func} props.onLayerVisibilityLoad triggered on select of bookmark when layerVisibility is true on the selected bookmark
 * @param {object} props.mapInitial initial map properties
 * @param {func} props.onZoomToExtent triggered on changing coordinate position
 *
 */
const BookmarkSelect = ({ bookmarkConfig: config, onPropertyChange, onLayerVisibilityLoad, mapInitial, onZoomToExtent }) => {
    const [ options, setOptions ] = useState([]);
    const { selected = {}, bookmarkSearchConfig = {}, zoomOnSelect = true } = config || {};
    const { bookmarks = [] } = bookmarkSearchConfig;
    const selectProps = {clearable: true, isSearchable: true, isClearable: true};
    const {searchByBookmark} = BookmarkOptions;

    useEffect(()=>{
        if (!isEmpty(bookmarks)) {
            setOptions(bookmarks.map(opt=> opt.title));
        }
    }, [bookmarks]);

    const onChange = (event) => {
        const value = event && event.value || "";
        const [selectedBookmark] = bookmarks.filter((b, id)=> (b.title === value &&  id === event.idx));
        onPropertyChange("selected", selectedBookmark);
        zoomOnSelect && searchByBookmark(selectedBookmark,
            onLayerVisibilityLoad,
            mapInitial,
            bookmarkSearchConfig,
            onZoomToExtent);
    };

    return (
        <div className={"search-select"}>
            <div style={{flex: "1 1 0%", padding: "0px 4px"}}>
                <SelectLocalized
                    {...selectProps}
                    onChange={onChange}
                    value={selected?.title || ""}
                    options={(options).map((name, idx) => ({label: name, value: name, idx}))}
                    placeholder="search.b_placeholder"
                    clearValueText="search.b_clearvalue"
                    noResultsText="search.b_noresult"
                />
            </div>
        </div>

    );
};


BookmarkSelect.propTypes = {
    bookmarkConfig: PropTypes.object.isRequired,
    onPropertyChange: PropTypes.func.isRequired
};

export default connect((state)=> {
    return {
        bookmarkConfig: state.searchbookmarkconfig || {}
    };
}, {
    onPropertyChange: setSearchBookmarkConfig,
    onZoomToExtent: zoomToExtent,
    onLayerVisibilityLoad: configureMap
})(BookmarkSelect);
