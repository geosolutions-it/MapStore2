const React = require('react');
const PropTypes = require('prop-types');
const {isArray} = require('lodash');
const AttributeEditor = require('./AttributeEditor');
const PagedCombobox = require('../../../misc/PagedCombobox');
const axios = require('../../../../libs/ajax');
const {wfsURLSelector, typeNameSelector} = require('../../../../selectors/query');
const {maxFeaturesWPSSelector} = require('../../../../selectors/queryform');
const nanToNull = v => isNaN(v) ? null : v;
const {connect} = require('react-redux');
const {setObservableConfig, mapPropsStreamWithConfig, withState, withHandlers, compose/*, createEventHandler*/} = require('recompose');
const Rx = require('rxjs');
const rxjsConfig = require('recompose/rxjsObservableConfig').default;

const {getParsedUrl} = require('../../../../utils/ConfigUtils');
const {getWpsPayload} = require('../../../../utils/ogc/WPS/autocomplete');
const processValue = (obj, func) => Object.keys(obj).reduce((acc, curr) => ({
    ...acc,
    [curr]: nanToNull(func(obj[curr]))}),
{});

const parsers = {
    "int": v => valueOf(v),
    "number": v => valueOf(v),
    "string": v => v
};

const {createSelector} = require("reselect");
const autocompleteEditorSelector = createSelector([
    (state) => wfsURLSelector(state),
    (state) => maxFeaturesWPSSelector(state),
    (state) => typeNameSelector(state)
], (url, wps, typeName) => ({
    url: getParsedUrl(url, {"outputFormat": "json"}),
    maxFeaturesWPS: wps,
    typeName
}));

class AutocompleteEditor extends AttributeEditor {
    static propTypes = {
        column: PropTypes.object,
        dataType: PropTypes.string,
        inputProps: PropTypes.object,
        isValid: PropTypes.func,
        onBlur: PropTypes.func,
        url: PropTypes.string,
        value: PropTypes.string
    };
    static defaultProps = {
        isValid: () => true,
        dataType: "string"
    };
    constructor(props) {
        super(props);
        this.validate = (value) => {
            try {
                if (parsers[this.props.dataType] || parsers.string) {
                    return this.props.isValid(value[this.props.column && this.props.column.key]);
                }
            } catch (e) {
                return false;
            }
        };
        this.getValue = () => {
            const updated = super.getValue();
            try {
                return processValue(updated, parsers[this.props.dataType] || parsers.string);
            } catch (e) {
                return updated;
            }
        };
    }
    /*
    TODO use stream to populate props and use set state instead of props
    hoc per passare valore da render a get value???????????
    */
    render() {
        setObservableConfig(rxjsConfig);
        // fetch data from wps service
        const mapPropsStream = mapPropsStreamWithConfig(rxjsConfig);
        const autocompleteEnhancer = mapPropsStream(props$ => {
            const rxjsProps$ = Rx.Observable.from(props$);
            /*
            apply debounce for certain actions
            .debounce((action) => {
                return Rx.Observable.timer(action.fieldOptions.delayDebounce || 0);
            })
            */
            const fetchingData = rxjsProps$.switchMap(p => {
                const data = getWpsPayload({
                        attribute: p.autocompleteProps.attribute,
                        layerName: p.typeName,
                        maxFeatures: p.maxFeaturesWPS,
                        startIndex: (p.currentPage - 1) * p.maxFeaturesWPS,
                        value: p.value
                    });
                return Rx.Observable.fromPromise(
                    axios.post(p.url, data, {
                        timeout: 60000,
                        headers: {'Accept': 'application/json', 'Content-Type': 'application/xml'}
                    }).then(response => { return {fetchedData: response.data, props: p}; }));
            }).startWith({values: {}});
            const timeElapsed$ = Rx.Observable.interval(2000).take(1).map((time) => ({busy: time % 4 === 0})).startWith({busy: true});

            return fetchingData.combineLatest(timeElapsed$, (data, {}) => ({
                data: isArray(data && data.fetchedData && data.fetchedData.values) ? data.fetchedData.values.map(v => {return {label: v, value: v}; }) : [],
                valuesCount: data && data.fetchedData && data.fetchedData.size,
                currentPage: data && data.props && data.props.currentPage,
                prevValue: data && data.props && data.props.autocompleteProps && data.props.autocompleteProps.value,
                maxFeatures: data && data.props && data.props.maxFeaturesWPS,
                increment: data && data.props && data.props.increment,
                select: data && data.props && data.props.select,
                decrement: data && data.props && data.props.decrement,
                change: data && data.props && data.props.change,
                selected: data && data.props && data.props.selected,
                value: data && data.props && data.props.value,
                busy: false
            }));
        });

        // component enhanced with props from stream, store, and local state
        const AutocompleteEnhanced = autocompleteEnhancer(({select, increment, decrement, change, value, valuesCount, maxFeatures, currentPage, busy, data, loading = false }) => {
            const numberOfPages = Math.ceil(valuesCount / maxFeatures);
            return (<PagedCombobox
                pagination={{firstPage: currentPage === 1, lastPage: currentPage === numberOfPages, paginated: true,
                    nextPageIcon: "chevron-right", prevPageIcon: "chevron-left",
                    loadPrevPage: () => {}, loadNextPage: () => {}}}
                busy={busy} dropUp={false} data={data}
                onFocus={decrement} onToggle={increment} onChange={change} onSelect={select}
                selectedValue={value} loading={loading}/>);
        });
        // state enhancer for local props
        const addCounting = compose(
            withState('currentPage', 'setCounter', 1),
            withState('value', 'setValue', this.props.value),
            withState('selected', 'setSelected', false),
            withHandlers({
                increment: ({ setCounter }) => () => setCounter(n => n + 1),
                change: (props) => (n) => {
                    if (props.selected) {
                        props.setSelected(() => false);
                        props.setValue(() => n);
                    }

                },
                select: (props) => () => props.setSelected(() => true),
                decrement: ({ setCounter }) => () => setCounter(n => n - 1)
          })
        );
        // connecting a "state enhanced" Autocomplete component to the store
        const ConnectedPagedCombobox = connect(autocompleteEditorSelector, {},
            (stateProps, dispatchProps, ownProps) => ({
                ...stateProps,
                ...dispatchProps,
                ...ownProps,
                autocompleteProps: {
                    attribute: this.props.column && this.props.column.key,
                    value: this.props.value
                }
            }))(addCounting(AutocompleteEnhanced));

        return <ConnectedPagedCombobox/>;
    }
}

module.exports = AutocompleteEditor;
