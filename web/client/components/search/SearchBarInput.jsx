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

import {getMessageById} from '../../utils/LocaleUtils';

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
    const [onBlurTimeout, setOnBlurTimeout] = React.useState();
    const [onChangeTimeout, setOnChangeTimeout] = React.useState();
    const [executeOnChange, setExecuteOnChange] = React.useState(false);

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

    // onChange delay
    React.useEffect(() => {
        if (executeOnChange) {
            onSearch();
            setExecuteOnChange(false);
        }
    }, [executeOnChange, onSearch]);

    let actualPlaceholder = "search.addressSearch";
    if (!placeholder && context.messages) {
        const placeholderLocMessage = getMessageById(context.messages, placeholderMsgId || actualPlaceholder);
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
                if (onBlurTimeout) {
                    clearTimeout(onBlurTimeout);
                }
                setOnBlurTimeout(setTimeout(() => {
                    onPurgeResults();
                }, blurResetDelay));
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
                if (onChangeTimeout) {
                    clearTimeout(onChangeTimeout);
                }
                setOnChangeTimeout(setTimeout(() => {
                    setExecuteOnChange(true);
                }, delay));
            }
        }}
    />;
};
SearchBarInput.contextTypes = {messages: PropTypes.object};

export default SearchBarInput;
