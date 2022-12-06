/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {createSelector} from 'reselect';
import {compose, defaultProps, withHandlers, withProps, withPropsOnChange, withState} from 'recompose';


import {createPlugin} from '../utils/PluginsUtils';

import {mapIdSelector} from '../selectors/map';
import {
    dependenciesSelector,
    getFloatingWidgets,
    getFloatingWidgetsLayout,
    getMaximizedState,
    getVisibleFloatingWidgets,
    isTrayEnabled
} from '../selectors/widgets';
import {
    changeLayout,
    deleteWidget,
    editWidget,
    exportCSV,
    exportImage,
    toggleCollapse,
    toggleCollapseAll,
    toggleMaximize,
    updateWidgetProperty
} from '../actions/widgets';
import editOptions from './widgets/editOptions';
import autoDisableWidgets from './widgets/autoDisableWidgets';

const RIGHT_MARGIN = 55;
import { widthProvider, heightProvider } from '../components/layout/enhancers/gridLayout';

import WidgetsViewBase from '../components/widgets/view/WidgetsView';
import {mapLayoutValuesSelector} from "../selectors/maplayout";

const WidgetsView =
compose(
    connect(
        createSelector(
            mapIdSelector,
            getVisibleFloatingWidgets,
            getFloatingWidgetsLayout,
            getMaximizedState,
            dependenciesSelector,
            (state) => mapLayoutValuesSelector(state, { right: true}),
            state => state.browser && state.browser.mobile,
            getFloatingWidgets,
            (id, widgets, layouts, maximized, dependencies, mapLayout, isMobileAgent, dropdownWidgets) => ({
                id,
                widgets,
                layouts,
                maximized,
                dependencies,
                mapLayout,
                isMobileAgent,
                dropdownWidgets
            })
        ), {
            editWidget,
            updateWidgetProperty,
            exportCSV,
            toggleCollapse,
            toggleCollapseAll,
            toggleMaximize,
            exportImage,
            deleteWidget,
            onLayoutChange: changeLayout
        }
    ),
    // functionalities concerning auto-resize, layout and style.
    compose(
        heightProvider({ debounceTime: 20, closest: true, querySelector: '.fill' }),
        widthProvider({ overrideWidthProvider: false }),
        withProps(({ isMobileAgent, width, mapLayout, singleWidgetLayoutBreakpoint = 1024 }) => {
            const rightOffset = mapLayout?.right ?? 0;
            const isSingleWidgetLayout = isMobileAgent || width <= singleWidgetLayoutBreakpoint;
            const leftOffset = isSingleWidgetLayout ? 0 : 500;
            const viewWidth = width - (rightOffset + RIGHT_MARGIN + leftOffset);
            const backgroundSelectorOffset = isSingleWidgetLayout ? (isMobileAgent ? 40 : 60) : 0;
            return {
                backgroundSelectorOffset,
                isSingleWidgetLayout,
                viewWidth,
                rightOffset,
                leftOffset,
                singleWidgetLayoutBreakpoint
            };
        }),
        withProps(({
            width,
            height,
            maximized,
            leftOffset,
            viewWidth,
            isSingleWidgetLayout,
            singleWidgetLayoutMaxHeight = 300,
            singleWidgetLayoutMinHeight = 200,
            backgroundSelectorOffset
        } = {}) => {
            const divHeight = isSingleWidgetLayout
                ? (height - backgroundSelectorOffset - 120) / 2
                : height - backgroundSelectorOffset - 120;
            const nRows = isSingleWidgetLayout ? 1 : 4;
            const rowHeight = !isSingleWidgetLayout
                ? Math.floor(divHeight / nRows - 20)
                : divHeight > singleWidgetLayoutMaxHeight
                    ? singleWidgetLayoutMaxHeight
                    : divHeight < singleWidgetLayoutMinHeight
                        ? singleWidgetLayoutMinHeight
                        : singleWidgetLayoutMaxHeight;


            const maximizedStyle = maximized?.widget ? {
                width: '100%',
                height: '100%',
                marginTop: 0,
                bottom: 'auto',
                top: 0,
                left: 0,
                zIndex: 1330
            } : {};
            const maximizedProps = maximized?.widget ? {
                width,
                useDefaultWidthProvider: false,
                rowHeight: height - 50,
                breakpoints: { xxs: 0 },
                cols: { xxs: 1 }
            } : {};
            const widthOptions = width ? {width: viewWidth - 1} : {};
            const baseHeight = isSingleWidgetLayout
                ? rowHeight
                : Math.floor((height - 100) / (rowHeight + 10)) * (rowHeight + 10);
            return ({
                rowHeight,
                className: "on-map",
                breakpoints: isSingleWidgetLayout ? { xxs: 0 } : { md: 0 },
                cols: { md: 6, xxs: 1 },
                ...widthOptions,
                useDefaultWidthProvider: false,
                style: {
                    left: leftOffset + 'px',
                    bottom: 65 + backgroundSelectorOffset,
                    height: baseHeight,
                    width: viewWidth + 'px',
                    position: 'absolute',
                    zIndex: 50,
                    ...maximizedStyle
                },
                ...maximizedProps
            });
        })
    ),
    /* toolsOptions configurations support
     * Provide functionalities to manage widgets tools visibility.
     */
    compose(
        defaultProps({
            toolsOptions: {
                showPin: "user.role===ADMIN", // users can lock widgets to disable editing, move and collapse
                seeHidden: "user.role===ADMIN", // users that can see the hidden widgets (hidden with hide tool, visible only to the users that has showHide = true)
                showHide: false, // show the hide tool in menu
                showCollapse: true,
                showMaximize: true
            }
        }),
        // allow to customize toolsOptions object, with rules. see accessRuleParser
        editOptions("toolsOptions", { asObject: true }),
        // do not show collapse if tray is not present
        compose(
            connect(createSelector(isTrayEnabled, tray => ({ tray }))),
            withPropsOnChange(
                ["toolsOptions", "tray"],
                ({toolsOptions, tray}) => ({
                    toolsOptions: toolsOptions ? {
                        ...toolsOptions,
                        showCollapse: toolsOptions.showCollapse && tray
                    } : toolsOptions
                })
            )
        ),
        // hide hidden widgets to user has not access to
        withPropsOnChange(
            ["widgets", "toolsOptions"],
            ({ widgets = [], toolsOptions = {}}) => ({
                widgets: widgets.filter(({ hide }) => hide ? toolsOptions.seeHidden : true)
            })
        ),
        // making only one widget displayed at a time for mobile view
        compose(
            // add state to store currently selected widget
            withState('activeWidget', 'setActiveWidget', false),
            withHandlers({
                toggleCollapse: props => (w) => {
                    const showWidget = props.widgets?.find(el => el.id === props.activeWidget?.id);
                    if (props.isSingleWidgetLayout && showWidget) {
                        props.toggleCollapseAll();
                    } else {
                        props.toggleCollapse(w);
                    }
                }
            }),
            // adjust dropdown options according to the widgets visibility for the user
            withPropsOnChange(
                ["dropdownWidgets", "toolsOptions"],
                ({ dropdownWidgets = [], toolsOptions = {}}) => ({
                    dropdownWidgets: dropdownWidgets.filter(({ hide }) => hide ? toolsOptions.seeHidden : true)
                })
            ),
            // set default active widget whenever set of widgets has changed and singleWidgetLayout is used
            withPropsOnChange(
                ["widgets", "isSingleWidgetLayout", "id"],
                ({widgets, isSingleWidgetLayout, activeWidget, setActiveWidget}) => {
                    if (widgets.length && isSingleWidgetLayout && !activeWidget) {
                        setActiveWidget(widgets[0]);
                    }
                }
            ),
            withPropsOnChange(
                ['activeWidget', 'isSingleWidgetLayout', 'widgets'],
                ({
                    activeWidget,
                    dropdownWidgets,
                    isSingleWidgetLayout,
                    widgets,
                    toolsOptions,
                    layouts,
                    setActiveWidget
                }) => {
                    if (activeWidget && isSingleWidgetLayout && widgets.length) {
                        const widget = {
                            ...activeWidget,
                            options: {
                                activeWidget,
                                dropdownWidgets,
                                ...(activeWidget.options ?? {}),
                                singleWidget: true,
                                setActiveWidget
                            }
                        };
                        return {
                            canEdit: false,
                            toolsOptions: {
                                ...toolsOptions,
                                showPin: false
                            },
                            layouts: {
                                ...layouts,
                                xxs: [
                                    ...(layouts.xxs.map(el => ({...el, h: 1, w: 1, x: 0, y: 0})))
                                ]
                            },
                            widgets: [widget]
                        };
                    }
                    return false;
                }
            )
        )
    )
)(WidgetsViewBase);


class Widgets extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool
    };
    static defaultProps = {
        enabled: true
    };
    render() {
        return this.props.enabled ? <WidgetsView {...this.props /* pass options to the plugin */ } /> : null;
    }
}
/**
 * Renders widgets on the map.
 * @memberof plugins
 * @name Widgets
 * @class
 * @prop {object} [toolsOptions] options to show and manage widgets tools. Widget tools are buttons available in some widgets. Any entry of this object can be configured using accessRules.
 *       Access rules can be defined using the syntax (@see components.misc.enhancers.security.accessRuleParser).
 *       The accessible parts of the state are `{mapInfo: {canEdit, canDelete...}, user: {role: "USER"}}`. So you can define rules like this:
 *       ```
 *       {showPin: ["__OR__", "user.role===ADMIN", "mapInfo.canEdit"]}
 *       ```
 * @prop {boolean|string|array} [toolsOptions.showPin] show lock tool. By default is visible only to the admin
 * @prop {boolean|string|array} [toolsOptions.showHide] show the "hide tool" for the widget (the tool allows to hide the widget to users that have `seeHidden=false` ). By default is false, in the most common case it should be the same of `seeHidden`.
 * @prop {boolean|string|array} [toolsOptions.seeHidden] hides the widgets under particular conditions
 * @prop {object} [dateFormats] object containing custom formats for date/time attribute types ( in [ISO_8601](https://en.wikipedia.org/wiki/ISO_8601)  format). Once specified, custom formats will be applied for specific attribute types in Table widget. Following keys are supported: `date-time`, `date`, `time`. Example:
 * ```
 * "dateFormats": {
 *    "date-time": "MM DD YYYY - HH:mm:ss",
 *    "date": "MM DD YYYY",
 *    "time": "HH:mm:ss"
 * }
 * ```
 *
 */
const WidgetsPlugin = autoDisableWidgets(Widgets);

export default createPlugin("WidgetsPlugin", {
    component: WidgetsPlugin,
    containers: {
        TOC: {
            doNotHide: true,
            name: "Widgets"
        }
    },
    reducers: {
        widgets: require('../reducers/widgets').default
    },
    epics: require('../epics/widgets').default
});
