/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React from 'react';
import { compose } from 'recompose';

import DragZone from '../../components/import/dragZone/DragZone.jsx';
import dropZoneHandlers from '../../components/import/dragZone/enhancers/dropZoneHandlers';
import processFile from './enhancers/processFile';
import useFile from './enhancers/useFile';
import ImportContent from './ImportContent';
import ImportSelectCRS from './ImportSelectCRS';

export default compose(
    processFile,
    useFile,
    dropZoneHandlers
)(
    ({
        onChangeCRS = () => {},
        onClose = () => {},
        onDrop = () => {},
        onRef = () => {},
        showProjectionCombobox,
        filterAllowedCRS,
        additionalCRS,
        crsSelectedDXF,
        ...props
    }) => (<DragZone
        onClose={onClose}
        onDrop={onDrop}
        onRef={onRef}
    >
        {[<ImportContent {...props}/>, showProjectionCombobox ?
            <ImportSelectCRS
                additionalCRS={additionalCRS}
                crsSelectedDXF={crsSelectedDXF}
                feature={props.flattenFeatures[0]}
                filterAllowedCRS={filterAllowedCRS}
                onChangeCRS={onChangeCRS}
                onChangeGeometry={props.onChangeGeometry}
                onClose={onClose}
            /> : null]}
    </DragZone>));
