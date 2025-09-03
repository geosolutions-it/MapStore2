/*
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import React, { useEffect, useState } from 'react';
import { Tooltip } from 'react-bootstrap';
import OverlayTrigger from '../OverlayTrigger';
import Message from '../../I18N/Message';
import useIsMounted from '../../../hooks/useIsMounted';

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
 * @prop {object} tooltipParams parameter to pass to the tooltip message id
 * @prop {number} tooltipShowDelay add a delay in milliseconds before showing the tooltip on mount and when the tooltip identifier change, useful for transitions in toolbar (default 100ms)
 * @example
 * render() {
 *   const Cmp = tooltip((props) =><El {...props}></El>); // or simply tooltip(El);
 *   return <Cmp tooltipId="Hello" tooltipPosition="left" /> // => render the component with tooltip
 * }
 *
 */
const withTooltip = (Wrapped) => {

    const WitTooltip = ({
        tooltip,
        tooltipId,
        tooltipPosition = "top",
        tooltipTrigger,
        keyProp, // TODO: it would be nice to merge the concept of keyProp and idDropDown in a single prop (eg. tooltipKey) or use directly tooltipId
        idDropDown, // TODO: it seems a specific implementation, check if it can replaced with a more generic prop
        tooltipParams,
        args, // TODO: args has the same use of params, we should remove this and use tooltipParams instead
        children,
        tooltipShowDelay = 100,
        ...props
    } = {}) => {

        const isMounted = useIsMounted();

        // apply a delay to tooltip in case of transition in between different identifier
        // tooltipShowDelay is used for testing set to 0
        const [showTooltip, setShowTooltip] = useState(!(tooltipId && tooltipShowDelay > 0 ));
        useEffect(() => {
            if (tooltipId && tooltipShowDelay > 0) {
                setShowTooltip(false);
                setTimeout(() => {
                    isMounted(() => {
                        setShowTooltip(true);
                    });
                }, tooltipShowDelay);
            }
        }, [tooltipId, tooltipShowDelay]);

        const content = (<Wrapped {...props}>{children}</Wrapped>);

        if (showTooltip && (tooltip || tooltipId)) {
            return (
                <OverlayTrigger
                    trigger={tooltipTrigger}
                    id={idDropDown}
                    key={keyProp}
                    placement={tooltipPosition}
                    overlay={
                        <Tooltip id={"tooltip-" + keyProp}>
                            {tooltipId ? <Message msgId={tooltipId} msgParams={{ data: args, ...tooltipParams }} /> : tooltip}
                        </Tooltip>
                    }>
                    {content}
                </OverlayTrigger>
            );
        }

        return content;
    };

    return WitTooltip;
};

export default withTooltip;
