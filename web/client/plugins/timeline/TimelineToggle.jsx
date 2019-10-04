/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Rx = require('rxjs');
const Message = require('../../components/I18N/Message');

const { Button: RButton, Glyphicon } = require('react-bootstrap');
const { setCollapsed } = require('../../actions/timeline');
const { isCollapsed, hasLayers } = require('../../selectors/timeline');


const { compose, withHandlers, withProps, renderNothing, branch, mapPropsStream } = require('recompose');
const tooltip = require('../../components/misc/enhancers/tooltip');


const {createSelector} = require('reselect');
const { connect } = require('react-redux');

const withPopover = require('../../components/data/featuregrid/enhancers/withPopover');

/**
 * Creates the properties to toggle the hint popover.
 * @param {Rx.Observable} props$ stream of props
 */
const togglePopover = props$ =>
    props$
        // only the first time collapsed property is set to true
        .distinctUntilKeyChanged('collapsed')
        .filter(({ collapsed }) => collapsed)
        .take(1)
        // show popover for 5 seconds
        .switchMap(({ collapseHintPopoverOptions }) =>
            Rx.Observable.timer(5000)
                .startWith({
                    popoverOptions: collapseHintPopoverOptions
                })
                .concat(Rx.Observable.of({
                }))
        ).startWith({});

/**
 * Combine render props with ones coming from the stream
 */
const withTempHintPopover = () =>
    compose(
        withProps({
            collapseHintPopoverOptions: {
                placement: 'top',
                props: {
                    title: <span><Glyphicon glyph="time" /> <strong><Message msgId="timeline.collapsed.title" /></strong></span>
                },
                content: <Message msgId="timeline.collapsed.tooltip" />
            }
        }),
        mapPropsStream(props$ =>
            props$.combineLatest(
                togglePopover(props$),
                (p1, p2) => ({
                    ...p1, ...p2
                })
            )
        ),
        branch(({ popoverOptions }) => popoverOptions, withPopover, tooltip)
    );

const Button = withTempHintPopover()(RButton);
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
        bsStyle: collapsed ? "primary" : "success",
        tooltipId: collapsed ? "timeline.show" : "timeline.hide"
    })
    )
)(ToggleButton);
