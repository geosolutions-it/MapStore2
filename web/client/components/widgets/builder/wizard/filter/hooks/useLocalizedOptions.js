/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useMemo } from 'react';
import Message from '../../../../../I18N/Message';

/**
 * Custom hook that localizes select options using labelKey property.
 * If an option has a labelKey, it will be replaced with a Message component.
 * Otherwise, the original label is used.
 *
 * @param {Array} options - Array of option objects with {value, label, labelKey?}
 * @param {object|null} selectedOption - The currently selected option (optional)
 * @returns {object} { localizedOptions, localizedSelectedOption }
 *
 * @example
 * const options = [
 *   { value: 'a', label: 'A', labelKey: 'widgets.filterWidget.optionA' },
 *   { value: 'b', label: 'B' }
 * ];
 * const { localizedOptions, localizedSelectedOption } = useLocalizedOptions(options, selectedOption);
 */
export const useLocalizedOptions = (options = [], selectedOption = null) => {
    return useMemo(() => {
        const localizedOptions = options.map((option) => ({
            ...option,
            label: option.labelKey
                ? <Message msgId={option.labelKey} />
                : option.label
        }));

        const localizedSelectedOption = selectedOption ? {
            ...selectedOption,
            label: selectedOption.labelKey
                ? <Message msgId={selectedOption.labelKey} />
                : selectedOption.label
        } : null;

        return {
            localizedOptions,
            localizedSelectedOption
        };
    }, [options, selectedOption]);
};

