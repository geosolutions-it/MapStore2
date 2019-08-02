/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import Content from '../../contents/Content';
import immersiveBackgroundManager from "./enhancers/immersiveBackgroundManager";
import Background from './Background';

/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
const Immersive = ({contents = [], mode, background = {}, onVisibilityChange = () => {}, viewWidth, viewHeight }) => (
    <section
        className="ms-section ms-section-immersive">
        <Background
            { ...background }
            key={background.id}
            width={viewWidth}
            height={viewHeight}/>
        <div className="ms-section-contents">
            {contents.map((props, i) => (<Content mode={mode} onVisibilityChange={onVisibilityChange} intersectionObserverOptions={i === 0 ? {threshold: 0} : undefined} {...props} contentWrapperStyle={{ minHeight: viewHeight }}/>))}
        </div>
    </section>
);

export default immersiveBackgroundManager(Immersive);
