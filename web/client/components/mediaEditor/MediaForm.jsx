/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {MediaTypes} from '../../utils/GeoStoryUtils';
import ImageForm from './image/ImageForm';
import MapForm from './map/MapForm';

const types = {
    [MediaTypes.IMAGE]: ImageForm,
    [MediaTypes.MAP]: MapForm
};


export default (props) => {
    const Form = types[props.mediaType || MediaTypes.IMAGE];
    return <Form {...props}/>;
};
