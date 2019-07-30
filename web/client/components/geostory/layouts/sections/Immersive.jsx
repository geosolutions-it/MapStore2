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
const Immersive = ({ className = '', contents, type, mode, background, onVisibilityChange = () => {} }) => (
    <div
        className={`${className} ms-section-immersive`}>
        <div className="ms-section-background">
            <div className="ms-section-background-container">
                {background ? <img src={background.src}></img> : null}
            </div>
        </div>
        <div className={`ms-section-contents ms-section-contents-${type}`}>
            {contents.map((props) => (<Content mode={mode} onVisibilityChange={onVisibilityChange} {...props}/>))}
        </div>
    </div>
);

export default compose(
    holdBackground
)(Immersive);
