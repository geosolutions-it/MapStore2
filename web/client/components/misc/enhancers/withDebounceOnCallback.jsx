/*
* Copyright 2020, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
/**
 * This HOC add a debounce time on the declared prop (300ms by default)
 * @example
 * function InputControl({ value, onChange }) {
 *  function handleOnChange(event) {
 *    onChange(event.target.value);
 *  }
 *  return (<input value={value} onChange={handleOnChange}/>);
 * }
 * const InputControlWithDebounce = withDebounceOnCallback('onChange', 'value')(InputControl);
 *
 * function MyComponent({ text, onUpdate }) {
 *  return (
 *   <InputControl
 *    value={text}
 *    debounceTime={200} // default debounce time can be override with the debounceTime prop (unit of measure ms)
 *    onChange={onUpdate}
 *   />
 *  );
 * }
 *
 * @param  {string} propCallbackKey the name of the callback that needs debounce
 * @param  {string} propKey the name of the value updated with the callback
 */
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
    WithDebounceOnCallback.propTypes = {
        debounceTime: PropTypes.number
    };
    WithDebounceOnCallback.defaultProps = {
        debounceTime: 300
    };
    WithDebounceOnCallback.displayName = Component.displayName + 'WithDebounceOnCallback';
    return WithDebounceOnCallback;
};

export default withDebounceOnCallback;
