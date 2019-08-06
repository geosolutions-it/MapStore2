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

import AddBar from '../../common/AddBar';
import { SectionTypes } from '../../../../utils/GeoStoryUtils';
/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
const Immersive = ({id, contents = [], mode, background = {}, onVisibilityChange = () => {}, viewWidth, viewHeight, addSection = () => {} }) => (
    <section
        className="ms-section ms-section-immersive">
        <Background
            { ...background }
            key={background.id}
            width={viewWidth}
            height={viewHeight}/>
        <div className="ms-section-contents">
            {contents.map((props) => (<Content mode={mode} onVisibilityChange={onVisibilityChange} {...props} contentWrapperStyle={{ minHeight: viewHeight }}/>))}
        </div>
        <AddBar
            containerWidth={viewWidth}
            containerHeight={viewHeight}
            conatinerSelector=".ms-sections-container"
            buttons={[{
                glyph: 'font',
                tooltip: 'Add title section',
                onClick: () => {
                    addSection(SectionTypes.TITLE, id);
                }
            },
            {
                glyph: 'sheet',
                tooltip: 'Add paragraph section',
                onClick: () => {
                    addSection(SectionTypes.PARAGRAPH, id);
                }
            },
            {
                glyph: 'book',
                tooltip: 'Add immersive section',
                onClick: () => {
                    // TODO: add
                    addSection(SectionTypes.IMMERSIVE, id);
                }
            }]}/>
    </section>
);

export default immersiveBackgroundManager(Immersive);
