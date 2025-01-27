/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useMemo} from 'react';
import {connect} from 'react-redux';
import {createSelector, createStructuredSelector} from 'reselect';
import {bindActionCreators} from 'redux';
import { get, pick, isEqual } from 'lodash';
import {compose, lifecycle, defaultProps } from 'recompose';
import ReactDock from 'react-dock';
import ContainerDimensions from 'react-container-dimensions';

import Grid from '../../components/data/featuregrid/FeatureGrid';
import BorderLayout from '../../components/layout/BorderLayout';
import { toChangesMap} from '../../utils/FeatureGridUtils';
import { sizeChange, setUp, setSyncTool } from '../../actions/featuregrid';
import {mapLayoutValuesSelector} from '../../selectors/maplayout';
import {paginationInfo, describeSelector, wfsURLSelector, typeNameSelector, isSyncWmsActive} from '../../selectors/query';
import {modeSelector, changesSelector, newFeaturesSelector, hasChangesSelector, selectedLayerFieldsSelector, selectedFeaturesSelector, getDockSize} from '../../selectors/featuregrid';

import {getPanels, getHeader, getFooter, getDialogs, getEmptyRowsView, getFilterRenderers} from './panels/index';
import {gridTools, gridEvents, pageEvents, toolbarEvents} from './index';

const EMPTY_ARR = [];
const EMPTY_OBJ = {};


const Dock = connect(createSelector(
    getDockSize,
    state => mapLayoutValuesSelector(state, {transform: true}),
    (size, dockStyle) => ({
        size,
        dockStyle
    })
)
)(ReactDock);
/**
  * @name FeatureEditor
  * @memberof plugins
  * @class
  * @prop {object} cfg.customEditorsOptions Set of options used to connect the custom editors to the featuregrid. It contains a set of
  * `rules`.
  * Each rule in the `rules` array contains:
  * - `editor`: the string name of the editor. For more information about custom editors and their specific props (`editorProps`), see {@link api/framework#components.data.featuregrid.editors.customEditors}
  * - `regex`: An object with 2 regular expression, `attribute` and `typeName` that have to match with the specific attribute name and feature type name.
  * - `editorProps`: the properties to pass to the specific editor.
  * Example:
  * ```json
  * "customEditorsOptions": {
  *    "rules": [{
  *        "regex": {
  *            "attribute": "^NUMERIC_ATTRIBUTE_NAME$",
  *            "typeName": "^workspace:layer_name$"
  *        },
  *        "editor": "NumberEditor"
  *    }, {
  *        "regex": {
  *            "attribute": "^att_varchar_constr$",
  *            "typeName": "^test:mapstore_test$"
  *        },
  *        "editor": "DropDownEditor",
  *        "editorProps": {
  *            "values": ["Option1", "Option2", "Option3", "Option4"]
  *        }
  *    }
  *    }]
  *}
  * ```
  * @prop {string[]} cfg.editingAllowedRoles array of user roles allowed to enter in edit mode.
  * Support predefined ('ADMIN', 'USER', 'ALL') and custom roles. Default value is ['ADMIN'].
  * Configuring with ["ALL"] allows all users to have access regardless of user's permission.
  * @prop {string[]} cfg.editingAllowedGroups array of user groups allowed to enter in edit mode.
  * When configured, gives the editing permissions to users members of one of the groups listed.
  * @prop {boolean} cfg.virtualScroll default true. Activates virtualScroll. When false the grid uses normal pagination
  * @prop {number} cfg.maxStoredPages default 5. In virtual Scroll mode determines the size of the loaded pages cache
  * @prop {number} cfg.vsOverScan default 20. Number of rows to load above/below the visible slice of the grid
  * @prop {number} cfg.scrollDebounce default 50. milliseconds of debounce interval between two scroll event
  * @prop {boolean} cfg.showFilteredObject default false. Displays spatial filter selection area when true
  * @prop {boolean} cfg.showTimeSync default false. Shows the button to enable time sync
  * @prop {boolean} cfg.timeSync default false. If true, the timeSync is active by default.
  * @prop {boolean} cfg.enableMapFilterSync default false. If true, the wms sync tool will be active by default.
  * @prop {number} cfg.maxZoom the maximum zoom level for the "zoom to feature" functionality
  * @prop {boolean} cfg.hideCloseButton hide the close button from the header
  * @prop {boolean} cfg.hideLayerTitle hide the layer title from the header
  * @prop {boolean} cfg.snapTool default true. Shows the button to enable snap tool.
  * @prop {object} cfg.snapConfig object containing settings for snap tool.
  * @prop {boolean} cfg.snapConfig.vertex activates or deactivates snapping to the vertices of vector shapes.
  * @prop {boolean} cfg.snapConfig.edge activates or deactivates snapping to the edges of vector shapes.
  * @prop {number} cfg.snapConfig.pixelTolerance Pixel tolerance for considering the pointer close enough to a segment or vertex for snapping.
  * @prop {string} cfg.snapConfig.strategy defines strategy function for loading features. Supported values are "bbox" and "all".
  * @prop {number} cfg.snapConfig.maxFeatures defines features limit for request that loads vector data of WMS layer.
  * @prop {array} cfg.snapConfig.additionalLayers Array of additional layers to include into snapping layers list. Provides a way to include layers from "state.additionallayers"
  * @prop {object} cfg.dateFormats object containing custom formats for one of the date/time attribute types. Following keys are supported: "date-time", "date", "time"
  * @prop {boolean} cfg.useUTCOffset avoid using UTC dates in attribute table and datetime editor, should be kept consistent with dateFormats, default is true
  * @prop {boolean} cfg.showPopoverSync default false. Hide the popup of map sync if false, shows the popup of map sync if true
  *
  * @classdesc
  * `FeatureEditor` Plugin, also called *FeatureGrid*, provides functionalities to browse/edit data via WFS. The grid can be configured to use paging or
  * <br/>virtual scroll mechanisms. By default, virtual scroll is enabled. When on virtual scroll mode, the maxStoredPages param
  * sets the size of loaded pages cache, while vsOverscan and scrollDebounce params determine the behavior of grid scrolling
  * and of row loading.
  * <br/>Furthermore it can be configured to use custom editor cells for certain layers/columns, specifying the rules to recognize them. If no rule matches, then it will be used the default editor based on the dataType of that column.
  * <br/>Example:
  * ```json
  * {
  *   "name": "FeatureEditor",
  *   "cfg": {
  *     "maxZoom": 21,
  *     "customEditorsOptions": {
  *       "rules": [{
  *         "regex": {
  *           "attribute": "NAME_OF_THE_ATTRIBUTE",
  *           "url": "regex to match a specific url",
  *           "typeName": "layerName"
  *         },
  *         "editor": "DropDownEditor",
  *         "editorProps": {
  *           "values": ["Opt1", "Opt2"]
  *         }
  *       }]
  *     },
  *     "editingAllowedRoles": ["ADMIN"],
  *     "snapTool": true,
  *     "snapConfig": {
  *       "vertex": true,
  *       "edge": true,
  *       "pixelTolerance": 10,
  *       "additionalLayers": [
  *         "ADDITIONAL_LAYER_ID"
  *       ],
  *       "strategy": "bbox",
  *       "maxFeatures": 4000
  *     },
  *     "dateFormats": {
  *       "date-time": "YYYY-MM-DDTHH:mm:ss[Z]",
  *       "date": "YYYY-MM-DD[Z]",
  *       "time": "HH:mm:ss[Z]"
  *     },
  *     "useUTCOffset": true
  *   }
  * }
  * ```
  *
  * As plugin container, it can render additional components coming from other plugins.
  * You can render additional buttons to the Toolbar by configuring a container with your component and `"target": 'toolbar'`.
  * The component will receive as props all the properties passed to the featuregrid Toolbar. Some of them are  :
  * - `disabled`: tells when the toolbar is completely disabled.
  * - `mode`: "EDIT" or "VIEW". Tells if the feature grid is in edit mode or in view mode.
  * - `results`: the results in the table (with virtual scrolling, only the available ones).
  * - `
  * Example:
  * ```javascript
  * createPlugin('MyPlugin',{
  *     containers: {
  *         FeatureEditor: {
  *            doNotHide: true,
  *            // position 20 to 99, to put buttons before "settings" and "sync" buttons (that should be at the end).
  *            // <1 to put them on top. > 1000 to but at the end (not suggested because of #7271)
  *            position: 20,
  *            name: "MyPlugin",
  *            target: "toolbar",
  *            Component: MyComponent
  *        },
  *     }
  * })
  * ```
  *
*/
const FeatureDock = (props = {
    tools: EMPTY_OBJ,
    dialogs: EMPTY_OBJ,
    select: EMPTY_ARR
}) => {
    const virtualScroll  = props.virtualScroll ?? true;
    const maxZoom  = props?.pluginCfg?.maxZoom;
    const dockProps = {
        dimMode: "none",
        defaultSize: 0.35,
        fluid: true,
        isVisible: props.open,
        maxDockSize: 0.7,
        minDockSize: 0.1,
        position: "bottom",
        setDockSize: () => {},
        zIndex: 1060
    };
    const items = props?.items ?? [];
    const toolbarItems = items.filter(({target}) => target === 'toolbar');
    const filterRenderers = useMemo(() => {
        return getFilterRenderers(props.describe, props.fields, props.isWithinAttrTbl);
    }, [props.describe, props.fields]);
    return (
        <div className={"feature-grid-wrapper"}>
            <Dock  {...dockProps} onSizeChange={size => { props.onSizeChange(size, dockProps); }}>
                {props.open &&
                    (<ContainerDimensions>
                        { ({ height }) =>
                        // added height to solve resize issue in firefox, edge and ie
                            <BorderLayout
                                className="feature-grid-container"
                                key={"feature-grid-container"}
                                height={height - (42 + 32)}
                                header={getHeader({
                                    toolbarItems,
                                    hideCloseButton: props.hideCloseButton,
                                    hideLayerTitle: props.hideLayerTitle,
                                    pluginCfg: props.pluginCfg
                                })}
                                columns={getPanels(props.tools)}
                                footer={getFooter(props)}>
                                {getDialogs(props.tools)}
                                <Grid
                                    isWithinAttrTbl
                                    showCheckbox={props.showCheckbox}
                                    editingAllowedRoles={props.editingAllowedRoles}
                                    customEditorsOptions={props.customEditorsOptions}
                                    autocompleteEnabled={props.autocompleteEnabled}
                                    url={props.url}
                                    typeName={props.typeName}
                                    filterRenderers={filterRenderers}
                                    enableColumnFilters={props.enableColumnFilters}
                                    emptyRowsView={getEmptyRowsView()}
                                    focusOnEdit={props.focusOnEdit}
                                    newFeatures={props.newFeatures}
                                    changes={props.changes}
                                    mode={props.mode}
                                    select={props.select}
                                    key={"feature-grid-container"}
                                    columnSettings={props.attributes}
                                    fields={props.fields}
                                    gridEvents={props.gridEvents}
                                    pageEvents={props.pageEvents}
                                    describeFeatureType={props.describe}
                                    features={props.features}
                                    minHeight={600}
                                    tools={props.gridTools}
                                    pagination={props.pagination}
                                    pages={props.pages}
                                    virtualScroll={virtualScroll}
                                    maxStoredPages={props.maxStoredPages}
                                    vsOverScan={props.vsOverScan}
                                    scrollDebounce={props.scrollDebounce}
                                    size={props.size}
                                    actionOpts={{maxZoom}}
                                    dateFormats={props.dateFormats}
                                    useUTCOffset={props.useUTCOffset}
                                />
                            </BorderLayout> }

                    </ContainerDimensions>)
                }
            </Dock>
        </div>);
};
export const selector = createStructuredSelector({
    open: state => get(state, "featuregrid.open"),
    customEditorsOptions: state => get(state, "featuregrid.customEditorsOptions"),
    autocompleteEnabled: state => get(state, "queryform.autocompleteEnabled"),
    url: state => wfsURLSelector(state),
    typeName: state => typeNameSelector(state),
    features: state => get(state, 'featuregrid.features') || EMPTY_ARR,
    describe: describeSelector,
    fields: selectedLayerFieldsSelector,
    attributes: state => get(state, "featuregrid.attributes"),
    tools: state => get(state, "featuregrid.tools"),
    select: selectedFeaturesSelector,
    mode: modeSelector,
    changes: state => toChangesMap(changesSelector(state)),
    newFeatures: state => newFeaturesSelector(state) || EMPTY_ARR,
    hasChanges: hasChangesSelector,
    focusOnEdit: state => get(state, 'featuregrid.focusOnEdit', false),
    enableColumnFilters: state => get(state, 'featuregrid.enableColumnFilters'),
    pagination: createStructuredSelector(paginationInfo),
    pages: state => get(state, 'featuregrid.pages'),
    size: state => get(state, 'featuregrid.pagination.size')
});

const EditorPlugin = compose(
    defaultProps({
        isWithinAttrTbl: true      // a flag to show/hide operators in attribute table
    }),
    connect((state) => ({
        isSyncWmsActive: isSyncWmsActive(state)
    }),
    (dispatch) => ({
        onMount: bindActionCreators(setUp, dispatch),
        setSyncTool: bindActionCreators(setSyncTool, dispatch)
    })),
    lifecycle({
        componentDidMount() {
            // only the passed properties will be picked
            this.props.onMount(pick(this.props, ['showFilteredObject', 'showTimeSync', 'timeSync', 'customEditorsOptions']));
            if (!this.props.isSyncWmsActive) {
                if (this.props.enableMapFilterSync) {
                    this.props.setSyncTool(true);
                } else {
                    this.props.setSyncTool(false);
                }
            }
        },
        // TODO: fix this in contexts
        // due to multiple renders of plugins in contexts (one with default props, then with context props)
        // the options have to be updated when change.
        componentDidUpdate(oldProps) {
            const newOptions = pick(this.props, ['showFilteredObject', 'showTimeSync', 'timeSync', 'customEditorsOptions']);
            const oldOptions = pick(oldProps, ['showFilteredObject', 'showTimeSync', 'timeSync', 'customEditorsOptions']);
            if (!isEqual(newOptions, oldOptions) ) {
                this.props.onMount(newOptions);
            }
        }
    }),
    connect(selector,
        (dispatch) => ({
            gridEvents: bindActionCreators(gridEvents, dispatch),
            pageEvents: bindActionCreators(pageEvents, dispatch),
            toolbarEvents: bindActionCreators(toolbarEvents, dispatch),
            gridTools: gridTools.map((t) => ({
                ...t,
                events: bindActionCreators(t.events, dispatch)
            })),
            onSizeChange: (...params) => dispatch(sizeChange(...params))
        })
    )
)(FeatureDock);

export default EditorPlugin;
