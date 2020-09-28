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

const LayerSelector = ({ responses = [], index = 0, loaded, setIndex, missingResponses = 0, emptyResponses = false }) => {
    const selectProps = {clearable: false, isSearchable: true};
    const [options, setOptions] = useState([]);
    const [title, setTitle] = useState("");

    useEffect(()=>{
        if (!isEmpty(responses)) {
            setOptions(responses.map(opt=> opt?.layerMetadata?.title));
        }
    }, [responses]);

    useEffect(()=>{
        loaded && setTitle(responses[index]?.layerMetadata?.title || "");
    }, [responses, index, loaded]);

    const onChange = (event) => {
        const idx = event?.idx || 0;
        setIndex(idx);
    };

    return (
        <div id="identify-layer-select" style={{flex: "1 1 0%", padding: "0px 4px"}}>
            <SelectLocalized
                {...selectProps}
                onChange={onChange}
                value={title || ""}
                options={(options).map((name, idx) => ({label: name, value: name, idx }))}
                disabled={missingResponses !== 0 || responses.length === 0 || emptyResponses}
                noResultsText="identifyLayerSelectNoResult"
            />
        </div>
    );
};

LayerSelector.propTypes = {
    responses: PropTypes.array,
    setIndex: PropTypes.func,
    index: PropTypes.number,
    emptyResponses: PropTypes.bool
};

export default LayerSelector;
