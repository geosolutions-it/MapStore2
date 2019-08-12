/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import Content from './Content';
import Contents from './Contents';


import { ContentTypes } from '../../../utils/GeoStoryUtils';
/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
export default ({ id, contents = {}, mode, add = () => {}, update= () => {} }) => (
    <div
        className="ms-content ms-content-column">
        <Contents
            className="ms-column-contents"
            ContentComponent={Content}
            contents={contents}
            mode={mode}
            add={add}
            update={update}
            addButtons={[{
                glyph: 'sheet',
                tooltip: 'geostory.addTextContent',
                template: ContentTypes.TEXT
            }]}
            />
    </div>
);
