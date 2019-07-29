/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';


const Text = (props) => {
    return (
        <div className="ms-content ms-content-text" onClick={() => {
                // TODO: enable editing
        }} dangerouslySetInnerHTML={{ __html: props.html }} />
    );
};
export default Text;
