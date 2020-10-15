/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React, { useEffect, useRef, useState } from 'react';
import debounce from 'lodash/debounce';

const withDebounceOnCallback = (propCallbackKey, propKey) => (Component) => {

    function WithDebounceOnCallback(props) {
        const update = useRef();
        const [value, setValue] = useState(props[propKey]);
        const updateValue = useRef();
        updateValue.current = value;
        useEffect(() => {
            if (updateValue.current !== props[propKey]) {
                setValue(props[propKey]);
            }
        }, [props[propKey]]);
        useEffect(() => {
            update.current = debounce(({ newProps, newValue}) => {
                newProps[propCallbackKey](newValue);
            }, props.debounceTime);
            return () => {
                update.current.cancel();
            };
        }, [ props.debounceTime ]);
        function handleCallback(newValue) {
            setValue(newValue);
            if (update.current) {
                update.current.cancel();
                update.current({ newProps: props, newValue });
            }
        }
        const extendedProps = {
            ...props,
            [propKey]: value,
            [propCallbackKey]: handleCallback
        };
        return (
            <Component
                { ...extendedProps }
            />
        );
    }
    WithDebounceOnCallback.defaultProps = {
        debounceTime: 300
    };
    WithDebounceOnCallback.displayName = Component.displayName + 'WithDebounceOnCallback';
    return WithDebounceOnCallback;
}

export default withDebounceOnCallback;
