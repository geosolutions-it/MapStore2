/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import DefaultContentToolbar from './ContentToolbar';
import { Modes, getClassNameFromProps, getThemeStyleFromProps } from "../../../utils/GeoStoryUtils";

/**
 * Container for all the contents. Is used to:
 *  - center the content accordingly.
 *  - Add inViewRef property, to apply IntersectionObserver
 */
export default ({ id, inViewRef, children, type, contentWrapperStyle, contentToolbar, mode, ...props }) => {
    const ContentToolbar = contentToolbar || DefaultContentToolbar;
    return (<div
        id={id}
        ref={inViewRef}
        style={contentWrapperStyle}
        className={`ms-content ms-content-${type}${getClassNameFromProps(props)}`}>
        <div className="ms-content-body" style={getThemeStyleFromProps(props)}>
            {mode === Modes.EDIT
                && <ContentToolbar
                    {...props}/>}
            {children}
        </div>
    </div>);
};
