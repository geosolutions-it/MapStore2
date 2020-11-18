import React from 'react';
import {
    compose,
    createEventHandler,
    defaultProps,
    withHandlers,
    withPropsOnChange,
    withStateHandlers
} from 'recompose';

import { flattenPages, getOffsetFromTop, getRow } from '../../../../../utils/RulesGridUtils';
import Message from '../../../../I18N/Message';
import propsStreamFactory from '../../../../misc/enhancers/propsStreamFactory';
import FilterRenderers from '../filterRenderers';
import AccessFormatter from '../formatters/AccessFormatter';
import filtersStream from './filtersStream';
import reorderRules from './reorderRules';
import scrollStream from './scrollStream';
import triggerFetch from './triggerFetch';
import virtualScrollFetch from './virtualScrollFetch';

const emitStop = stream$ => stream$.filter(() => false).startWith({});
const triggerLoadStream = prop$ => prop$.distinctUntilChanged(({triggerLoad}, nP) => triggerLoad === nP.triggerLoad)
    .skip(1)
    .do(({incrementVersion}) => incrementVersion());

const dataStreamFactory = $props => {
    const {handler: onGridScroll, stream: onGridScroll$ } = createEventHandler();
    const {handler: moreRules, stream: page$ } = createEventHandler();
    const {handler: onAddFilter, stream: addFilter$ } = createEventHandler();
    const {handler: onReorderRows, stream: orderRule$ } = createEventHandler();
    const $p = $props.map(o => ({ ...o, onGridScroll$, addFilter$, orderRule$, moreRules}));
    return triggerFetch($p).let(emitStop)
        .combineLatest([
            virtualScrollFetch(page$)($p).let(emitStop),
            reorderRules(page$)($p).let(emitStop),
            filtersStream($p).let(emitStop),
            scrollStream($p).let(emitStop),
            triggerLoadStream($props).let(emitStop)
        ])
        .mapTo({onGridScroll,
            onAddFilter,
            onReorderRows});

};

export default compose(
    defaultProps({
        sortable: false,
        size: 20,
        onSelect: () => {},
        onLoadError: () => {},
        setLoading: () => {},
        dataStreamFactory,
        virtualScroll: true,
        setFilters: () => {},
        columns: [
            { key: 'rolename', name: <Message msgId={"rulesmanager.role"} />, filterable: true, filterRenderer: FilterRenderers.RolesFilter},
            { key: 'username', name: <Message msgId={"rulesmanager.user"} />, filterable: true, filterRenderer: FilterRenderers.UsersFilter},
            { key: 'ipaddress', name: <Message msgId={"rulesmanager.ip"} />, filterable: false},
            { key: 'service', name: <Message msgId={"rulesmanager.service"} />, filterable: true, filterRenderer: FilterRenderers.ServicesFilter},
            { key: 'request', name: <Message msgId={"rulesmanager.request"} />, filterable: true, filterRenderer: FilterRenderers.RequestsFilter },
            { key: 'workspace', name: <Message msgId={"rulesmanager.workspace"} />, filterable: true, filterRenderer: FilterRenderers.WorkspacesFilter},
            { key: 'layer', name: <Message msgId={"rulesmanager.layer"} />, filterable: true, filterRenderer: FilterRenderers.LayersFilter},
            { key: 'grant', name: <Message msgId={"rulesmanager.access"} />, formatter: AccessFormatter, filterable: false }
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
        setFilters: (state, {filters = {}, setFilters}) => ({column, filterTerm}) => {
            // Can add  some logic here to clean related filters
            if (column.key === "workspace" && filters.layer) {
                setFilters("layer");
            } else if (column.key === "service" && filters.request) {
                setFilters("request");
            }
            setFilters(column.key, filterTerm);
            return {rowsCount: 0, pages: {}};
        },
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
