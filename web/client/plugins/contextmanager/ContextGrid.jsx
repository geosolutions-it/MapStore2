/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import { compose, defaultProps, withHandlers } from 'recompose';

import resourceGrid from '../../components/resources/enhancers/resourceGrid';
import withShareTool from '../../components/resources/enhancers/withShareTool';
import ResourceGrid from '../../components/resources/ResourceGrid';

const Grid = compose(
    withHandlers({
        onSaveSuccess: (props) => () => {
            if (props.reloadContexts) {
                props.reloadContexts();
            }
            if (props.invalidateFeaturedMaps) {
                props.invalidateFeaturedMaps();
            }
        }
    }),
    defaultProps({
        category: "CONTEXT"
    }),
    resourceGrid,
    // add and configure share tool panel
    compose(
        defaultProps({ shareOptions: {embedOptions: { showTOCToggle: false }, advancedSettingsVisibility: { bbox: true } }}),
        withShareTool
    )
)(ResourceGrid);

export default Grid;
