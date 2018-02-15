 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const {ButtonGroup} = require('react-bootstrap');
const ToolbarButton = require('./ToolbarButton');
const {isFunction} = require('lodash');

const ReactCSSTransitionGroup = require('react-addons-css-transition-group');
/**
* A Generic Reusable Toolbar. Build in animations.
* @class Toolbar
* @memberof components.misc.toolbar
* @param  {Array}  [buttons=[]]       Array of buttons. Button objects support the follwing properties:
*  - *visible*: true by default, set to `false` to make the button disappear
*  - All the react-bootstrap buttons properties.
*  - All the properties for @see components.misc.enhancers
*  . All properties for @see components.misc.toolbar.ToolbarButton and react-bootstrap button
* @param  {Object} [btnDefaultProps] A serie of default Props for buttons
* @param  {Object} [transitionProps] properties of ReactCSSTransitionGroup
*/
module.exports = ({
   buttons = [],
   btnDefaultProps = {},
   btnGroupProps = {},
   transitionProps = {
       transitionName: "toolbar-btn-transition",
       transitionEnterTimeout: 300,
       transitionLeaveTimeout: 300
   }} = {}) =>
   (<ButtonGroup {...btnGroupProps}>
       <ReactCSSTransitionGroup {...transitionProps}>
           {buttons.map(({visible = true, ...props}, index) => {
               return visible ? (isFunction(props.el) && <props.el key={props.key || index} {...props} /> || <ToolbarButton key={props.key || index} {...btnDefaultProps} {...props} />) : null;
           })}
 </ReactCSSTransitionGroup>
 </ButtonGroup>);
