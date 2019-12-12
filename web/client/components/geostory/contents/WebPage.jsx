/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { compose } from 'recompose';
import { getWebPageComponentHeight } from '../../../utils/GeoStoryUtils';
import { webPagePlaceholderEnhancer } from './enhancers/editURL';

export const WebPage = ({ src, size, viewHeight }) => (
    <div className="ms-webpage-wrapper">
        <iframe
            src={src}
            height={`${getWebPageComponentHeight(size, viewHeight)}px`}
        />
    </div>
);

export default compose(
    webPagePlaceholderEnhancer
)(WebPage);
