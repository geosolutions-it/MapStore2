/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { Button: RButton, Glyphicon } = require('react-bootstrap');
const { setCollapsed } = require('../../actions/timeline');
const { isCollapsed, hasLayers } = require('../../selectors/timeline');


const { compose, withHandlers, withProps, renderNothing, branch } = require('recompose');
const tooltip = require('../../components/misc/enhancers/tooltip');


const {createSelector} = require('reselect');
const { connect } = require('react-redux');
const Button = tooltip(RButton);

const ToggleButton = (props) => (<Button
    {...props}
    bsSize="xsmall"
><Glyphicon glyph="time" /></Button>);

/**
 * Toggle button for timeline hide (collapse)/show functionality for timeline.
 * Visible in the WidgetsTray, when present
 */
module.exports = compose(
    connect(
        createSelector(
            isCollapsed,
            hasLayers,
            (collapsed, visible) => ({
                collapsed,
                visible
            })
        ),
        {
            setCollapsed
        }
    ),
    branch(({ visible }) => !visible, renderNothing),
    withHandlers({
        onClick: ({ collapsed, setCollapsed: handler }) => () => handler(!collapsed)
    }),
    withProps(({collapsed}) => ({
        bsStyle: collapsed ? "primary" : "success active",
        tooltipId: collapsed ? "timeline.show" : "timeline.hide"
        })
    )
)(ToggleButton);
