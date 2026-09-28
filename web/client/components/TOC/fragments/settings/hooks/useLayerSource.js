/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useEffect, useRef, useState } from 'react';
import { identity } from 'lodash';

import useIsMounted from '../../../../../hooks/useIsMounted';
import {
    SOURCE_FIELDS,
    buildChanges,
    getSourceFields,
    isEmptyValue,
    toLayer,
    validateSourceField
} from '../../../../../utils/LayerSourceUtils';

const IDLE = { editing: false, state: 'idle' };
const BUSY_STATES = ['validating', 'waitingLoad'];

const getCommittedValue = (field, node) => SOURCE_FIELDS[field].format(SOURCE_FIELDS[field].get(node));
const parseValue = (field, rawValue) => (SOURCE_FIELDS[field].parse || identity)(rawValue);
const getInitialValues = (fields, node) => fields.reduce((values, field) => ({
    ...values,
    [field]: getCommittedValue(field, node)
}), {});

/**
 * Form state of the layer source fields, each field is validated with the current values of the others
 */
export const useLayerSource = (node = {}, {
    nodeType,
    onChange = () => {},
    enableLayerNameEditFeedback = false,
    onValidationError = () => {}
} = {}) => {
    const fields = getSourceFields(node, nodeType);
    const isMounted = useIsMounted();
    const [values, setValues] = useState(() => getInitialValues(fields, node));
    const [status, setStatus] = useState({});
    const statusRef = useRef(status);
    statusRef.current = status;
    const setFieldStatus = (field, fieldStatus) => setStatus((previous) => ({ ...previous, [field]: fieldStatus }));

    // keep the fields not in edit mode aligned with the layer updated from outside
    useEffect(() => {
        setValues((previous) => {
            const outdated = fields.filter((field) => !statusRef.current[field]?.editing
                && previous[field] !== getCommittedValue(field, node));
            return outdated.length
                ? { ...previous, ...getInitialValues(outdated, node) }
                : previous;
        });
    }, [node]);

    useEffect(() => {
        Object.keys(status).forEach((field) => {
            const fieldStatus = status[field];
            if (fieldStatus.state !== 'waitingLoad') {
                return;
            }
            if (fieldStatus.phase === 'start' && node.loading) {
                setFieldStatus(field, { ...fieldStatus, phase: 'end' });
                return;
            }
            if (fieldStatus.phase === 'end' && !node.loading) {
                setFieldStatus(field, node.loadingError
                    ? { editing: true, state: 'error', error: { code: 'load', field } }
                    : IDLE);
            }
        });
    }, [node.loading, node.loadingError, status]);

    const getEditedValues = () => fields.reduce((edited, field) => values[field] !== undefined
        && values[field] !== getCommittedValue(field, node)
        ? { ...edited, [field]: parseValue(field, values[field]) }
        : edited, {});

    const commit = (field, value, result, { forced } = {}) => {
        onChange(buildChanges(node, field, value, result, { forced }));
        const waitForLoad = !forced
            && SOURCE_FIELDS[field].reloadsLayer
            && enableLayerNameEditFeedback
            && node.visibility !== false;
        setFieldStatus(field, waitForLoad
            ? { editing: true, state: 'waitingLoad', phase: 'start' }
            : IDLE);
    };

    const confirm = (field) => {
        const rawValue = values[field];
        const value = parseValue(field, rawValue);
        const error = status[field]?.error;
        const unchanged = rawValue === getCommittedValue(field, node);
        if (isEmptyValue(value)) {
            setFieldStatus(field, { editing: true, state: 'error', error: { code: 'required', field } });
            return;
        }
        if (error?.code === 'load') {
            setFieldStatus(field, IDLE);
            return;
        }
        if (error && error.code !== 'required') {
            if (unchanged) {
                setFieldStatus(field, IDLE);
                return;
            }
            commit(field, value, undefined, { forced: true });
            return;
        }
        // unchanged values are validated too, the saved value could be invalid or depend on other fields
        setFieldStatus(field, { editing: true, state: 'validating' });
        validateSourceField(field, toLayer(node, { ...getEditedValues(), [field]: value }))
            .then(
                (result) => isMounted(() => {
                    if (unchanged) {
                        setFieldStatus(field, IDLE);
                        return;
                    }
                    commit(field, value, result);
                }),
                (validationError) => isMounted(() => {
                    setFieldStatus(field, { editing: true, state: 'error', error: validationError });
                    if (field === 'name') {
                        onValidationError(validationError);
                    }
                })
            );
    };

    return {
        fields: fields.reduce((fieldsProps, field) => {
            const fieldStatus = status[field] || IDLE;
            return {
                ...fieldsProps,
                [field]: {
                    field,
                    dataQa: SOURCE_FIELDS[field].dataQa,
                    labelId: SOURCE_FIELDS[field].labelId,
                    value: values[field] ?? '',
                    editing: !!fieldStatus.editing,
                    busy: BUSY_STATES.includes(fieldStatus.state),
                    error: fieldStatus.error,
                    onEdit: () => setFieldStatus(field, { editing: true, state: 'idle' }),
                    onChange: (rawValue) => {
                        setValues((previous) => ({ ...previous, [field]: rawValue }));
                        setFieldStatus(field, { editing: true, state: 'idle' });
                    },
                    onConfirm: () => confirm(field)
                }
            };
        }, {})
    };
};

export default useLayerSource;
