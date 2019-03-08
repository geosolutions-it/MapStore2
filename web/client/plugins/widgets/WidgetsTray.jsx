/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const { connect } = require('react-redux');
const { compose, defaultProps, withProps, withState, lifecycle, mapPropsStream } = require('recompose');
const { createSelector } = require('reselect');
const { find, findIndex, sortBy } = require('lodash');
const tooltip = require('../../components/misc/enhancers/tooltip');
const editOptions = require('./editOptions');

const { Glyphicon, Button: BButton } = require('react-bootstrap');
const Button = tooltip(BButton);
const { getFloatingWidgets, getVisibleFloatingWidgets, getFloatingWidgetsCurrentLayout, getCollapsedIds, getCollapsedState } = require('../../selectors/widgets');
const { toggleCollapse, toggleCollapseAll, toggleTray } = require('../../actions/widgets');

const BorderLayout = require('../../components/layout/BorderLayout');

/**
 * Only widgets that are not hidden (to some users) or pinned (static) can be in tray
 * @param {object} widget the widget configuration
 */
const noHiddenOrStaticWidgets = w => !w.dataGrid || !w.dataGrid.static;

// hide hidden widgets in tray for users has not access to them
const filterHiddenWidgets = compose(
    defaultProps({
        "toolsOptions": {
            "seeHidden": "user.role===ADMIN"
        }
    }),
    // allow to customize toolsOptions object, with rules. see accessRuleParser
    editOptions("toolsOptions", { asObject: true }),
    withProps(({ widgets, toolsOptions = { seeHidden: false } }) => ({
        widgets: toolsOptions.seeHidden ? widgets : widgets.filter(w => !w.hide)
    }))
);

/**
 * A selector that retrieves widgets to display in the tray area
 * @return the widgets to display in the tray area
 */
const trayWidgets = createSelector(
    getFloatingWidgets,
    getCollapsedIds,
    getFloatingWidgetsCurrentLayout,
    getCollapsedState,
    (widgets = [], collapsedIds, layout, collapsed = {}) =>
        // sort, filter and add collapsed state to the widgets
        sortBy(
            // only non-static non-hidden widgets should be visible in tray
            widgets
            .filter(noHiddenOrStaticWidgets)
            // collapsed widgets should have the flag - Collapsed
            .map(w => findIndex(collapsedIds, id => id === w.id) >= 0
                ? {
                    ...w,
                    collapsed: true
                }
                : w),
            // sort by layout position (row, column)
            w => {
                const collapsedLayout = collapsed[w.id] && collapsed[w.id].layout;
                const position = find(layout, { i: w.id }) || collapsedLayout || {};
                const { x = 0, y = 0 } = position;
                return y * 100 + x;
            })
);

/**
 * Button bar with the list of widgets to
 * minimize/expand
 */
const WidgetsBar = compose(
    connect(
        createSelector(
            trayWidgets,
            widgets => ({ widgets })
        ),
        {
            onClick: toggleCollapse
        }
    ),
    defaultProps({
        btnGroupProps: {
            className: "widgets-toolbar",
            style: { marginLeft: 2, marginRight: 2 }
        }
    }),
    filterHiddenWidgets,
    withProps(({ btnGroupProps = {}, btnDefaultProps = {} }) => ({
        btnGroupProps: {
            bsSize: "xsmall",
            ...btnGroupProps
        },
        btnDefaultProps: {
            bsSize: "xsmall",
            ...(btnDefaultProps || {})
        }
    }))
)(require('../../components/widgets/view/WidgetsBar'));

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
            (widgets = []) => ({widgets})
        ), // TODO: get all collapsed
        {
            onClick: () => toggleCollapseAll()
        }
    ),
    filterHiddenWidgets,
    withProps(({widgets = []}) => ({
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
 * @prop {object} toolsOptions object that contains `showHidden` property rules to apply. see Widgets plugin configuration
 * @prop {boolean} expanded if true, it shows the list of widgets
 * @prop {function} setExpanded handler to toggle expand/collapse the tray
 */
class WidgetsTray extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        toolsOptions: PropTypes.object,
        expanded: PropTypes.bool,
        setExpanded: PropTypes.fun
    };
    static defaultProps = {
        enabled: true,
        expanded: false,
        setExpanded: () => { }
    };
    render() {
        return this.props.enabled
            ? (<div className="widgets-tray"
                style={{
                    marginBottom: 34,
                    marginRight: 60,
                    bottom: 0,
                    right: 0,
                    position: "absolute"
                }}>
                <BorderLayout
                    columns={[
                        <CollapseTrayButton toolsOptions={this.props.toolsOptions} expanded={this.props.expanded} onClick={() => this.props.setExpanded(!this.props.expanded)} />,
                        <CollapseAllButton toolsOptions={this.props.toolsOptions} />
                    ]}
                >{this.props.expanded ? <WidgetsBar toolsOptions={this.props.toolsOptions} /> : null}
                </BorderLayout>
            </div>)
            : null;
    }
}
module.exports = compose(
    withState("expanded", "setExpanded", false),
    connect(createSelector(
        trayWidgets,
        (widgets = []) => ({widgets})
    ), {
        toggleTray
    }),
    filterHiddenWidgets,
    withProps(({widgets = []}) => ({
        hasCollapsedWidgets: widgets.filter(({ collapsed } = {}) => collapsed).length > 0,
        hasTrayWidgets: widgets.length > 0
    })),
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
                .do(({ setExpanded = () => { }, hasCollapsedWidgets}) => setExpanded(hasCollapsedWidgets))
                .ignoreElements()
        )
    ),
    withProps(({ enabled, hasTrayWidgets }) => ({
        enabled: enabled && hasTrayWidgets
    }))
)(WidgetsTray);
