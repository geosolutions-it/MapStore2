/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { compose, branch } from 'recompose';
import emptyState from '../../misc/enhancers/emptyState';
import { getWebPageComponentHeight } from '../../../utils/GeoStoryUtils';

const WebPage = ({ src, size, viewHeight }) => (
    <div className="ms-webpage-wrapper" >
        <iframe
            src={src}
            height={`${getWebPageComponentHeight(size, viewHeight)}px`}
        />
    </div>
);

export default compose(
    branch(
        ({ src = "", viewHeight, size } = {}) => (!src || !viewHeight || !size),
        emptyState(
            () => true,
            () => ({ glyph: "code" })
        )
    )
)(WebPage);
