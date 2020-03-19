/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { zip, every } from 'lodash';

import Select from '../../misc/PagedSelect';
import Message from '../../I18N/Message';
import Toolbar from '../../misc/toolbar/Toolbar';
import Loader from '../../misc/Loader';

const contextToOption = (context, selectedContexts, disabled) => ({
    label: context.name,
    value: context,
    disabled: disabled ||
        selectedContexts && selectedContexts.reduce((result, selectedContext) => result || selectedContext.name === context.name, false)
});

export default ({
    loadFlags = {},
    show = false,
    showContextSearchOption = true,
    enableClearAll = true,
    title = <Message msgId="search.advancedSearchPanel.title"/>,
    contextTitle = <Message msgId="search.advancedSearchPanel.context.title"/>,
    searchFilter = {},
    contexts = {},
    pagination = true,
    onClearAll = () => {},
    onSearchFilterChange = () => {},
    onLoadContexts = () => {}
}) => show && showContextSearchOption ? (
    <div className="advanced-search-panel">
        <div className="advanced-search-title-area">
            <h5>{title}</h5>
            {loadFlags.loadingFilter && <Loader size={16}/>}
            <Toolbar
                btnDefaultProps={{
                    className: 'square-button-md no-border',
                    bsStyle: 'default'
                }}
                buttons={[{
                    visible: enableClearAll && !loadFlags.loadingFilter,
                    glyph: 'clear-filter',
                    onClick: () => onClearAll()
                }]}/>
        </div>
        <div className="advanced-search-context">
            <h5>{contextTitle}</h5>
            <Select
                multi
                isLoading={loadFlags.loadingContexts}
                onChange={value => onSearchFilterChange('contexts', value.map(option => option.value))}
                onInputChange={searchText => {
                    // when option is selected it triggers onInputChange
                    if ((searchText || '*') !== (contexts.searchText || '*')) {
                        onLoadContexts(searchText, {params: {start: 0, limit: contexts.limit}}, 500);
                    }
                    return searchText;
                }}
                value={(searchFilter.contexts || []).map(context => contextToOption(context))}
                options={(contexts.results || []).map(context => contextToOption(context, searchFilter.contexts, loadFlags.loadingContexts))}
                valueComparator={(oldValue = [], newValue = []) => oldValue.length === newValue.length && every(zip(oldValue, newValue),
                    ([{label: oldLabel}, {label: newLabel}]) => oldLabel === newLabel
                )}
                applyOptionsFilter={false}
                removeSelected={false}
                onBlurResetsInput={false}
                closeOnSelect={false}
                pagination={{
                    paginated: pagination,
                    firstPage: !contexts.start,
                    lastPage: contexts.totalCount - contexts.start <= contexts.limit,
                    loadPrevPage: () => onLoadContexts(contexts.searchText,
                        {params: {start: contexts.start - contexts.limit, limit: contexts.limit}}),
                    loadNextPage: () => onLoadContexts(contexts.searchText,
                        {params: {start: contexts.start + contexts.limit, limit: contexts.limit}})
                }}
                clearable/>
        </div>
    </div>
) : null;
