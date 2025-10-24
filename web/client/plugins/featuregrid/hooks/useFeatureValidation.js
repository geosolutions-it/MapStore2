/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useMemo } from 'react';
import Ajv from 'ajv';
import { applyAllChanges } from '../../../utils/FeatureGridUtils';

const ajv = new Ajv({ allErrors: true });

const useFeatureValidation = ({
    featurePropertiesJSONSchema,
    newFeatures,
    features,
    changes
}) => {
    const validationErrors = useMemo(() => {
        if (!featurePropertiesJSONSchema) {
            return {};
        }
        const validate = ajv.compile(featurePropertiesJSONSchema);
        const defaultNullProperties = Object.fromEntries(Object.keys(featurePropertiesJSONSchema?.properties).map(key => [key, null]));
        return Object.fromEntries(
            (newFeatures ? [...newFeatures, ...features] : features)
                .map((feature) => {
                    const { id, properties } = applyAllChanges(feature, changes) || {};
                    const valid = validate({
                        ...defaultNullProperties,
                        ...properties
                    });
                    if (!valid) {
                        return [id, { errors: validate.errors, changed: !!changes[id] || feature._new }];
                    }
                    return null;
                })
                .filter(value => value)
        );
    }, [newFeatures, features, changes, featurePropertiesJSONSchema]);
    return validationErrors;
};

export default useFeatureValidation;
