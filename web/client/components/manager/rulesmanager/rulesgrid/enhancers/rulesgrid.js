
const { compose, withPropsOnChange, withHandlers, withStateHandlers, defaultProps, createEventHandler } = require('recompose');
const propsStreamFactory = require('../../../../misc/enhancers/propsStreamFactory');
const triggerFetch = require("./triggerFetch");
const virtualScrollFetch = require("./virtualScrollFetch");
const reorderRules = require("./reorderRules");
const scrollStream = require("./scrollStream");
const filtersStream = require("./filtersStream");

const {getRow} = require('../../../../../utils/RulesGridUtils');

const emitStop = stream$ => stream$.filter(() => false).startWith({});

const dataStreamFactory = $props => {
    const {handler: onGridScroll, stream: onGridScroll$ } = createEventHandler();
    const {handler: moreRules, stream: page$ } = createEventHandler();
    const {handler: onAddFilter, stream: addFilter$ } = createEventHandler();
    const {handler: onReordeRows, stream: orderRule$ } = createEventHandler();
    const $p = $props.map(o => ({ ...o, onGridScroll$, addFilter$, orderRule$, moreRules}));
    return triggerFetch($p).let(emitStop)
            .combineLatest([
                virtualScrollFetch(page$)($p).let(emitStop),
                reorderRules(page$)($p).let(emitStop),
                filtersStream($p).let(emitStop),
                scrollStream($p).let(emitStop)
                ])
            .mapTo({onGridScroll,
                    onAddFilter,
                    onReordeRows});

};

module.exports = compose(
    defaultProps({
        sortable: false,
        size: 20,
        onSelect: () => {},
        onLoadError: () => {},
        setLoading: () => {},
        dataStreamFactory,
        virtualScroll: true
    }),
    withStateHandlers({
        pages: {},
        rowsCount: 0,
        filters: {},
        version: 0
    }, {
        setData: ({rowsCount: oldRowsCount}) => ({pages, rowsCount = oldRowsCount} = {}) => ({
            pages,
            rowsCount,
            error: undefined
        }),
        setFilters: ({filters = {}}) => ({column, filterTerm}) => {
            if (filterTerm) {
                return {filters: {...filters, [column.key]: filterTerm}, rowsCount: 0, pages: {}};
            }
            const {[column.key]: omit, ...newFilters} = filters;
            return {filters: newFilters, rowsCount: 0, pages: {}};
        },
        incrementVersion: ({ version }) => () => ({
            version: version + 1
        })
    }),
    withHandlers({
        onLoad: ({ setData = () => {}, onLoad = () => {}} = {}) => (...args) => {
            setData(...args);
            onLoad(...args);
        }
    }),
    withPropsOnChange(
        ["enableColumnFilters"],
        props => ({ displayFilters: props.enableColumnFilters })
    ),
    withPropsOnChange(
        ["pages"],
        props => ({
            rows: props.pages
        })
    ),
    withHandlers({ rowGetter: props => i => getRow(i, props.rows, props.size) }),
    propsStreamFactory
);

