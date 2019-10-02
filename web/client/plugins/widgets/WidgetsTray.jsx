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
const { compose, withProps, withState, lifecycle, mapPropsStream } = require('recompose');
const { createSelector } = require('reselect');
const tooltip = require('../../components/misc/enhancers/tooltip');

const { Glyphicon, Button: BButton } = require('react-bootstrap');
const Button = tooltip(BButton);
const { getVisibleFloatingWidgets } = require('../../selectors/widgets');
const { toggleCollapseAll, toggleTray } = require('../../actions/widgets');
const { trayWidgets } = require('../../selectors/widgetsTray');
const { filterHiddenWidgets } = require('./widgetsPermission');
const BorderLayout = require('../../components/layout/BorderLayout');
const WidgetsBar = require('./WidgetsBar');
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
        setExpanded: PropTypes.func
    };
    static defaultProps = {
        enabled: true,
        items: [],
        expanded: false,
        setExpanded: () => { }
    };
    render() {
        return this.props.enabled
            ? (<div className="widgets-tray"
                style={{
                    marginBottom: 32,
                    marginRight: 80,
                    bottom: 0,
                    right: 0,
                    position: "absolute"
                }}>
                <BorderLayout
                    columns={[
                        <CollapseTrayButton key="collapse-tray" toolsOptions={this.props.toolsOptions} expanded={this.props.expanded} onClick={() => this.props.setExpanded(!this.props.expanded)} />,
                        <CollapseAllButton key="collapse-all" toolsOptions={this.props.toolsOptions} />,
                        ...(this.props.items.map( i => i.tool) || [])
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
        (widgets = []) => ({ widgets })
    ), {
        toggleTray
    }),
    filterHiddenWidgets,
    withProps(({ widgets = [] }) => ({
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
                .do(({ setExpanded = () => { }, hasCollapsedWidgets }) => setExpanded(hasCollapsedWidgets))
                .ignoreElements()
        )
    ),
    withProps(({ enabled, hasTrayWidgets }) => ({
        enabled: enabled && hasTrayWidgets
    }))
)(WidgetsTray);
