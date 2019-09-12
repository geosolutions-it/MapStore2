/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";

export default ({
    // selectedItem
}) => {
    // const src = selectedItem && selectedItem.data && selectedItem.data.src;
    return (
        <div key="preview" style = {{ width: '100%', height: '100%', boxShadow: "inset 0px 0px 30px -5px rgba(0,0,0,0.16)" }}>
            Map Preview
        </div>
    );
};
