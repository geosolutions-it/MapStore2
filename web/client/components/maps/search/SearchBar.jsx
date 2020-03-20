/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { FormGroup } from 'react-bootstrap';

import Message from '../../I18N/Message';

import SearchBarBase from '../../search/SearchBarBase';
import SearchBarInput from '../../search/SearchBarInput';
import SearchBarToolbar from '../../search/SearchBarToolbar';

import AdvancedSearch from './AdvancedSearch';

import { defaultSearchWrapper } from '../../search/SearchBarUtils';

export default ({
    loadingFilter,
    loadingContexts,
    showContextSearchOption = true,
    showAdvancedSearchPanel = false,
    removeIcon = '1-close',
    searchIcon = 'search',
    advancedSearchIcon = 'filter',
    searchText = '',
    searchOptions,
    maxResults,
    searchFilter,
    contexts,
    onSearch,
    onSearchReset,
    onSearchTextChange,
    onToggleControl,
    onSearchFilterClearAll,
    onSearchFilterChange,
    onLoadContexts
}) => {
    const search = defaultSearchWrapper({searchText, searchOptions, maxResults, onSearch, onSearchReset});
    const isSearchFilterEmpty = !searchFilter || (searchFilter.contexts || []).length === 0;

    return (<SearchBarBase className="maps-search">
        <FormGroup>
            <div className="input-group">
                <SearchBarInput
                    show
                    hideOnBlur={false}
                    typeAhead={false}
                    placeholderMsgId="maps.search"
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
                        className: "square-button-md no-border magnifying-glass clickable",
                        bsStyle: "default",
                        pullRight: true,
                        visible: true,
                        onClick: () => search()
                    }, {
                        glyph: advancedSearchIcon,
                        tooltip: <Message
                            msgId={`search.advancedSearchPanel.${showAdvancedSearchPanel ? 'hide' : 'show'}Tooltip` +
                            (isSearchFilterEmpty ? '' : 'Active')}/>,
                        className: "square-button-md no-border " +
                            (showAdvancedSearchPanel && showContextSearchOption ? "active" : ""),
                        bsStyle: isSearchFilterEmpty ? "default" : "success",
                        pullRight: true,
                        visible: showContextSearchOption,
                        onClick: () => {
                            onToggleControl("advancedsearchpanel");
                            onLoadContexts('*', {params: {start: 0, limit: 12}});
                        }
                    }]}/>
            </div>
        </FormGroup>
        <AdvancedSearch
            loading={loadingFilter || loadingContexts}
            loadFlags={{
                loadingFilter,
                loadingContexts
            }}
            show={showAdvancedSearchPanel}
            showContextSearchOption={showContextSearchOption}
            searchFilter={searchFilter}
            contexts={contexts}
            onClearAll={onSearchFilterClearAll}
            onSearchFilterChange={onSearchFilterChange}
            onLoadContexts={onLoadContexts}/>
    </SearchBarBase>);
};
