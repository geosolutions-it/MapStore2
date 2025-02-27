/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState } from 'react';

const getValue = (key, defaultValue) => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

const setValue = (key, value) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        //
    }
};
/**
 * saves the state in the localStorage
 * @param {string} key property key
 * @param {any} defaultValue initial value
 * @return {array} [storedValue, setStoredValue]
 * @example
 * function Component({ defaultValue = 'initial' }) {
 *  const [myProperty, setMyProperty] = useLocalStorage('myProperty', defaultValue);
 *  return <button onClick={() => setMyProperty('stored')}>{myProperty}</button>;
 * }
 */
const useLocalStorage = (key, defaultValue) => {
    const [storedValue, setStoredValue] = useState(getValue(key, defaultValue));
    const [prevStoredValue, setPrevStoredValue] = useState(storedValue);
    if (storedValue !== prevStoredValue) {
        setPrevStoredValue(storedValue);
        setValue(key, storedValue);
    }
    return [storedValue, setStoredValue];
};

export default useLocalStorage;
