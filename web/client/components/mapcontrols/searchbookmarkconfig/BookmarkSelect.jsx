/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import {isEmpty} from 'lodash';
import localizedProps from '../../misc/enhancers/localizedProps';
const SelectLocalized = localizedProps(['placeholder', 'clearValueText', 'noResultsText'])(Select);

const BookmarkSelect = ({ bookmarkConfig: config, onPropertyChange }) => {
    const [ options, setOptions ] = useState([]);
    const { selected = {}, bookmarkSearchConfig = {} } = config || {};
    const { bookmarks = [] } = bookmarkSearchConfig;
    const selectProps = {clearable: true, isSearchable: true, isClearable: true};

    useEffect(()=>{
        if (!isEmpty(bookmarks)) {
            setOptions(bookmarks.map(opt=> opt.title));
        }
    }, [bookmarks]);

    const onChange = (event) => {
        const value = event && event.value || "";
        const [selectedBookmark] = bookmarks.filter((b, id)=> (b.title === value &&  id === event.idx));
        onPropertyChange("selected", selectedBookmark);
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

export default BookmarkSelect;
