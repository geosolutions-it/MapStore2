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

const typesMap = {
    image,
    map
};
export const Media = ({ mediaType, ...props }) => {
    const MediaType = typesMap[mediaType];
    return <MediaType {...props} />;
};
export default typesMap;
