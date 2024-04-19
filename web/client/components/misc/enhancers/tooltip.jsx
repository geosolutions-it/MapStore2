/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React from 'react';

import { branch } from 'recompose';
import { Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../OverlayTrigger';
import Message from '../../I18N/Message';
import { omit } from 'lodash';

/**
 * Tooltip enhancer. Enhances an object adding a tooltip (with i18n support).
 * It is applied only if props contains `tooltip` or `tooltipId`. It has to be applied to a React (functional) component.
 * The tooltip text will also be added as `aria-label` prop to the object in order to increase a11y.
 * Note that if you add an i18n `Message` as a tooltip, it will be reconstructed around the tooltip so that its
 * text is also available in the `aria-label` property. Passing other `node`s as tooltips is strongly discouraged,
 * since it will result in an `[object Object]` `aria-label` which will help nobody.
 * @type {function}
 * @name tooltip
 * @memberof components.misc.enhancers
 * @prop {string|node} [tooltip] if present will add the tooltip. This is the full tooltip content.
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
export default branch(
    ({tooltip, tooltipId} = {}) => tooltip || tooltipId,
    (Wrapped) => ({tooltip, tooltipId, tooltipPosition = "top", tooltipTrigger, keyProp, idDropDown, args, ...props} = {}) =>
        (tooltipId || (tooltip.props && tooltip.props.msgId) // this is not DRY, but constructing the <Message> within the OverlayTrigger prevents it from working
            ? <Message msgId={tooltipId ? tooltipId : tooltip.props.msgId} msgParams={tooltip && tooltip.props && tooltip.props.msgParams ? tooltip.props.msgParams : {data: args}}>
                { (msg) => <OverlayTrigger
                    trigger={tooltipTrigger}
                    id={idDropDown}
                    key={keyProp}
                    placement={tooltipPosition}
                    overlay={<Tooltip id={"tooltip-" + keyProp}>{msg}</Tooltip>}>
                    <Wrapped {...props}
                        aria-label={msg}/></OverlayTrigger> }
            </Message>
            : <OverlayTrigger
                trigger={tooltipTrigger}
                id={idDropDown}
                key={keyProp}
                placement={tooltipPosition}
                overlay={<Tooltip id={"tooltip-" + keyProp}>{tooltipId ? <Message msgId={tooltipId} msgParams={{data: args}} /> : tooltip}</Tooltip>}>
                <Wrapped {...props}
                    aria-label={tooltip}/></OverlayTrigger>),
    // avoid to pass non needed props
    (Wrapped) => (props) => <Wrapped {...(omit(props, ["tooltipId", "tooltip", "tooltipPosition"]))}>{props.children}</Wrapped>
);
