/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const {branch} = require('recompose');
const {omit} = require('lodash');

const tooltip = require('./tooltip');
/**
 * Button Tooltip enhancer. Enhances an object adding a tooltip (with i18n support).
 * It is applied only if props contains `tooltip` or `tooltipId` and if noTooltipWhenDisabled === true
 * the tooltip not applied if the button is disabled. It have to be applied to a React (functional) component
 * @type {function}
 * @name buttonTooltip
 * @memberof components.misc.enhancers
 * @prop {string|node} [tooltip] if present will add the tooltip. This is the full tooltip content
 * @prop {string} [tooltipId] if present will show a localized tooltip using the tooltipId as msgId
 * @prop {boolean} [noTooltipWhenDisabled] if true the tooltip is not applied in case of disabled btn
 * @prop {string} [tooltipPosition="top"]
 * @prop {string} tooltipTrigger see react overlay trigger
 * @example
 * render() {
 *   const Cmp = tooltip((props) =><El {...props}></El>); // or simply tooltip(El);
 *   return <Cmp tooltipId="Hello" tooltipPosition="left" noTooltipWhenDisabled={true} /> // => render the component with tooltip
 * }
 *
 */
module.exports = branch(
    ({disabled, noTooltipWhenDisabled = false} = {}) => !(noTooltipWhenDisabled && disabled),
    tooltip,
    (Wrapped) => (props) => <Wrapped {...(omit(props, ["tooltipId", "tooltip", "noTooltipWhenDisabled"]))}>{props.children}</Wrapped>
);
