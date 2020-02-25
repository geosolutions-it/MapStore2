/*
 * Copyright 201, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import RCopyToClipboard from 'react-copy-to-clipboard';
import tooltip from '../misc/enhancers/tooltip';
import { Button, Glyphicon } from 'react-bootstrap';

const CopyToClipboard = tooltip(RCopyToClipboard);

const ShareCopyToClipboard = ({
    shareUrl = '',
    copied = false,
    onCopy = () => {},
    onMouseLeave = () => {}
}) => {
    return (
        <CopyToClipboard
            text={shareUrl}
            tooltipId={copied ? 'share.msgCopiedUrl' : 'share.msgToCopyUrl'}
            tooltipPosition="bottom"
            key={copied.toString()}
            onCopy={ () => onCopy(shareUrl) } >
            <Button
                bsStyle="primary"
                onMouseLeave={() => onMouseLeave()} >
                <Glyphicon glyph="copy"/>
            </Button>
        </CopyToClipboard>
    );
};

export default ShareCopyToClipboard;
