/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {withState, withHandlers, branch, defaultProps} = require('recompose');
const MapInfoUtils = require('../../../../utils/MapInfoUtils');

const defaultViewerHanlders = withHandlers({
    onNext: ({index = 0, setIndex = () => {}, responses, format, validator}) => () => {
        setIndex(Math.min(validator(format).getValidResponses(responses).length - 1, index + 1));
    },
    onPrevious: ({index, setIndex = () => {}}) => () => {
        setIndex(Math.max(0, index - 1));
    }
});

const switchControlledDefaultViewer = branch(
    ({header}) => header,
    withState(
        'index', 'setIndex', 0
    )
);

const defaultViewerDefaultProps = defaultProps({
    format: MapInfoUtils.getDefaultInfoFormatValue(),
    validator: MapInfoUtils.getValidator
});

module.exports = {
    defaultViewerHanlders,
    switchControlledDefaultViewer,
    defaultViewerDefaultProps
};
