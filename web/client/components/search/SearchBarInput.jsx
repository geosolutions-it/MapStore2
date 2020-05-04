/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { FormControl } from 'react-bootstrap';

import LocaleUtils from '../../utils/LocaleUtils';

const SearchBarInput = ({
    show,
    autoFocusOnSelect = true,
    selectedItems = [],
    className,
    style = {
        textOverflow: "ellipsis"
    },
    placeholder,
    placeholderMsgId,
    hideOnBlur = true,
    searchText = '',
    typeAhead = true,
    delay = 1000,
    blurResetDelay = 300,
    onSearch = () => {},
    onSearchTextChange = () => {},
    onCancelSelectedItem = () => {},
    onPurgeResults = () => {}
}, context) => {
    const inputRef = React.useRef();
    const prevSelectedItemsLengthRef = React.useRef();
    const onBlurTimeout = React.useRef();
    const onChangeTimeout = React.useRef();
    const [startOnBlurTimeout, setStartOnBlurTimeout] = React.useState();
    const [executeOnBlurTimeout, setExecuteOnBlurTimeout] = React.useState();
    const [startOnChangeTimeout, setStartOnChangeTimeout] = React.useState();
    const [executeOnChangeTimeout, setExecuteOnChangeTimeout] = React.useState();

    React.useEffect(() => {
        const prevSelectedItemsLength = prevSelectedItemsLengthRef.current;
        const shouldFocus = autoFocusOnSelect && selectedItems &&
            (
                prevSelectedItemsLength < selectedItems.length
                || !prevSelectedItemsLength && selectedItems.length === 1
            );
        if (shouldFocus) {
            // focus to input
            const node = inputRef.current;
            if (node && node.focus instanceof Function) {
                setTimeout( () => node.focus(), 200);
            }
        }
        prevSelectedItemsLengthRef.current = selectedItems && selectedItems.length;
    });

    // onBlur delay
    React.useEffect(() => {
        if (onBlurTimeout) {
            if (executeOnBlurTimeout) {
                onPurgeResults();
                onBlurTimeout.current = 0;
                setExecuteOnBlurTimeout(false);
            }
            if (startOnBlurTimeout) {
                if (onBlurTimeout.current) {
                    clearTimeout(onBlurTimeout.current);
                }
                onBlurTimeout.current = setTimeout(() => {
                    setExecuteOnBlurTimeout(true);
                }, blurResetDelay);
                setStartOnBlurTimeout(false);
            }
        }
    });

    // onChange delay
    React.useEffect(() => {
        if (onChangeTimeout) {
            if (executeOnChangeTimeout) {
                onSearch();
                onChangeTimeout.current = 0;
                setExecuteOnChangeTimeout(false);
            }
            if (startOnChangeTimeout) {
                if (onChangeTimeout.current) {
                    clearTimeout(onChangeTimeout.current);
                }
                onChangeTimeout.current = setTimeout(() => {
                    setExecuteOnChangeTimeout(true);
                }, delay);
                setStartOnChangeTimeout(false);
            }
        }
    });

    let actualPlaceholder = "search.addressSearch";
    if (!placeholder && context.messages) {
        const placeholderLocMessage = LocaleUtils.getMessageById(context.messages, placeholderMsgId || actualPlaceholder);
        if (placeholderLocMessage) {
            actualPlaceholder = placeholderLocMessage;
        }
    } else {
        actualPlaceholder = placeholder;
    }

    return show && <FormControl
        className={`searchInput${className ? ` ${className}` : ''}`}
        key="search-input"
        placeholder={actualPlaceholder}
        type="text"
        inputRef={ref => {inputRef.current = ref;}}
        style={style}
        value={searchText}
        onKeyDown={event => {
            switch (event.keyCode) {
            case 13:
                onSearch();
                break;
            case 8:
                if (!searchText && selectedItems && selectedItems.length > 0) {
                    onCancelSelectedItem(selectedItems[selectedItems.length - 1]);
                }
                break;
            default:
            }
        }}
        onBlur={() => {
            // delay this to make the click on result run anyway
            if (hideOnBlur) {
                setStartOnBlurTimeout(true);
            }
        }}
        onFocus={() => {
            if (typeAhead && searchText) {
                onSearch();
            }
        }}
        onChange={(e) => {
            let text = e.target.value;
            onSearchTextChange(text);
            if (typeAhead) {
                setStartOnChangeTimeout(true);
            }
        }}
    />;
};
SearchBarInput.contextTypes = {messages: PropTypes.object};

export default SearchBarInput;
