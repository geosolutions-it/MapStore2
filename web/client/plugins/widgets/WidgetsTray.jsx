/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');
const { compose, withProps, withState, defaultProps} = require('recompose');
const {createSelector} = require('reselect');
const { findIndex } = require('lodash');
const tooltip = require('../../components/misc/enhancers/tooltip');

const {Glyphicon, Button: BButton} = require('react-bootstrap');
const Button = tooltip(BButton);
const { getFloatingWidgets, getVisibleFloatingWidgets, getCollapsedIds } = require('../../selectors/widgets');
const { toggleCollapse, toggleCollapseAll } = require('../../actions/widgets');

const Message = require('../../components/I18N/Message');
const BorderLayout = require('../../components/layout/BorderLayout');

/**
 * A selector that retrieves widgets to display in the tray area
 * @return the widgets to display in the tray area
 */
const trayWidgets = createSelector(
    getFloatingWidgets,
    getCollapsedIds,
    (widgets = [], collapsedIds) => widgets
            .filter(w => !w.hide && (!w.dataGrid || !w.dataGrid.static))
            .map(w => findIndex(collapsedIds, id => id === w.id) >= 0
                ? {
                    ...w,
                    collapsed: true
                }
                : w)
);

/**
 * Button bar with the list of widgets to
 * minimize/expand
 */
const WidgetsBar = compose(
    connect(
        createSelector(
            trayWidgets,
            widgets => ({widgets})
        ),
        {
            onClick: toggleCollapse
        }
    ),
    defaultProps({
        btnGroupProps: {
            className: "widgets-toolbar"
        }
    }),
    withProps( ({btnGroupProps = {}, btnDefaultProps = {}}) => ({
        btnGroupProps: {
            bsSize: "xsmall",
            ...btnGroupProps
        },
        btnDefaultProps: {
            bsSize: "xsmall",
            ...(btnDefaultProps || {})
        }
    })),
)(require('../../components/widgets/view/WidgetsBar'));

/**
 * The title of the tray
 */
const TrayTitle = () =>
    (<span style={{ order: -1, margin: 2, marginRight: 5 }}>
        <Message msgId="widgets.tray.title" />
    </span>);

/**
 * Button that allows collapse/Expand functionality of the tray.
 * @param {object} props
 */
const CollapseTrayButton = ({expanded, onClick=() => {}} = {}) =>
    (<Button
        tooltipId={expanded ? "widgets.tray.collapseTray" : "widgets.tray.expandTray"}
        style={{ order: -1}}
        bsSize="xsmall"
        bsStyle="primary"
        onClick={onClick}>
            <Glyphicon glyph={expanded ? "chevron-right" : "chevron-left"} />
    </Button>);

/**
 * Button to collapse/expand all widgets
 */
const CollapseAllButton = connect(
    createSelector(
        getVisibleFloatingWidgets,
        ( visible = [] ) => ({
            shouldExpand: visible.filter(w => !w.dataGrid || !w.dataGrid.static).length === 0
        })
    ), // TODO: get all collapsed
    {
        onClick: () => toggleCollapseAll()
    }
)(({ onClick = () => { }, shouldExpand = false} = {}) =>
    (<Button
        tooltipId={ shouldExpand ? "widgets.tray.expandAll" : "widgets.tray.collapseAll"}
        bsStyle={ shouldExpand ? "primary" : undefined}
        style={{ order: -1 }}
        bsSize="xsmall"
        onClick={onClick}>
            <Glyphicon glyph={"list"} />
    </Button>));


/**
 * Main component of the widgets tray.
 * @prop {boolean} enabled if true, the component is enabled and visible
 * @prop {boolean} expanded if true, it shows the list of widgets
 * @prop {function} setExpanded handler to toggle expand/collapse the tray
 */
class WidgetsTray extends React.Component {
    static propTypes = {
        enabled: PropTypes.bool,
        expanded: PropTypes.bool,
        setExpanded: PropTypes.fun
    };
    static defaultProps = {
        enabled: true,
        expanded: false,
        setExpanded: () => {}
    };
    render() {
        return this.props.enabled
            ? (<div className="widgets-tray"
                style={{
                    marginBottom: 31,
                    marginRight: 60,
                    bottom: 0,
                    right: 0,
                    position: "absolute"
                }}>
                <BorderLayout
                    columns={[
                        <CollapseTrayButton expanded={this.props.expanded} onClick={() => this.props.setExpanded(!this.props.expanded)}/>,
                        <CollapseAllButton />,
                        <TrayTitle />
                    ]}
                >{this.props.expanded ? <WidgetsBar /> : null}
                </BorderLayout>
                </div>)
        : null;
    }
}
module.exports = compose(
    withState("expanded", "setExpanded", false),
    connect(createSelector(
            trayWidgets,
            (widgets = []) => ({
                hasTrayWidgets: widgets.length > 0
            })
    )),
    withProps(({ enabled, hasTrayWidgets}) => ({
        enabled: enabled && hasTrayWidgets
    }))
)(WidgetsTray);
