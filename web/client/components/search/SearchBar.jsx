/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { FormGroup } from 'react-bootstrap';

import SearchBarBase from './SearchBarBase';
import SearchBarInput from './SearchBarInput';
import SearchBarToolbar from './SearchBarToolbar';

import { defaultSearchWrapper } from './SearchBarUtils';

export default ({
    className,
    splitTools,
    isSearchClickable = true,
    hideOnBlur,
    typeAhead,
    placeholderMsgId,
    removeIcon = '1-close',
    searchIcon = 'search',
    searchText = '',
    searchOptions,
    maxResults,
    onSearch,
    onSearchReset,
    onSearchTextChange
}) => {
    const search = defaultSearchWrapper({searchText, searchOptions, maxResults, onSearch, onSearchReset});

    return (<SearchBarBase className={className}>
        <FormGroup>
            <div className="input-group">
                <SearchBarInput
                    show
                    hideOnBlur={hideOnBlur}
                    typeAhead={typeAhead}
                    placeholderMsgId={placeholderMsgId}
                    searchText={searchText}
                    onSearch={search}
                    onSearchTextChange={onSearchTextChange}/>
                <SearchBarToolbar
                    splitTools={false}
                    toolbarButtons={[{
                        glyph: removeIcon,
                        className: "square-button-md no-border",
                        bsStyle: "default",
                        pullRight: true,
                        visible: searchText !== "",
                        onClick: () => onSearchReset()
                    }, {
                        glyph: searchIcon,
                        className: "square-button-md no-border " +
                            (isSearchClickable ? "magnifying-glass clickable" : "magnifying-glass"),
                        bsStyle: "default",
                        pullRight: true,
                        visible: searchText === '' || !splitTools,
                        onClick: () => search()
                    }]}/>
            </div>
        </FormGroup>
    </SearchBarBase>);
};
