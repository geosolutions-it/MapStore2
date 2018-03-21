 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const { ButtonGroup} = require('react-bootstrap');
const ToolbarButton = require('./ToolbarButton');

const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
/**
 * A Generic Reusable Toolbar. Build in animations.
 * @class Toolbar
 * @memberof components.misc.toolbar
 * @param  {Array}  [buttons=[]]       Array of buttons. Button objects support the following properties:
 *  - *visible*: true by default, set to `false` to make the button disappear
 *  - All the react-bootstrap buttons properties.
 *  - All the properties for @see components.misc.enhancers
 *  . All properties for @see components.misc.toolbar.ToolbarButton and react-bootstrap button
 * @param  {Object} [btnDefaultProps] A series of default Props for buttons
 * @param  {Object} [btnGroupProps] Props to add to the react-bootstrap `ButtonGroup` component
 * @param  {Object|boolean} [transitionProps] properties of ReactCSSTransitionGroup. If false transition are  disabled. (for vertical toolbar)
 */
module.exports = ({
    buttons = [],
    btnGroupProps={},
    btnDefaultProps = {},
    transitionProps = {
        transitionName: "toolbar-btn-transition",
        transitionEnterTimeout: 300,
        transitionLeaveTimeout: 300
    }} = {}) => {
        const renderButtons = () => buttons.map(
            ({ visible = true, ...props }, index) => visible
                ? (<ToolbarButton key={props.key || index} {...btnDefaultProps} {...props} />)
                : null
        );
        return (<ButtonGroup {...btnGroupProps}>
            {transitionProps
                ? <ReactCSSTransitionGroup {...transitionProps}>{renderButtons()}</ReactCSSTransitionGroup>
                : renderButtons()}
            </ButtonGroup>);
    };
