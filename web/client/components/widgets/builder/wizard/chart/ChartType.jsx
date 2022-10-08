/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import React from 'react';

import Message from '../../../../I18N/Message';
import StepHeader from '../../../../misc/wizard/StepHeader';
import Toolbar from "../../../../misc/toolbar/Toolbar";

const ITEMS = [{
    type: "bar",
    glyph: "stats"
}, {
    type: "pie",
    glyph: "pie-chart"
}, {
    type: "line",
    glyph: "line"
}].map((item) => ({
    ...item,
    title: <Message msgId={`widgets.chartType.${item.type}.title`} />
}));

export default ({ onSelect = () => { }, types = ITEMS, type} = {}) => (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
        <StepHeader key="title" title={<Message msgId="widgets.selectChartType.title" />} />
        <div style={{marginTop: 4}}>
            <Toolbar btnDefaultProps={{
                bsStyle: "primary",
                bsSize: "sm"
            }}
            buttons={
                types && ITEMS.map(item => ({
                    bsStyle: type === item.type ? "success" : "primary",
                    onClick: () =>{onSelect(item.type);},
                    glyph: item.glyph,
                    tooltipId: `widgets.chartType.${item.type}.title`
                }))
            }/>
        </div>
    </div>
);
