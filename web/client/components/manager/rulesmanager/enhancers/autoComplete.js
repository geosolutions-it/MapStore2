const Rx = require("rxjs");
const { compose, withStateHandlers, defaultProps, createEventHandler, withProps} = require('recompose');
const propsStreamFactory = require('../../../misc/enhancers/propsStreamFactory');
const {isObject} = require("lodash");
const stop = stream$ => stream$.filter(() => false);


const sameParentFilter = ({parentsFilter: f1}, {parentsFilter: f2}) => f1 === f2;
const sameFilter = ({val: f1}, {val: f2}) => f1 === f2;
const sameEmptyRequest = ({emptyReq: f1}, {emptyReq: f2}) => f1 === f2;

// ParentFilter change so resets the data
const resetStream = prop$ => prop$.distinctUntilChanged((oP, nP) => sameParentFilter(oP, nP)).skip(1).do(({resetCombo}) => resetCombo()).let(stop);

// Trigger first loading when value change
const triggerEmptyLoadDataStream = prop$ => prop$.distinctUntilChanged((oP, nP) => sameEmptyRequest(oP, nP))
    .skip(1)
    .debounceTime(300)
    .switchMap(({emptySearch, loadingErrorMsg, nextPage, prevPage, onError, parentsFilter = {}, size = 10, pagination, loadData, setData = () => {}}) => {
        return loadData(emptySearch, 0, size, parentsFilter, true)
            .do(({count, data}) => {
                setData({
                    pagination: {...pagination, loadNextPage: nextPage, loadPrevPage: prevPage, firstPage: true, lastPage: Math.ceil(count / size) <= 1},
                    data,
                    page: 0,
                    count
                });
            }).let(stop).startWith({busy: true}).catch((e) => Rx.Observable.of(e).do(() => {
                onError(loadingErrorMsg);
            }).mapTo({busy: false})).concat(Rx.Observable.of({busy: false}));
    });

// Trigger first loading when value change
const triggerLoadDataStream = prop$ => prop$.distinctUntilChanged((oP, nP) => sameFilter(oP, nP))
    .debounceTime(300)
    .filter(({val}) => val && val.length > 0)
    .switchMap(({loadingErrorMsg, nextPage, prevPage, onError, parentsFilter = {}, val = "", size = 10, pagination, loadData, setData = () => {}}) => {
        return loadData(val, 0, size, parentsFilter, true)
            .do(({count, data}) => {
                setData({
                    pagination: {...pagination, loadNextPage: nextPage, loadPrevPage: prevPage, firstPage: true, lastPage: Math.ceil(count / size) <= 1},
                    data,
                    page: 0,
                    count
                });
            }).let(stop).startWith({busy: true}).catch((e) => Rx.Observable.of(e).do(() => {
                onError(loadingErrorMsg);
            }).mapTo({busy: false})).concat(Rx.Observable.of({busy: false}));
    });

const loadPageStream = page$ => page$
    .switchMap(({pageStep, page, parentsFilter, count, val, size,
        pagination, setData, loadData, onError, loadingErrorMsg}) => {
        const newPage = page + pageStep;
        return loadData(val, newPage, size, parentsFilter)
            .do(({data}) => {
                setData({
                    pagination: {...pagination, firstPage: newPage === 0, lastPage: Math.ceil(count / size) <= newPage + 1},
                    data,
                    page: newPage
                });
            }).let(stop).startWith({busy: true}).catch((e) => Rx.Observable.of(e).do(() => {
                onError(loadingErrorMsg);
            }).mapTo({busy: false})).concat(Rx.Observable.of({busy: false}));
    });
const dataStreamFactory = prop$ => {
    const {handler: nextPage, stream: next$ } = createEventHandler();
    const {handler: prevPage, stream: prev$ } = createEventHandler();
    const nextPage$ = Rx.Observable.from(next$);
    const prevPage$ = Rx.Observable.from(prev$);
    const page$ = Rx.Observable
        .merge(nextPage$.mapTo(1), prevPage$.mapTo(-1))
        .withLatestFrom(prop$.map(({onError, loadData, page, parentsFilter, count,
            val, size, pagination, setData, loadingErrorMsg}) => ({
            loadData, onError, page, parentsFilter, count, val, size, pagination,
            setData, loadingErrorMsg})), (pageStep, other) => ({ pageStep, ...other}));

    const $p = prop$.map(o => ({ ...o, nextPage, prevPage, nextPage$, prevPage$}));
    return triggerLoadDataStream($p).merge(triggerEmptyLoadDataStream($p), loadPageStream(page$), resetStream($p)).startWith({busy: false});
};


/**
 * Add remote loading to PaginatedCombo components. The data are managed in the enhanced state.
 * Pass as a prop an onLoad function that returns a stream$. onLoad will be called with:
 * search text, page (0 first page), size, count (if true should return the number of elements)
 * The stream has to return and object with data (array of loaded elements) and [count] the number of
 * total elements if required.
 * Also pass onValueSelected and selected props. onValueSelected is called whe the users select a value
 * from the downloaded data.
 * @name autoComplete
 * @memberof manager.rulesmanager.enhancers
 * @param  {PaginatedCombo} Component The PaginatedCombo to enhance with remote loading
 * @return {HOC}         An HOC that replaces the prop string with localized string.
 */

module.exports = compose(
    defaultProps({
        clearable: true,
        emptySearch: "%",
        stopPropagation: true,
        paginated: true,
        size: 5,
        loadData: () => Rx.Observable.of({data: [], count: 0}),
        parentsFilter: {},
        filter: false,
        dataStreamFactory,
        onValueSelected: () => {},
        onError: () => {},
        loadingErrorMsg: {
            title: "",
            message: ""
        }
    }),
    withStateHandlers(({paginated, selected, initialData = []}) => ({
        val: selected,
        typing: false,
        page: 0,
        stopChange: false,
        data: initialData,
        emptyReq: 0,
        pagination: {
            paginated: paginated,
            firstPage: false,
            lastPage: false,
            loadPrevPage: () => {},
            loadNextPage: () => {}
        }}), {
        resetCombo: (state, { initialData = []}) => () => {
            return {
                data: initialData,
                page: 0,
                val: undefined
            };
        },
        setData: ({count: oldCount}) => ({pagination, data, page = 0, count = oldCount} = {}) => ({
            pagination,
            data,
            page,
            count
        }),
        onReset: ({typing}, {onValueSelected, selected}) => () => {
            if (selected) {
                onValueSelected();
            }
            if (typing) {
                return {typing: false};
            }
            return {};
        },
        onChange: ({stopChange, val: oldVal, emptyReq}, {initialData = [], valueField}) => (val = "") => {
            if (stopChange) {
                return {stopChange: false};
            }
            const currentVal = isObject(val) && val[valueField] || val;
            const newReq = oldVal && oldVal.length > 0 && currentVal.length === 0 ? emptyReq + 1 : emptyReq;
            return currentVal.length === 0 && {typing: true, val: currentVal, data: initialData, emptyReq: newReq} || {typing: true, val: currentVal};
        },
        onToggle: ({ val = "", data, emptyReq}, {clearable, selected, onValueSelected, initialData = []}) => (open) => {
            if (!clearable && !open && val === "" && selected) {
                onValueSelected();
                return {typing: false};
            } else if (!open && val !== selected) {
                return {val: selected, data: initialData, typing: false};
            } else if (!open) {
                return {typing: false};
            } else if (open && val.length === 0 && data.length === 0) {
                return {emptyReq: emptyReq + 1};
            }
            return {};
        },
        onSelect: (state, {onValueSelected, selected, valueField}) => (select) => {
            const selectedVal = isObject(select) && select[valueField] || select;
            if (selectedVal !== selected) {
                onValueSelected(selectedVal);
            }
            return {stopChange: true};
        }
    }),
    propsStreamFactory,
    withProps(({val = "", selected = "", typing}) => {
        return {selectedValue: typing ? val : selected};
    })
);
