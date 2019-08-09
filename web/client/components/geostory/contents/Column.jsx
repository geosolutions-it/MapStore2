/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import Content from './Content';

import AddBar from '../common/AddBar';
import { ContentTypes } from '../../../utils/GeoStoryUtils';
/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
export default ({ id, contents = {}, mode, add = () => {}, update= () => {}, viewWidth, viewHeight }) => (
    <div
        className="ms-content ms-content-column">
        <div className="ms-column-contents">
            {contents.map((props) => (<Content mode={mode} add={add} update={(path, ...args) => update(`contents[{"id": "${id}"}].` + path, ...args)} {...props}/>))}
        </div>
        <AddBar
            containerWidth={viewWidth}
            containerHeight={viewHeight}
            buttons={[
            {
                glyph: 'sheet',
                tooltip: 'Add immersive section',
                onClick: () => {
                    // TODO: add
                    add(`contents`, id, ContentTypes.TEXT);
                }
            }]}/>
    </div>
);
