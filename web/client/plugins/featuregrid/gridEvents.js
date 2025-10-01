import {
    sort,
    selectFeatures,
    deselectFeatures,
    featureModified,
    updateFilter,
    activateTemporaryChanges,
    customizeAttribute
} from '../../actions/featuregrid';

const range = (start, end) => Array.from({length: (end + 1 - start)}, (v, k) => k + start);

export default {
    onGridSort: (sortBy, sortOrder) => sort(sortBy, sortOrder),
    onAddFilter: (update = {}) => updateFilter(update),
    onTemporaryChanges: (v) => activateTemporaryChanges(v),
    onGridRowsUpdated: ({fromRow, toRow, updated}, rowGetter) => {
        let features = range(fromRow, toRow).map(r => rowGetter(r)).filter(f =>
            Object.keys(updated || {}).filter(k => f.properties[k] !== updated[k]).length > 0
        );
        return featureModified(features, updated);
    },
    onRowsToggled: (rows, rowGetter) => selectFeatures(rows.map(r => rowGetter(r.rowIdx)), false),
    onRowsSelected: (rows, rowGetter) => selectFeatures(rows.map(r => rowGetter(r.rowIdx)), true),
    onRowsDeselected: (rows, rowGetter) => deselectFeatures(rows.map(r => rowGetter(r.rowIdx))),
    onColumnResize:
                (colIdx, width, rg, d, a, columns) => {
                    const colName = columns?.[colIdx]?.name;
                    return customizeAttribute(colName, 'width', width);
                }
};
