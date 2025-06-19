/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {
    compose,
    createEventHandler,
    defaultProps,
    withHandlers,
    withPropsOnChange,
    withStateHandlers
} from 'recompose';

import { flattenPages, getOffsetFromTop, getRow } from '../../../../../../utils/RulesGridUtils';
import Message from '../../../../../I18N/Message';
import propsStreamFactory from '../../../../../misc/enhancers/propsStreamFactory';
import scrollStream from '../GSInstances/scrollStream';
import triggerFetch from './triggerFetchGSInstances';
import virtualScrollFetch from './GSInstancesFetchList';

const emitStop = stream$ => stream$.filter(() => false).startWith({});
const triggerLoadStream = prop$ => prop$.distinctUntilChanged(({triggerLoad}, nP) => triggerLoad === nP.triggerLoad)
    .skip(1)
    .do(({incrementVersion}) => incrementVersion());

const dataStreamFactory = $props => {
    const {handler: onGridScroll, stream: onGridScroll$ } = createEventHandler();
    const {handler: moreGSInstances, stream: page$ } = createEventHandler();
    const $p = $props.map(o => ({ ...o, onGridScroll$, moreGSInstances}));
    return triggerFetch($p).let(emitStop)
        .combineLatest([
            virtualScrollFetch(page$)($p).let(emitStop),
            scrollStream($p).let(emitStop),
            triggerLoadStream($props).let(emitStop)
        ])
        .mapTo({onGridScroll});

};

export default compose(
    defaultProps({
        sortable: false,
        size: 100,
        onSelect: () => {},
        onLoadError: () => {},
        setLoading: () => {},
        dataStreamFactory,
        virtualScroll: true,
        setFilters: () => {},
        columns: [
            { key: 'name', name: <Message msgId={"rulesmanager.gsInstanceGrid.name"} />, filterable: true, filterRenderer: false},
            { key: 'url', name: <Message msgId={"rulesmanager.gsInstanceGrid.url"} />, filterable: true, filterRenderer: false},
            { key: 'description', name: <Message msgId={"rulesmanager.gsInstanceGrid.description"} />, filterable: false}
        ]
    }),
    withStateHandlers({
        pages: {},
        rowsCount: 0,
        version: 0,
        isEditing: false
    }, {
        setData: ({rowsCount: oldRowsCount}) => ({pages, rowsCount = oldRowsCount, editing = false} = {}) => ({
            pages,
            rowsCount,
            error: undefined,
            isEditing: editing
        }),
        incrementVersion: ({ version }) => () => ({
            version: version + 1,
            isEditing: true
        })
    }),
    withHandlers({
        onLoad: ({ setData = () => {}, onLoad = () => {}} = {}) => (...args) => {
            setData(...args);
            onLoad(...args);
        },
        onSelect: ({onSelect: select, pages, rowsCount}) => (selected) => {
            if ( selected.length === 1) {
                const offsetFromTop = getOffsetFromTop(selected[0], flattenPages(pages));
                select(selected, false, false, {offsetFromTop, rowsCount});
            } else {
                select(selected);
            }
        }
    }),
    withPropsOnChange(
        ["enableColumnFilters", "pages"],
        props => ({
            displayFilters: props.enableColumnFilters,
            rows: props.pages
        })
    ),
    withHandlers({ rowGetter: props => i => getRow(i, props.rows, props.size) }),
    propsStreamFactory
);
