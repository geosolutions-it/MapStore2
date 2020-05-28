import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import {isEmpty} from 'lodash';

const BookmarkSelect = (props) => {
    const [ options, setOptions ] = useState([]);
    const { bookmarkConfig: config, onPropertyChange } = props;
    const { selected = {}, bookmarkSearchConfig = {} } = config || {};
    const { bookmarks = [] } = bookmarkSearchConfig;

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
                <Select
                    onChange={onChange}
                    clearable
                    value={selected && selected.title || ""}
                    isSearchable
                    isClearable
                    hasValue
                    options={(options).map((name, idx) => ({label: name, value: name, idx}))}/>
            </div>
        </div>
    );
};

BookmarkSelect.propTypes = {
    bookmarkConfig: PropTypes.object.isRequired,
    onPropertyChange: PropTypes.func.isRequired
};

export default BookmarkSelect;
