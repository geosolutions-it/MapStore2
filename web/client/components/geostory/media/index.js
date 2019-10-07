/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import image from './Image';
import map from './Map';

export const Image = image;
const typesMap = {
    image,
    map
};
export const Media = ({ mediaType, type, ...props }) => {
    const MediaType = typesMap[mediaType || type] || Image;
    return <MediaType {...props} />;
};
export default typesMap;
