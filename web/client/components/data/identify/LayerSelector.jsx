import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import {isEmpty} from 'lodash';
import localizedProps from '../../misc/enhancers/localizedProps';
const SelectLocalized = localizedProps(['placeholder', 'clearValueText', 'noResultsText'])(Select);

const LayerSelector = ({ responses, index, setIndex }) => {
    const selectProps = {clearable: true, isSearchable: true, isClearable: true};
    const [options, setOptions] = useState([]);
    const [title, setTitle] = useState("");

    useEffect(()=>{
        if (!isEmpty(responses)) {
            setOptions(responses.map(opt=> opt?.layerMetadata?.title || opt?.title));
        }
    }, [responses, index]);

    useEffect(()=>{
        setTitle(responses[index]?.layerMetadata?.title || responses[index]?.title || "");
    }, [responses, index]);

    const onChange = (event) => {
        const idx = event?.idx || 0;
        setIndex(idx);
    };

    return (
        <div style={{flex: "1 1 0%", padding: "0px 4px"}}>
            <SelectLocalized
                {...selectProps}
                onChange={onChange}
                value={title || ""}
                options={(options).map((name, idx) => ({label: name, value: name, idx }))}
                // isDisabled={false}
                // placeholder="search.b_placeholder"
                // clearValueText="search.b_clearvalue"
                // noResultsText="search.b_noresult"
            />
        </div>
    );
};

LayerSelector.propTypes = {
    responses: PropTypes.array,
    setIndex: PropTypes.func,
    index: PropTypes.number
};

export default LayerSelector;
