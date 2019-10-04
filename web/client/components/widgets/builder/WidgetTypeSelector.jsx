/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const Message = require('../../I18N/Message');
const SideGrid = require('../../misc/cardgrids/SideGrid');
const FitIcon = require('../../misc/FitIcon');

const DEFAULT_TYPES = [{
    title: <Message msgId={"widgets.types.chart.title"} />,
    type: "chart",
    caption: <Message msgId={"widgets.types.chart.caption"} />,
    glyph: "stats",
    className: "ms-widget-selector-chart"
}, {
    title: <Message msgId={"widgets.types.text.title"} />,
    type: "text",
    glyph: "sheet",
    caption: <Message msgId={"widgets.types.text.caption"} />,
    className: "ms-widget-selector-text"
}, {
    title: <Message msgId={"widgets.types.table.title"} />,
    type: "table",
    glyph: "features-grid",
    caption: <Message msgId={"widgets.types.table.caption"} />,
    className: "ms-widget-selector-table"
}, {
    title: <Message msgId={"widgets.types.counter.title"} />,
    type: "counter",
    glyph: "counter",
    caption: <Message msgId={"widgets.types.counter.caption"} />,
    className: "ms-widget-selector-counter"
}, {
    title: <Message msgId={"widgets.types.map.title"} />,
    type: "map",
    glyph: "1-map",
    caption: <Message msgId={"widgets.types.map.caption"} />,
    className: "ms-widget-selector-map"
}, {
    title: <Message msgId={"widgets.types.legend.title"} />,
    type: "legend",
    glyph: "list",
    caption: <Message msgId={"widgets.types.legend.caption"} />,
    className: "ms-widget-selector-legend"
}];

module.exports = ({widgetTypes = DEFAULT_TYPES, typeFilter = () => true, onSelect = () => {}}) =>
    (
        <SideGrid
            key="content"
            onItemClick={item => {onSelect(item.type); }}
            items={widgetTypes &&
        widgetTypes.filter(typeFilter).map( item =>
            ({
                ...item,
                preview: <FitIcon glyph={item.glyph} padding={20} />
            }))} />);
