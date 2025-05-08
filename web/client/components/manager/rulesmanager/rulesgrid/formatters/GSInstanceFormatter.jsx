/**
* Copyright 2025, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
import React from 'react';

export default ({value = {}}) => (
    <div>
        <div>
            {value?.name || ""}
        </div>
    </div>
);
