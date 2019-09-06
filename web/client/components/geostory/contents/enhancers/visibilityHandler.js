/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withHandlers } from 'recompose';
import withIntersectionObserver from '../../../misc/enhancers/withIntersectionObserver';
/**
 * Adds triggers and handles the visibility events for contents.
 * Transforms the handler onVisibilityChange parameter into an object with the following entries
 * - id: the id of the current handler that triggered the event
 * - visible: true if the
 * - entry: the IntersectionObserverEntry  of IntersectionObserver
 * @param {object} [options] the options to pass to withIntersectionObserver enhancer.
 */
export default (options) => compose(
    withHandlers({
        onVisibilityChange: ({ id, onVisibilityChange = () => { } } = {}) => (visible, entry) => onVisibilityChange({ id, visible, entry })
    }),
    withIntersectionObserver(options)
);
