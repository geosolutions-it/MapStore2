/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import { compose, mapPropsStream, withHandlers } from 'recompose';

import {selectLineFeature} from "../../../utils/LongitudinalProfileUtils";

/**
 * Enhancer for processing json file with features
 * Flatten features and then selects first line feature to build longitudinal profile out of it
 */
export default compose(
    withHandlers({
        useFlattenFeatures: ({
            onClose = () => {},
            onChangeGeometry = () => {},
            onWarning = () => {}
        }) =>
            (flattenFeatures, crs) => {
                const { feature, coordinates } = selectLineFeature(flattenFeatures, crs);
                if (feature && feature.showProjectionCombobox) {
                    console.log("");
                } else if (feature && coordinates) {
                    onChangeGeometry({
                        type: "LineString",
                        coordinates,
                        projection: 'EPSG:3857'
                    });
                    onClose();
                } else {
                    onWarning({
                        title: "notification.warning",
                        message: "longitudinalProfile.warnings.noLineFeatureFound",
                        autoDismiss: 6,
                        position: "tc"
                    });
                }
            }
    }),
    mapPropsStream(props$ => props$.merge(
        props$
            .distinctUntilKeyChanged('flattenFeatures')
            .filter(({flattenFeatures}) => flattenFeatures)
            .do(({ flattenFeatures, crs, useFlattenFeatures = () => { }, warnings = []}) => useFlattenFeatures(flattenFeatures, crs, warnings))
            .ignoreElements()
    ))
);
