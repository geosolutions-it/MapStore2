import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import {isEmpty} from 'lodash';
import {createSelector} from "reselect";
import {zoomToExtent} from '../../../actions/map';
import {configureMap} from '../../../actions/config';

const BookmarkSelect = (props) => {
    const [selectedValue, setSelectedValue] = useState("");
    const [options, setOptions] = useState([]);
    const {bookmarks, onZoom, loadMap, mapInitial} = props;

    console.log("bookmarks", bookmarks);

    useEffect(()=>{
        if (!isEmpty(bookmarks)) {
            setOptions(bookmarks.map(opt=> opt.title));
        }
    }, [bookmarks]);

    const onChange = (event) => {
        const value = event && event.value || "";
        setSelectedValue(value);
        const [{options: bbox = [], layerVisibilityReload = false}] = bookmarks.filter((b, id)=> (b.title === value &&  id === event.idx));
        if (layerVisibilityReload) {
            loadMap({
                ...mapInitial
            }, null, [bbox.west, bbox.south, bbox.east, bbox.north]);
        } else if (bbox && !isEmpty(bbox)) {
            onZoom([bbox.west, bbox.south, bbox.east, bbox.north], "EPSG:4326");
        }
    };

    return (
        <div className={"search-select"}>
            <div style={{flex: "1 1 0%", padding: "0px 4px"}}>
                <Select
                    onChange={onChange}
                    clearable
                    value={selectedValue}
                    isSearchable
                    isClearable
                    hasValue
                    options={(options).map((name, idx) => ({label: name, value: name, idx}))}/>
            </div>
        </div>
    );
};

const selectors = createSelector([
    state=> state.mapConfigRawData || {},
    state => state.searchbookmarkconfig || {}
], (mapInitial, bookmarkconfig)=>({
    mapInitial,
    bookmarks: bookmarkconfig && bookmarkconfig.bookmarkSearchConfig && bookmarkconfig.bookmarkSearchConfig.bookmarks || []
}));

export default connect(selectors, {
    onZoom: zoomToExtent,
    loadMap: configureMap
})(BookmarkSelect);
