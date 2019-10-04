/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withPropsOnChange} = require('recompose');
const Toolbar = require('../../misc/toolbar/Toolbar');

const getWidgetIcon = ({widgetType, type} = {}) => {
    const iconType = !widgetType || widgetType === "chart" ? type : widgetType;
    switch (iconType) {
    case "text":
        return "sheet";
    case "table":
        return "features-grid";
    case "pie":
        return "pie-chart";
    case "line":
        return "1-line";
    case "map":
        return "1-map";
    case "counter":
        return "counter";
    default:
        return "stats";
    }
};

/**
 * Bar that can be used to display the list of widgets
 */
module.exports = compose(
    // add widgets-bar base class and other default btnGroupProps
    withPropsOnChange(["btnGroupProps"], ({btnGroupProps}) => ({
        btnGroupProps: {
            ...btnGroupProps,
            className: "widgets-bar" + (btnGroupProps && btnGroupProps.className ? (` ${btnGroupProps.className}`) : "" )
        }
    })),
    withPropsOnChange(
        ["widgets", "onClick"],
        ({ widgets = [], onClick = () => {}}) => ({
            buttons: widgets.map(w => ({
                glyph: getWidgetIcon(w),
                tooltip: w.title,
                className: w.collapsed ? "btn-tray" : "btn-tray active",
                onClick: () => onClick(w)
            }))
        })
    )
)(Toolbar);
