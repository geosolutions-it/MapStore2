/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {branch, nest} = require('recompose');
/**
 * Add a grayed out mask to a component.
 * @param {function} showMask gets props as argument and returns true if the enhancer should be applied
 * @param {*} maskContent the content of the mask
 */
const maskEnhancer = (visible, maskContent, { maskContainerStyle, maskStyle }) => (A) => nest(
    (props) => (<div style={maskContainerStyle} >
        {props.children}
        <div style={{ ...maskStyle, visibility: visible(props) ? 'visible' : 'hidden'}} >
            {maskContent(props)}
        </div>
    </div>),
    A);
module.exports = (
        showMask = () => {},
        maskContent = () => {},
        {
            alwaysWrap = false,
            maskContainerStyle = { width: "100%", height: "100%", position: "relative" },
            maskStyle = { backgroundColor: "rgba(0, 0, 0, 0.7)", color: "#fff", display: 'flex', zIndex: 1000, width: "100%", height: "100%", position: 'absolute', top: 0 }
        } = {}
    ) => alwaysWrap
        ? maskEnhancer(showMask, maskContent, { maskContainerStyle, maskStyle })
        : branch(
            showMask,
            maskEnhancer(() => true, maskContent, { maskContainerStyle, maskStyle })
        );
