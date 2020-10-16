/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const {branch} = require('recompose');
const { Tooltip } = require('react-bootstrap');
const OverlayTrigger = require('../OverlayTrigger');
const Message = require('../../I18N/Message');
const {omit} = require('lodash');
/**
 * Tooltip enhancer. Enhances an object adding a tooltip (with i18n support).
 * It is applied only if props contains `tooltip` or `tooltipId`. It have to be applied to a React (functional) component
 * @type {function}
 * @name tooltip
 * @memberof components.misc.enhancers
 * @prop {string|node} [tooltip] if present will add the tooltip. This is the full tooltip content
 * @prop {string} [tooltipId] if present will show a localized tooltip using the tooltipId as msgId
 * @prop {string} [tooltipPosition="top"]
 * @prop {string} tooltipTrigger see react overlay trigger
 * @example
 * render() {
 *   const Cmp = tooltip((props) =><El {...props}></El>); // or simply tooltip(El);
 *   return <Cmp tooltipId="Hello" tooltipPosition="left" /> // => render the component with tooltip
 * }
 *
 */
module.exports = branch(
    ({tooltip, tooltipId} = {}) => tooltip || tooltipId,
    (Wrapped) => ({tooltip, tooltipId, tooltipPosition = "top", tooltipTrigger, keyProp, idDropDown, args, customOverlayTrigger: CustomOverlayTrigger = OverlayTrigger, ...props} = {}) => (<CustomOverlayTrigger
        trigger={tooltipTrigger}
        id={idDropDown}
        key={keyProp}
        placement={tooltipPosition}
        overlay={<Tooltip id={"tooltip-" + keyProp}>{tooltipId ? <Message msgId={tooltipId} msgParams={{data: args}} /> : tooltip}</Tooltip>}><Wrapped {...props}/></CustomOverlayTrigger>),
    // avoid to pass non needed props
    (Wrapped) => (props) => <Wrapped {...(omit(props, ["tooltipId", "tooltip"]))}>{props.children}</Wrapped>
);
