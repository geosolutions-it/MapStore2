const React = require("react");
const { compose, withPropsOnChange, withHandlers, withStateHandlers, defaultProps, createEventHandler } = require('recompose');
const propsStreamFactory = require('../../../../misc/enhancers/propsStreamFactory');
const triggerFetch = require("./triggerFetch");
const virtualScrollFetch = require("./virtualScrollFetch");
const reorderRules = require("./reorderRules");
const scrollStream = require("./scrollStream");
const filtersStream = require("./filtersStream");
const FilterRenderers = require("../filterRenderers");
const Message = require('../../../../I18N/Message');
const AccessFormatter = require('../formatters/AccessFormatter');
const {getRow, flattenPages, getOffsetFromTop} = require('../../../../../utils/RulesGridUtils');

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

module.exports = compose(
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
