 /*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const React = require('react');
const {branch} = require('recompose');
const { Tooltip, OverlayTrigger} = require('react-bootstrap');
const Message = require('../../I18N/Message');

/**
 * Tooltip enhancer. Enhances an object adding a (localizable) tooltip.
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
    // TODO return proper HOC
    (Wrapped) => ({tooltip, tooltipId, tooltipPosition = "top", tooltipTrigger, key, ...props} = {}) => (<OverlayTrigger
        trigger={tooltipTrigger}
        key={key}
        placement={tooltipPosition}
        overlay={<Tooltip id={"tooltip-" + {key}}>{tooltipId ? <Message msgId={tooltipId} /> : tooltip}</Tooltip>}><Wrapped {...props}/></OverlayTrigger>));
