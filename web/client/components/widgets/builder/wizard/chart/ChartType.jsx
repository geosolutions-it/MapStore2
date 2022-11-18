/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import React from 'react';

import Message from '../../../../I18N/Message';
import ReactSelect from "react-select";
import localizedProps from "../../../../misc/enhancers/localizedProps";
import {Glyphicon} from "react-bootstrap";
const Select = localizedProps(["noResultsText"])(ReactSelect);

const ITEMS = [{
    type: "bar",
    glyph: "stats"
}, {
    type: "pie",
    glyph: "pie-chart"
}, {
    type: "line",
    glyph: "line"
}];
const TypeRenderer = ({value, glyph})=>{
    return <span><Glyphicon glyph={glyph}/>&nbsp;{`${value.charAt(0).toUpperCase() + value.slice(1)} Chart`}</span>;
};
export default ({ onSelect = () => { }, types = ITEMS, type} = {}) => (
    <div className={"chart-type"}>
        <strong>
            <Message msgId={"widgets.selectChartType.title"}/>
        </strong>
        <div style={{marginTop: 4}}>
            <Select
                noResultsText="widgets.selectChartType.noResults"
                optionRenderer={TypeRenderer}
                valueRenderer={TypeRenderer}
                options={types.map(({type: value, glyph}) =>({value, label: value, glyph}))}
                onChange={(val) => val.value && onSelect(val.value)}
                value={type}
                clearable={false}
            />
        </div>
    </div>
);
