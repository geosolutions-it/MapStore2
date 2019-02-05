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

/*
react-grid-layout-resize-prevent-collision is a fork of react-grid-layout deployed on npmjs.org to fix https://github.com/STRML/react-grid-layout/issues/655
You can install and use react-grid-layout again when the issue is fixed
*/
const { Responsive, WidthProvider: widthProvider } = require('react-grid-layout-resize-prevent-collision');
const ResponsiveReactGridLayout =
    branch(
        ({ useDefaultWidthProvider = true }) => useDefaultWidthProvider,
        widthProvider
    )(Responsive);
const withGroupColor = require('../enhancers/withGroupColor');
const DefaultWidget = withGroupColor(require('../widget/DefaultWidget'));
const getWidgetGroups = (groups = [], w) => groups.filter(g => find(g.widgets, id => id === w.id));
require('react-grid-layout-resize-prevent-collision/css/styles.css');

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
    ...actions
} = {}) =>
    (<ResponsiveReactGridLayout
        key={id || "widgets-view"}
        useDefaultWidthProvider={useDefaultWidthProvider}
        measureBeforeMount={measureBeforeMount}
        width={!useDefaultWidthProvider ? width : undefined}
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
                toolsOptions={toolsOptions}
                groups={getWidgetGroups(groups, w)}
                showGroupColor={showGroupColor}
                dependencies={dependencies}
                canEdit={canEdit}
                updateProperty={(...args) => updateWidgetProperty(w.id, ...args)}
                toggleCollapse= {() => toggleCollapse(w)}
                onDelete={() => deleteWidget(w)}
                onEdit={() => editWidget(w)} /></div>))
        }
    </ResponsiveReactGridLayout>));
