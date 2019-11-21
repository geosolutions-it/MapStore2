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

const WebPage = ({ src, width, height }) => (
    <div
        className="ms-webpage-wrapper"
        width={width}
        height={height}
    >
        <iframe src={src} />
    </div>
);

export default compose(
    branch(
        ({ src }) => !src,
        emptyState(
            ({src = "", width, height} = {}) => (!src || !width || !height),
            () => ({ glyph: "code" })
        )
    )
)(WebPage);
