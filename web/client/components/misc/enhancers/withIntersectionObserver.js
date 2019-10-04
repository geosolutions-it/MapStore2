/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import { InView } from 'react-intersection-observer';
import "intersection-observer";

/**
 * Enhancer that adds IntersectionObserver functionalities to trigger appear or disappear events in a scroll context.
 * Returns a component that uses IntersectionObserver to trigger handler. The wrapped component will receive `inView`, `inViewRef` and `inViewEntry` properties.
 * - `inViewRef`: **must** be attached as ref to the effective component that will need to intercept appear/disappear events.
 * - `inView`: boolean property passed to the contained element that shows if the element is visible or not. Useful to trigger some loading event (e.g. lazy loading of images)
 * - `inViewEntry` the entry object (the same passed to the handler)
 * Uses react-intersection-observer internally.
 * @memberof components.misc.enhancers
 * @example
 * const CMP = withIntersectionObserver({threshold: 0.5})(({inViewRef, inView}) => <div style={{height: 20}}ref={inViewRef}>{inView}</div> );
 * ReactDOM.render(<div style={{height: 50, overflow: 'auto'}}><div style={{height: 100}}></div><CMP onVisibilityChange={(...args) => console.log(args)} /></div>); //When CMP will be visible, the onVisibilityChange event will be triggered
 *
 * @param {function} onVisibilityChange handler of intersection event. (inView (boolean), entry (object)) are the handler's parameters.
 * - `inView` is true if the component is entered, false if it exited.
 * - `entry` contains more information about the entry. (e.g. intersectionRatio, in case of multiple threshold)
 * See `onChange` method in react-intersection-observer lib for more information about them.
 * @param {Element} [root=window] root object where the element should intersect.
 * @param {string} [rootMargin='0px'] Margin around the root. Can have values similar to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right, bottom, left).
 * @param {number|number[]} [threshold=0] Number between 0 and 1 indicating the percentage that should be visible before triggering. Can also be an array of numbers, to create multiple trigger points.
 * @param {boolean} [triggerOnce=false]	Only trigger this method once
 * @prop {function} onVisibilityChange handler of intersection event. (inView (boolean), entry (object)) are the handler's parameters. If present, it overrides the onVisibilityChange defined as parameter.
 * @prop {object} intersectionObserverOptions overrides for the params passed on enhancer creation (rootMargin, threshold, triggerOnce)
 */
export default ({ onVisibilityChange: onVisibilityChange, rootSelector, ...options } = {}) => (Component) => ({ intersectionObserverOptions = {}, onVisibilityChange: onVisibilityChange2, ...props }) => {
    const onChange = onVisibilityChange || onVisibilityChange2;
    return (<InView {...options} {...intersectionObserverOptions} onChange={onChange}>
        {({ inView, ref, entry }) => (<Component {...props} inView={inView} inViewRef={ref} inViewEntry={entry} />)}
    </InView>);
};
