import {
    sort,
    selectFeatures,
    deselectFeatures,
    featureModified,
    updateFilter,
    activateTemporaryChanges
} from '../../actions/featuregrid';

const range = (start, end) => Array.from({length: (end + 1 - start)}, (v, k) => k + start);

export default {
    onGridSort: (sortBy, sortOrder) => sort(sortBy, sortOrder),
    onAddFilter: (update = {}) => updateFilter(update),
    onTemporaryChanges: (v) => activateTemporaryChanges(v),
    onGridRowsUpdated: ({fromRow, toRow, updated}, rowGetter) => {

        const updatedValue = {
            Boolean: {Boolean: null},
            String: {String: null}
        };

        let features = range(fromRow, toRow).map(r => rowGetter(r)).filter(f =>
            Object.keys(updated || {}).filter(k => f.properties[k] !== updated[k]).length > 0
        );
        const key = Object.keys(updated)[0];
        const newValue = updated.String === '' || updated.Boolean === '' ? updatedValue[key] : updated;
        const checkedFeatures = updated.String === '' || updated.Boolean === '' ? [] : features;
        return featureModified(checkedFeatures, newValue);
    },
    onRowsToggled: (rows, rowGetter) => selectFeatures(rows.map(r => rowGetter(r.rowIdx)), false),
    onRowsSelected: (rows, rowGetter) => selectFeatures(rows.map(r => rowGetter(r.rowIdx)), true),
    onRowsDeselected: (rows, rowGetter) => deselectFeatures(rows.map(r => rowGetter(r.rowIdx)))
};
