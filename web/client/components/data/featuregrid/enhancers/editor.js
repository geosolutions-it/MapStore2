const {featureTypeToGridColumns, getToolColumns, getRow, getGridEvents, applyAllChanges, createNewAndEditingFilter} = require('../../../../utils/FeatureGridUtils');
const EditorRegistry = require('../../../../utils/featuregrid/EditorRegistry');
const {compose, withPropsOnChange, withHandlers, defaultProps} = require('recompose');
const {isNil} = require('lodash');
const {getFilterRenderer} = require('../filterRenderers');
const {getFormatter} = require('../formatters');
const {manageFilterRendererState} = require('../enhancers/filterRenderers');

const editors = require('../editors');
const featuresToGrid = compose(
    defaultProps({
        autocompleteEnabled: false,
        initPlugin: () => {},
        url: "",
        typeName: "",
        enableColumnFilters: false,
        columns: [],
        features: [],
        newFeatures: [],
        select: [],
        changes: {},
        focusOnEdit: true,
        editors
    }),
    withPropsOnChange("showDragHandle", ({showDragHandle = false} = {}) => ({
        className: showDragHandle ? 'feature-grid-drag-handle-show' : 'feature-grid-drag-handle-hide'
    })),
    withPropsOnChange(
        ["enableColumnFilters"],
        props => ({displayFilters: props.enableColumnFilters})
    ),
    withPropsOnChange(
        ["editingAllowedRoles"],
        props => ({
            editingAllowedRoles: props.editingAllowedRoles,
            initPlugin: props.initPlugin
        })
    ),
    withPropsOnChange(
        ["autocompleteEnabled"],
        props => ({autocompleteEnabled: props.autocompleteEnabled})
    ),
    withPropsOnChange(
        ["url"],
        props => ({url: props.url})
    ),
    withPropsOnChange(
        ["typeName"],
        props => ({typeName: props.typeName})
    ),
    withPropsOnChange(
        ["features", "newFeatures", "changes"],
        props => ({
            rows: ( [...props.newFeatures, ...props.features] : props.features)
                .filter(props.focusOnEdit ? createNewAndEditingFilter(props.changes && Object.keys(props.changes).length > 0, props.newFeatures, props.changes) : () => true)
                .map(orig => applyAllChanges(orig, props.changes)).map(result =>
                    ({...result,
                        get: key => {
                            return (key === "id" || key === "geometry" || key === "_new") ? result[key] : result.properties && result.properties[key];
                        }
                    }))
        })
    ),
    withPropsOnChange(
        ["newFeatures", "changes", "focusOnEdit"],
        props => ({
            isFocused: props.focusOnEdit && (props.changes && Object.keys(props.changes).length > 0 || props.newFeatures && props.newFeatures.length > 0 )
        })
    ),
    withPropsOnChange(
        ["features", "newFeatures", "changes", "focusOnEdit"],
        props => ({
            rowsCount: props.rows && props.rows.length || 0
        })
    ),
    withHandlers({rowGetter: props => i => getRow(i, props.rows)}),
    withPropsOnChange(
        ["describeFeatureType", "columnSettings", "tools", "actionOpts", "mode", "isFocused"],
        props => ({
            columns: getToolColumns(props.tools, props.rowGetter, props.describeFeatureType, props.actionOpts)
                .concat(featureTypeToGridColumns(props.describeFeatureType, props.columnSettings, {
                    editable: props.mode === "EDIT",
                    sortable: !props.isFocused
                }, {
                    getEditor: (desc) => {
                        const generalProps = {
                            onTemporaryChanges: props.gridEvents && props.gridEvents.onTemporaryChanges,
                            autocompleteEnabled: props.autocompleteEnabled,
                            url: props.url,
                            typeName: props.typeName
                        };
                        const regexProps = {attribute: desc.name, url: props.url, typeName: props.typeName};
                        const rules = props.customEditorsOptions && props.customEditorsOptions.rules || [];
                        const editorProps = {type: desc.localType, props};
                        const editor = EditorRegistry.getCustomEditor(regexProps, rules, editorProps);

                        if (!isNil(editor)) {
                            return editor;
                        }
                        return props.editors(desc.localType, generalProps);
                    },
                    getFilterRenderer: ({localType=""} = {}, name) => {
                        if (props.filterRenderers && props.filterRenderers[name]) {
                            return props.filterRenderers[name];
                        }
                        return manageFilterRendererState(getFilterRenderer(localType));
                    },
                    getFormatter: (desc) => getFormatter(desc)
                }))
            })
    ),
    withPropsOnChange(
        ["gridOpts", "describeFeatureType", "actionOpts", "mode", "select"],
        props => {
            // bind proper events and setup the colums array
            // bind and get proper grid events from gridEvents object
            let {
                onRowsSelected = () => {},
                onRowsDeselected = () => {},
                onRowsToggled = () => {},
                hasTemporaryChanges = () => {},
                ...gridEvents} = getGridEvents(props.gridEvents, props.rowGetter, props.describeFeatureType, props.actionOpts);

            // setup gridOpts setting app selection events binded
            let gridOpts = props.gridOpts;
            gridOpts = {
                ...gridOpts,
                enableCellSelect: props.mode === "EDIT",
                rowSelection: {
                    showCheckbox: props.mode === "EDIT",
                    selectBy: {
                        keys: {
                            rowKey: 'id',
                            values: props.select.map(f => f.id)
                        }
                    },
                    onRowsSelected,
                    onRowsDeselected
                }
            };

            // set selection by row click if checkbox are not present is enabled
            gridEvents.onRowClick = (rowIdx, row) => {
                if (rowIdx >= 0) {
                    onRowsToggled([{rowIdx, row}]);
                }
            };
            return {
                ...gridEvents,
                ...gridOpts
            };
        }
    )
);
module.exports = {
    featuresToGrid
};
