import React from 'react';
import OverlayTrigger from '../../../misc/OverlayTrigger';
import { Tooltip } from 'react-bootstrap';

export default (Wrapped) => ({tooltip, id, placement, ...props}) =>
    (<OverlayTrigger placement={placement} overlay={<Tooltip id={`fe-${id}`}>{tooltip}</Tooltip>}>
        <Wrapped {...props}/>
    </OverlayTrigger>);
