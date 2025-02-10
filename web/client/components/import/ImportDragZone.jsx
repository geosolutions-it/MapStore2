/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import DragZone from './dragZone/DragZone.jsx';
import Content from './dragZone/Content';
import processFiles from './dragZone/enhancers/processFiles';
import useFiles from './dragZone/enhancers/useFiles';
import dropZoneHandlers from './dragZone/enhancers/dropZoneHandlers';
import { compose } from 'recompose';

export default compose(
    processFiles,
    useFiles,
    dropZoneHandlers
)(
    ({
        onClose = () => {},
        onDrop = () => {},
        onRef = () => {},
        ...props
    }) => <DragZone
        onClose={onClose}
        onDrop={(files) => {
            return onDrop({ files, options: { importedVectorFileMaxSizeInMB: props.importedVectorFileMaxSizeInMB} });
        }}
        onRef={onRef}
    >
        <Content {...props} />
    </DragZone>);
