/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {withState, withHandlers, branch, defaultProps} = require('recompose');
const MapInfoUtils = require('../../../../utils/MapInfoUtils');

/**
 * Enhancer for setting page index of Default Viewer in DefaultViewer/IdentifyContainer plugin
 * - onNext: set next index
 * - onPrevious: set previous index
 * @memberof enhancers.defaultViewerHandlers
 * @class
 */
const defaultViewerHandlers = withHandlers({
    onNext: ({index = 0, setIndex = () => {}, responses, format, validator}) => () => {
        setIndex(Math.min(validator(format).getValidResponses(responses).length - 1, index + 1));
    },
    onPrevious: ({index, setIndex = () => {}}) => () => {
        setIndex(Math.max(0, index - 1));
    }
});


/**
 * Enhancer to enable set index only if Component has header
 * @memberof enhancers.switchControlledDefaultViewer
 * @class
 */
const switchControlledDefaultViewer = branch(
    ({header}) => header,
    withState(
        'index', 'setIndex', 0
    )
);

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
    switchControlledDefaultViewer,
    defaultViewerDefaultProps
};
