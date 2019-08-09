/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import Content from '../../contents/Content';

import AddBar from '../../common/AddBar';
import { SectionTypes } from '../../../../utils/GeoStoryUtils';
/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
export default ({ id, contents, mode, add = () => {}, update= () => {}, viewWidth, viewHeight }) => (
    <section
        className="ms-section ms-section-paragraph">
        <div className="ms-section-contents">
            {contents.map((props) => (<Content mode={mode} add={add} update={update} sectionId={id} {...props}/>))}
        </div>
        <AddBar
            containerWidth={viewWidth}
            containerHeight={viewHeight}
            buttons={[{
                glyph: 'font',
                tooltip: 'Add title section',
                onClick: () => {
                    add(`sections`, id, SectionTypes.TITLE);
                }
            },
            {
                glyph: 'sheet',
                tooltip: 'Add paragraph section',
                onClick: () => {
                    add(`sections`, id, SectionTypes.PARAGRAPH);
                }
            },
            {
                glyph: 'book',
                tooltip: 'Add immersive section',
                onClick: () => {
                    // TODO: add
                    add(`sections`, id, SectionTypes.IMMERSIVE);
                }
            }]}/>
    </section>
);
