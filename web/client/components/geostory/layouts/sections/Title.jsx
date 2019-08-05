/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import Content from '../../contents/Content';
import Background from './Background';
import { backgroundProp } from './enhancers/immersiveBackgroundManager';
/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
export default backgroundProp(({ background = {}, contents = [], mode, viewWidth, viewHeight }) => (
    <section
        className="ms-section ms-section-title">
        <Background
            { ...background }
            key={background.id}
            width={viewWidth}
            height={viewHeight}/>
        <div className="ms-section-contents">
            {contents.map((props) => (<Content mode={mode} {...props} contentWrapperStyle={{ minHeight: viewHeight }}/>))}
        </div>
    </section>
));
