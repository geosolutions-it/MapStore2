/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useMemo } from 'react';
import Ajv from 'ajv';
import { applyAllChanges, isPrimaryKeyField } from '../../../utils/FeatureGridUtils';

const ajv = new Ajv({ allErrors: true });

// Cache compiled validators to avoid recompiling on every render
const validatorCache = new Map();

/**
 * Get or compile a validator for the given schema
 * @param {object} schema - The JSON schema to validate against
 * @returns {function} The compiled AJV validator function
 */
const getValidator = (schema) => {
    if (!schema) return null;

    const key = JSON.stringify(schema);
    if (validatorCache.has(key)) return validatorCache.get(key);
    try {
        const validate = ajv.compile(schema);
        validatorCache.set(key, validate);
        return validate;
    } catch (error) {
        console.error('Error compiling JSON schema validator:', error);
        return null;
    }
};

const useFeatureValidation = ({
    featurePropertiesJSONSchema,
    newFeatures,
    features,
    changes,
    primaryKeyAttributes = []
}) => {
    const validate = useMemo(() => getValidator(featurePropertiesJSONSchema), [featurePropertiesJSONSchema]);

    const allFeatures = useMemo(() => {
        return newFeatures && newFeatures.length > 0
            ? [...newFeatures, ...features]
            : features;
    }, [newFeatures, features]);

    const validationErrors = useMemo(() => {
        if (!validate || !featurePropertiesJSONSchema) {
            return {};
        }

        // Create default null properties
        const defaultNullProperties = featurePropertiesJSONSchema?.properties
            ? Object.fromEntries(Object.keys(featurePropertiesJSONSchema.properties).map(key => [key, null]))
            : {};

        return Object.fromEntries(
            allFeatures
                .map((feature) => {
                    const { id, properties } = applyAllChanges(feature, changes) || {};
                    if (!id) return null;

                    const valid = validate({ ...defaultNullProperties, ...properties });
                    if (!valid) {
                        // Filter out primary key errors
                        const errors = (validate.errors || []).filter(error => {
                            // Extract field name from instancePath (e.g., "/fid" -> "fid")
                            const path = error.instancePath || error.dataPath || '';
                            const fieldName = path.replace(/^[./]/, '');
                            return !isPrimaryKeyField(fieldName, primaryKeyAttributes);
                        });

                        // Only include this feature if there are non-primary-key errors
                        if (errors.length > 0) {
                            return [id, { errors, changed: !!changes[id] || feature._new }];
                        }
                    }
                    return null;
                })
                .filter(value => value)
        );
    }, [validate, allFeatures, changes, featurePropertiesJSONSchema, primaryKeyAttributes]);

    return validationErrors;
};

export default useFeatureValidation;
