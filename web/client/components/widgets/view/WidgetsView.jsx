/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const { pure } = require('recompose');
const { find } = require('lodash');
/*
react-grid-layout-resize-prevent-collision is a fork of react-grid-layout deployed on npmjs.org to fix https://github.com/STRML/react-grid-layout/issues/655
You can install and use react-grid-layout again when the issue is fixed
*/
const { Responsive, WidthProvider: widthProvider } = require('react-grid-layout-resize-prevent-collision');
const ResponsiveReactGridLayout = widthProvider(Responsive);
const withGroupColor = require('../enhancers/withGroupColor');
const DefaultWidget = withGroupColor(require('../widget/DefaultWidget'));
const getWidgetGroups = (groups = [], w) => groups.filter(g => find(g.widgets, id => id === w.id));
require('react-grid-layout-resize-prevent-collision/css/styles.css');

module.exports = pure(({
    id,
    style,
    className = "",
    rowHeight = 208,
    breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols = { lg: 6, md: 6, sm: 4, xs: 2, xxs: 1 },
    widgets = [],
    layouts,
    dependencies,
    showGroupColor,
    groups = [],
    getWidgetClass = () => { },
    onWidgetClick = () => { },
    updateWidgetProperty = () => { },
    deleteWidget = () => { },
    editWidget = () => { },
    onLayoutChange = () => { },
    ...actions
} = {}) =>
    (<ResponsiveReactGridLayout
        key={id}
        draggableHandle={".draggableHandle"}
        onLayoutChange={onLayoutChange}
        preventCollision
        layouts={layouts ? JSON.parse(JSON.stringify(layouts)) : undefined}
        style={style}
        className={`widget-container ${className}`}
        rowHeight={rowHeight}
        autoSize
        verticalCompact={false}
        breakpoints={breakpoints}
        cols={cols}>
        {
            widgets.map(w => (<div key={w.id} data-grid={w.dataGrid} onClick={() => onWidgetClick(w)} className={getWidgetClass(w)}><DefaultWidget
                data-grid={w.dataGrid}
                {...actions}
                {...w}
                groups={getWidgetGroups(groups, w)}
                showGroupColor={showGroupColor}
                dependencies={dependencies}
                updateProperty={(...args) => updateWidgetProperty(w.id, ...args)}
                onDelete={() => deleteWidget(w)}
                onEdit={() => editWidget(w)} /></div>))
        }
    </ResponsiveReactGridLayout>));
