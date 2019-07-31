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

/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
export default ({ className = '', contents, mode, viewWidth, viewHeight }) => (
    <section
        className="ms-section ms-section-title"
        style={{ minHeight: viewHeight }}>
        <Background
            width={viewWidth}
            height={viewHeight}>
                <img src="https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80"></img>
        </Background>
        <div className="ms-section-contents">
            {contents.map((props) => (<Content mode={mode} {...props}/>))}
        </div>
    </section>
);
