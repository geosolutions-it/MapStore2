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
import { compose, defaultProps, withProps, withPropsOnChange} from 'recompose';


import { createPlugin } from '../utils/PluginsUtils';

import {mapIdSelector} from '../selectors/map';
import { getVisibleFloatingWidgets, dependenciesSelector, getFloatingWidgetsLayout, isTrayEnabled} from '../selectors/widgets';
import { editWidget, updateWidgetProperty, deleteWidget, changeLayout, exportCSV, exportImage, toggleCollapse} from '../actions/widgets';
import editOptions from './widgets/editOptions';
import autoDisableWidgets from './widgets/autoDisableWidgets';

const RIGHT_MARGIN = 70;
import {heightProvider} from '../components/layout/enhancers/gridLayout';
import ContainerDimensions from 'react-container-dimensions';

import WidgetsViewBase from '../components/widgets/view/WidgetsView';

const WidgetsView =
compose(
    connect(
        createSelector(
            mapIdSelector,
            getVisibleFloatingWidgets,
            getFloatingWidgetsLayout,
            dependenciesSelector,
            (id, widgets, layouts, dependencies) => ({
                id,
                widgets,
                layouts,
                dependencies
            })
        ), {
            editWidget,
            updateWidgetProperty,
            exportCSV,
            toggleCollapse,
            exportImage,
            deleteWidget,
            onLayoutChange: changeLayout
        }
    ),
    // functionalities concerning auto-resize, layout and style.
    compose(
        heightProvider({ debounceTime: 20, closest: true, querySelector: '.fill' }),
        C => props => <ContainerDimensions>{({ width } = {}) => <C width={width} {...props} />}</ContainerDimensions>,
        withProps(({width, height} = {}) => {
            const divHeight = height - 120;
            const nRows = 4;
            const rowHeight = Math.floor(divHeight / nRows - 20);
            return ({
                rowHeight,
                className: "on-map",
                breakpoints: { md: 480, xxs: 0 },
                cols: { md: 6, xxs: 1 },
                style: {
                    left: (width && width > 800) ? "500px" : "0",
                    marginTop: 52,
                    bottom: 65,
                    height: Math.floor((height - 100) / (rowHeight + 10)) * (rowHeight + 10),
                    width: width && width > 800 ? `calc(100% - ${500 + RIGHT_MARGIN}px)` : `calc(100% - ${RIGHT_MARGIN}px)`,
                    position: 'absolute',
                    zIndex: 50
                }
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
                showCollapse: true
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
        )
    )
)(WidgetsViewBase);


class Widgets extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        shortenChartLabelThreshold: PropTypes.number
    };
    static defaultProps = {
        enabled: true,
        shortenChartLabelThreshold: 1000
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
        widgets: require('../reducers/widgets')
    },
    epics: require('../epics/widgets')
});
