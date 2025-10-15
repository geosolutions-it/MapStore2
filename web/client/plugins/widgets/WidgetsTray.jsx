/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, withProps, withState, lifecycle, mapPropsStream } from 'recompose';
import { createSelector } from 'reselect';
import tooltip from '../../components/misc/enhancers/tooltip';
import { Glyphicon } from 'react-bootstrap';
import { getVisibleFloatingWidgets } from '../../selectors/widgets';
import { toggleCollapseAll, toggleTray } from '../../actions/widgets';
import { trayWidgets } from '../../selectors/widgetsTray';
import { filterHiddenWidgets } from './widgetsPermission';
import BorderLayout from '../../components/layout/BorderLayout';
import WidgetsBar from './WidgetsBar';
import BButton from '../../components/misc/Button';
import {mapLayoutValuesSelector} from "../../selectors/maplayout";
import {withContainerDimensions} from "./withContainerDimensions";
import { is3DMode } from '../../selectors/maptype';

const Button = tooltip(BButton);

/**
 * Button that allows collapse/Expand functionality of the tray.
 * @param {object} props
 */
const CollapseTrayButton = ({ expanded, onClick = () => { } } = {}) =>
    (<Button
        tooltipId={expanded ? "widgets.tray.collapseTray" : "widgets.tray.expandTray"}
        bsSize="xsmall"
        bsStyle="default"
        style={{ borderColor: 'transparent' }}
        onClick={onClick}>
        <Glyphicon glyph={expanded ? "chevron-right" : "chevron-left"} />
    </Button>);

/**
 * Button to collapse/expand all widgets
 */
const CollapseAllButton = compose(
    connect(
        createSelector(
            getVisibleFloatingWidgets,
            (widgets = []) => ({ widgets })
        ), // get all visible widgets
        {
            onClick: () => toggleCollapseAll()
        }
    ),
    filterHiddenWidgets,
    withProps(({ widgets = [] }) => ({
        shouldExpand: widgets.length === 0
    }))
)(({ onClick = () => { }, shouldExpand = false } = {}) =>
    (<Button
        tooltipId={shouldExpand ? "widgets.tray.expandAll" : "widgets.tray.collapseAll"}
        bsStyle={shouldExpand ? "primary" : "success active"}

        bsSize="xsmall"
        onClick={onClick}>
        <Glyphicon glyph={"list"} />
    </Button>));

/**
 * Main component of the widgets tray.
 * @prop {boolean} enabled if true, the component is enabled and visible
 * @prop {object} toolsOptions object that contains `seeHidden` property rules to apply. see Widgets plugin configuration
 * @prop {boolean} expanded if true, it shows the list of widgets
 * @prop {function} setExpanded handler to toggle expand/collapse the tray
 */
class WidgetsTray extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        toolsOptions: PropTypes.object,
        items: PropTypes.array,
        expanded: PropTypes.bool,
        setExpanded: PropTypes.func,
        layout: PropTypes.object,
        isSingleWidgetLayout: PropTypes.bool,
        isMobileAgent: PropTypes.bool,
        is3DMap: PropTypes.bool
    };
    static defaultProps = {
        enabled: true,
        items: [],
        expanded: false,
        setExpanded: () => { },
        layout: {}
    };
    render() {
        return this.props.enabled
            ? (<div className="widgets-tray"
                style={{
                    marginBottom: this.props.isMobileAgent && !this.props.is3DMap ? 60 : 2,
                    marginRight: (this.props.layout?.right ?? 0) + 65,
                    bottom: 0,
                    right: 0,
                    position: "absolute"
                }}>
                <BorderLayout
                    columns={[
                        ...( !this.props.isSingleWidgetLayout
                            ? [<CollapseTrayButton key="collapse-tray" toolsOptions={this.props.toolsOptions} expanded={this.props.expanded} onClick={() => this.props.setExpanded(!this.props.expanded)} />]
                            : []
                        ),
                        <CollapseAllButton key="collapse-all" toolsOptions={this.props.toolsOptions} />,
                        ...(this.props.items.map( i => i.tool) || [])
                    ]}
                >
                    {this.props.expanded && !this.props.isSingleWidgetLayout ? <WidgetsBar toolsOptions={this.props.toolsOptions} /> : null}
                </BorderLayout>
            </div>)
            : null;
    }
}

export default compose(
    withContainerDimensions,
    withState("expanded", "setExpanded", false),
    connect(createSelector(
        trayWidgets,
        state => state.browser && state.browser.mobile,
        (state) => mapLayoutValuesSelector(state, { right: true }),
        is3DMode,
        (widgets, isMobileAgent, layout = [], is3DMap) => ({ widgets, layout, isMobileAgent, is3DMap })
    ), {
        toggleTray
    }),
    filterHiddenWidgets,
    withProps(({ widgets = [] }) => ({
        hasCollapsedWidgets: widgets.filter(({ collapsed } = {}) => collapsed).length > 0,
        hasTrayWidgets: widgets.length > 0
    })),
    withProps(({ isMobileAgent, width, singleWidgetLayoutBreakpoint = 1024 }) => {
        return {
            isSingleWidgetLayout: isMobileAgent || width <= singleWidgetLayoutBreakpoint
        };
    }),
    // flag of plugin presence
    lifecycle({
        componentDidMount() {
            if (this.props.toggleTray) this.props.toggleTray(true);
        },
        componentWillUnmount() {
            if (this.props.toggleTray) this.props.toggleTray(false);
        }
    }),
    // expand icons when one widget has been collapsed, collapse icons when no items collapsed anymore
    mapPropsStream(props$ => props$
        .merge(
            props$
                .distinctUntilKeyChanged('hasCollapsedWidgets')
                .do(({ setExpanded = () => { }, hasCollapsedWidgets }) => setExpanded(hasCollapsedWidgets))
                .ignoreElements()
        )
    ),
    withProps(({ enabled, hasTrayWidgets }) => ({
        enabled: enabled && hasTrayWidgets
    }))
)(WidgetsTray);
