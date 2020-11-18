/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import CoordinatesRow from '../../../misc/coordinateeditors/CoordinatesRow';
import { isEmpty } from 'lodash';

const Editor = (props) => (
    <CoordinatesRow
        format={props.formatCoord || "decimal"}
        aeronauticalOptions={{
            seconds: {
                decimals: 4,
                step: 0.0001
            }
        }}
        idx={1}
        onSubmit={(id, value) => {
            props.onSubmit(isEmpty(value) ? undefined : value);
        }}
        onChangeFormat={(format) => {
            props.onChangeFormat(format);
        }}
        key="GFI row coord editor"
        component={props.coordinate || {}}
        customClassName="coord-editor"
        isDraggable={false}
        showDraggable={false}
        formatVisible
        showLabels
        removeVisible={false}
    />);

export default Editor;
