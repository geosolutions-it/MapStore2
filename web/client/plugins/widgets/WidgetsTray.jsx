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


const WidgetsBar = compose(
    connect(
        createSelector(
            getFloatingWidgets,
            getCollapsedIds,
            (widgets = [], collapsedIds) => ({
                widgets: widgets.map(w => findIndex(collapsedIds, id => id === w.id) >= 0
                    ? {
                        ...w,
                        collapsed: true
                    }
                    : w)
            })
        ), {
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

const TrayTitle = () =>
    (<span style={{ order: -1, margin: 2, marginRight: 5 }}>
        <Message msgId="widgets.tray.title" />
    </span>);

const CollapseTrayButton = ({expanded, onClick=() => {}} = {}) =>
    (<Button
        tooltipId={expanded ? "widgets.tray.collapseTray" : "widgets.tray.expandTray"}
        style={{ order: -1}}
        bsSize="xsmall"
        bsStyle="primary"
        onClick={onClick}>
            <Glyphicon glyph={expanded ? "chevron-right" : "chevron-left"} />
    </Button>);

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
module.exports = withState("expanded", "setExpanded", false)(WidgetsTray);
