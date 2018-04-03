/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, branch, withProps, withHandlers} = require('recompose');
/**
 * Enables selection for widgets for WidgetView.
 * If the prop `selectionActive = true`, add selection-active class to the container and add the `disabled` class to
 * widgets that are not selectable. The disabled class is assigned executing `isWidgetSelectable` with the widget object as parameter.
 * @prop selectionActive activates selection
 * @prop isWidgetSelectable optional filter function that checks if a widget is selectable. By default all widgets are selectable.
 * @prop onWidgetSelected handler called when a widget has been selected
 */
module.exports = branch(
    ({ selectionActive }) => selectionActive,
    compose(
        withProps(({ className }) => ({
            className: `${className} selection-active`
        })),
        withHandlers(({
            getWidgetClass:
                ({ getWidgetClass = () => { }, isWidgetSelectable = () => true }) =>
                    (w) => getWidgetClass(w)
                        ? getWidgetClass(w) + (isWidgetSelectable(w) ? undefined : ' disabled')
                        : isWidgetSelectable(w) ? undefined : ' disabled',
            onWidgetClick: ({ onWidgetSelected = () => { }, isWidgetSelectable = () => true }) => (w, ...args) => isWidgetSelectable(w) ? onWidgetSelected(w, ...args) : null
        }))
    )
);
