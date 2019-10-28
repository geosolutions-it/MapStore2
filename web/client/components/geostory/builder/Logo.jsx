/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
/**
 * Show the preview for the image
 */
// TODO use emptyState
export default ({
    className,
    src = "",
    width = 50,
    height = 50
}) =>  {
    return (<img className={className} src={src} width={width} height={height}/>);
};
