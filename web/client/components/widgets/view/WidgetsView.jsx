/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const { pure, branch } = require('recompose');
const { find, mapValues } = require('lodash');

const { Responsive, WidthProvider: widthProvider } = require('react-grid-layout');
const ResponsiveReactGridLayout =
    branch(
        ({ useDefaultWidthProvider = true }) => useDefaultWidthProvider,
        widthProvider
    )(Responsive);
const withGroupColor = require('../enhancers/withGroupColor');
const DefaultWidget = withGroupColor(require('../widget/DefaultWidget'));
const getWidgetGroups = (groups = [], w) => groups.filter(g => find(g.widgets, id => id === w.id));
require('react-grid-layout/css/styles.css');

const WIDGET_MOBILE_RIGHT_SPACE = 34;
const getResponsiveWidgetWidth = width => width < 480 ? width - WIDGET_MOBILE_RIGHT_SPACE : width;

module.exports = pure(({
    id,
    style,
    className = "",
    toolsOptions = {},
    rowHeight = 208,
    breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols = { lg: 6, md: 6, sm: 4, xs: 2, xxs: 1 },
    widgets = [],
    layouts,
    dependencies,
    verticalCompact = false,
    compactMode,
    useDefaultWidthProvider = true,
    measureBeforeMount,
    width,
    showGroupColor,
    groups = [],
    canEdit = true,
    getWidgetClass = () => { },
    onWidgetClick = () => { },
    updateWidgetProperty = () => { },
    deleteWidget = () => { },
    toggleCollapse = ( ) => { },
    editWidget = () => { },
    onLayoutChange = () => { },
    language,
    env,
    ...actions
} = {}) => {
    // checking if this widget appears among other dependenciesMap of other widgets (i.e. it is a parent table)
    const allDependenciesMap = widgets.filter(({mapSync, dependenciesMap}) => mapSync && dependenciesMap).map(({dependenciesMap}) => dependenciesMap);
    const getEnableColumnFilters = w => w.widgetType  === "table" && allDependenciesMap.filter(depMap => Object.keys(depMap).filter(d => depMap[d] && depMap[d].indexOf(w.id) !== -1).length > 0 ).length > 0;

    return (<ResponsiveReactGridLayout
        key={id || "widgets-view"}
        useDefaultWidthProvider={useDefaultWidthProvider}
        measureBeforeMount={measureBeforeMount}
        width={!useDefaultWidthProvider ? getResponsiveWidgetWidth(width) : undefined}
        isResizable={canEdit}
        isDraggable={canEdit}
        draggableHandle={".draggableHandle"}
        onLayoutChange={onLayoutChange}
        preventCollision
        style={style}
        className={`widget-container ${className} ${canEdit ? '' : 'no-drag'}`}
        rowHeight={rowHeight}
        autoSize
        verticalCompact={verticalCompact}
        compactMode={compactMode}
        breakpoints={breakpoints}
        cols={cols}
        layouts={layouts ?
            // This conversion creates a new object.
            // It prevents immutability issues (ResponsiveReactGridLayout modifies directly the layout nested object)
            JSON.parse(JSON.stringify(
                /*
                 * ResponsiveReactGridLayout consider the static inside layout object with higher priority, ignoring the dataGrids one.
                 * MapStore instead have to store the "static" property in the widget, to make it valid for every layout (it is the lock functionality).
                 * This align the 2 values, giving priority to the widget's defined "static" property over the layout's one.
                 * Note: the layouts state will be automatically updated by ResponsiveReactGridLayout triggering onLayoutChange
                 * (this is triggered by the lib itself).
                 */
                mapValues(layouts, v =>
                    v.map(l => {
                        const w = find(widgets, { id: l.i });
                        if (w) {
                            return {
                                ...l,
                                "static": w.dataGrid && w.dataGrid.static
                            };
                        }
                        return l;
                    })
                )

            )) : undefined}>
        {
            widgets.map(w => (<div key={w.id} data-grid={w.dataGrid} onClick={() => onWidgetClick(w)} className={getWidgetClass(w)}><DefaultWidget
                data-grid={w.dataGrid}
                {...actions}
                {...w}
                quickFilters={getEnableColumnFilters(w) ? w.quickFilters : undefined}
                toolsOptions={toolsOptions}
                groups={getWidgetGroups(groups, w)}
                showGroupColor={showGroupColor}
                dependencies={dependencies}
                enableColumnFilters={getEnableColumnFilters(w)}
                canEdit={canEdit}
                updateProperty={(...args) => updateWidgetProperty(w.id, ...args)}
                toggleCollapse= {() => toggleCollapse(w)}
                onDelete={() => deleteWidget(w)}
                onEdit={() => editWidget(w)}
                language={language}
                env={env} /></div>))
        }
    </ResponsiveReactGridLayout>);
});
