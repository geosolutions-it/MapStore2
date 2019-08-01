/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";

/**
 * Container for all the contents. Is used to:
 *  - center the content accordingly.
 *  - Add inViewRef property, to apply IntersectionObserver
 */
export default ({ inViewRef, children, type, contentWrapperStyle }) =>
(<div
    ref={inViewRef}
    style={contentWrapperStyle}
    className={`ms-content ms-content-${type}`}>
        <div className="ms-content-body">
            {children}
        </div>
</div>);
