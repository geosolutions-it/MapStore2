/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Rx from 'rxjs';
import { values } from 'lodash';
import { compose, branch, withState, getContext, lifecycle } from 'recompose';
import { Glyphicon } from 'react-bootstrap';

import { getResources } from '../../api/persistence';

import withInfiniteScroll from './enhancers/infiniteScroll/withInfiniteScroll';
import Filter from './Filter';
import ResizableModal from './ResizableModal';
import TransferColumnCardList from './transfer/TransferColumnCardList';
import Loader from './Loader';
import Message from '../I18N/Message';
import LocaleUtils from '../../utils/LocaleUtils';

const searchContexts = ({searchText, opts}) => getResources({
    query: searchText || '*',
    category: 'CONTEXT',
    options: opts
}).switchMap(response => Rx.Observable.of({
    items: response.totalCount === 1 ? [response.results] : values(response.results),
    total: response.totalCount,
    loading: false
}));

const loadPage = ({searchText = '', limit = 12} = {}, page = 0) => searchContexts({
    searchText,
    opts: {
        params: {
            start: page * limit,
            limit
        }
    }
});

const contextToItem = (onSelect, context) => ({
    title: context.name,
    description: context.description,
    preview:
        <div className="new-map-preview">
            {context.thumbnail && context.thumbnail !== 'NODATA' ?
                <img src={context.thumbnail}/> :
                <Glyphicon glyph="1-map"/>}
        </div>,
    onClick: () => onSelect(context)
});

const NewMapDialog = ({
    loading,
    show,
    filterText = '',
    loadFirst = () => {},
    setFilterText = () => {},
    onClose = () => {},
    onSelect = () => {},
    items = [],
    messages = {}
}) => (
    <ResizableModal
        show={show}
        loading={loading && items.length > 0}
        title={<Message msgId="newMapDialog.title"/>}
        fade
        clickOutEnabled={false}
        buttons={[{
            text: <Message msgId="cancel"/>,
            bsStyle: 'primary',
            onClick: () => onClose()
        }]}
        onClose={onClose}
    >
        <div className="new-map-dialog">
            <div className="new-map-dialog-filter-container">
                <Filter
                    filterText={filterText}
                    onFilter={text => {
                        setFilterText(text);
                        loadFirst({searchText: text});
                    }}
                    filterPlaceholder={LocaleUtils.getMessageById(messages, 'newMapDialog.filterPlaceholder')}/>
            </div>
            <div className="new-map-dialog-list-container">
                {loading && items.length === 0 ?
                    <div className="new-map-loader"><Loader size={100}/></div> :
                    <TransferColumnCardList
                        items={items.map(contextToItem.bind(null, onSelect))}
                        emptyStateProps={{
                            glyph: '1-map',
                            title: <Message msgId="newMapDialog.noContexts"/>
                        }}/>
                }
            </div>
        </div>
    </ResizableModal>
);

export default branch(
    ({show}) => show,
    compose(
        withState('filterText', 'setFilterText', ''),
        getContext({
            messages: PropTypes.object
        }),
        withInfiniteScroll({
            loadPage,
            loadMoreStreamOptions: {
                initialStreamDebounce: 300
            },
            scrollSpyOptions: {
                querySelector: '.new-map-dialog-list-container',
                pageSize: 12
            },
            hasMore: ({items = [], total = 0}) => items.length < total
        }),
        lifecycle({
            componentDidMount() {
                if (this.props.loadFirst) {
                    this.props.loadFirst();
                }
            }
        })
    )
)(NewMapDialog);
