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
const maskEnhancer = (showMask, maskContent, { maskContainerStyle, maskStyle, className, white }) => (A) => nest(
    (props) => (<div className={`ms2-mask-container ${className || ''} ${!showMask(props) && 'ms2-mask-empty' || ''}`} style={maskContainerStyle} >
        {props.children}
        {showMask(props) ? <div className={"ms2-mask" + (white ? " white-mask" : "")} style={maskStyle} >
            {maskContent(props)}
        </div> : null}
    </div>),
    A);
/**
 * Enhancer to gray out a component with a mask. The enhancer always adds a wrapper div with className="ms2-mask-container". if you want to avoid this use the option alwaysWrap = false.
 *
 * @param {function} showMask function that returns true if the mask have to be shown. Gets props as argument
 * @param {function} maskContent returns the content of the mask, gets props as argument TODO: allow any component
 * @param {object} options options for the mask:
 *  - alwaysWrap: true by default. if false, apply the enhancer only when showMask is true.
 *    This will cause a complete remount and re-render of the wrapped component, that may be a problem if you're using lifecycle methods, so by default is false
 *  - white: makes the mask background white, false by default
 */
module.exports = (
    showMask = () => {},
    maskContent = () => {},
    {
        alwaysWrap = true,
        white = false,
        maskContainerStyle = {},
        maskStyle = {},
        className
    } = {}
) => alwaysWrap
    ? maskEnhancer(showMask, maskContent, { maskContainerStyle, maskStyle, className, white })
    : branch(
        showMask,
        maskEnhancer(() => true, maskContent, { maskContainerStyle, maskStyle, white })
    );
