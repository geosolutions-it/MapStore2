/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import Content from '../../contents/Content';
import { compose, withState, withProps, withHandlers } from 'recompose';
import { findIndex, get } from "lodash";
import Background from './Background';

const holdBackground = compose(
    withState('backgroundId', "setBackgroundId", undefined),
    withHandlers({
        onVisibilityChange: ({ setBackgroundId = () => { } }) => ({ visible, id }) => visible && setBackgroundId(id)
    }),
    withProps(({ backgroundId, contents = [] }) => ({
        background: get(contents[findIndex(contents, { id: backgroundId }) || 0], 'background') || {
            type: 'none'
        }
    }))
);

/**
 * Paragraph Section Type.
 * Paragraph is a page block that expands for all it's height
 */
const Immersive = ({contents, mode, background, onVisibilityChange = () => {}, viewWidth, viewHeight }) => (
    <section
        className="ms-section ms-section-imersive">
        <Background
            width={viewWidth}
            height={viewHeight}>
            {background ? <img src={background.src}></img> : null}
        </Background>
        <div className="ms-section-contents">
            {contents.map((props) => (<Content mode={mode} onVisibilityChange={onVisibilityChange} {...props}/>))}
        </div>
    </section>
);

export default compose(
    holdBackground
)(Immersive);
