/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {withHandlers, defaultProps} = require('recompose');
const MapInfoUtils = require('../../../../utils/MapInfoUtils');

/**
 * Enhancer for setting page index of Default Viewer in DefaultViewer/IdentifyContainer plugin
 * - onNext: set next index
 * - onPrevious: set previous index
 * @memberof enhancers.defaultViewerHandlers
 * @class
 */
const defaultViewerHandlers = withHandlers({
    onNext: ({index = 0, setIndex = () => {}, validResponses = []}) => () => {
        setIndex(Math.min(validResponses.length - 1, index + 1));
    },
    onPrevious: ({index, setIndex = () => {}}) => () => {
        setIndex(Math.max(0, index - 1));
    }
});


/**
 * Set the default props of DefaultViewer
 * @memberof enhancers.defaultViewerDefaultProps
 * @class
 */
const defaultViewerDefaultProps = defaultProps({
    format: MapInfoUtils.getDefaultInfoFormatValue(),
    validator: MapInfoUtils.getValidator
});

module.exports = {
    defaultViewerHandlers,
    defaultViewerDefaultProps
};
