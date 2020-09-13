/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {connect} from 'react-redux';
import {createSelector, createStructuredSelector} from 'reselect';
import {bindActionCreators} from 'redux';
import { get, pick } from 'lodash';
import {compose, lifecycle} from 'recompose';
import ReactDock from 'react-dock';

import { createPlugin } from '../utils/PluginsUtils';

import * as epics from '../epics/featuregrid';
import * as featuregrid from '../reducers/featuregrid';

import Grid from '../components/data/featuregrid/FeatureGrid';
import {paginationInfo, describeSelector, wfsURLSelector, typeNameSelector} from '../selectors/query';
import {modeSelector, changesSelector, newFeaturesSelector, hasChangesSelector, selectedFeaturesSelector, getDockSize} from '../selectors/featuregrid';
import { toChangesMap} from '../utils/FeatureGridUtils';
import {getPanels, getHeader, getFooter, getDialogs, getEmptyRowsView, getFilterRenderers} from './featuregrid/panels/index';
import BorderLayout from '../components/layout/BorderLayout';
const EMPTY_ARR = [];
const EMPTY_OBJ = {};
import {gridTools, gridEvents, pageEvents, toolbarEvents} from './featuregrid/index';
import { initPlugin, sizeChange, setUp} from '../actions/featuregrid';
import ContainerDimensions from 'react-container-dimensions';
import {mapLayoutValuesSelector} from '../selectors/maplayout';


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
  * @prop {object} cfg.editingAllowedRoles array of user roles allowed to enter in edit mode
  * @prop {boolean} cfg.virtualScroll default true. Activates virtualScroll. When false the grid uses normal pagination
  * @prop {number} cfg.maxStoredPages default 5. In virtual Scroll mode determines the size of the loaded pages cache
  * @prop {number} cfg.vsOverScan default 20. Number of rows to load above/below the visible slice of the grid
  * @prop {number} cfg.scrollDebounce default 50. milliseconds of debounce interval between two scroll event
  * @prop {boolean} cfg.showFilteredObject default false. Displays spatial filter selection area when true
  * @prop {boolean} cfg.showTimeSync default false. Shows the button to enable time sync
  * @prop {boolean} cfg.timeSync default false. If true, the timeSync is active by default.
  * @classdesc
  * FeatureEditor Plugin Provides functionalities to browse/edit data via WFS. The grid can be configured to use paging or
  * <br/>virtual scroll mechanisms. By default virtual scroll is enabled. When on virtual scroll mode, the maxStoredPages param
  * <br/>sets the size of loaded pages cache, while vsOverscan and scrollDebounce params determine the behavior of grid scrolling
  * <br/>and of row loading.
  * <br/>Furthermore it can be configured passing custom editors. Rules are applied in order and the first rule that match the regex wins
  * <br/>That means that for those conditions it is used the custom editor specified in the editor param.
  * <br/>All the conditions inside a rule must match to apply the editor.
  * <br/>If no rule is applied then it will be used the default editor based on the dataType of that column.
  * <br/>At least one of the three kind of regex must be specified.
  * <br/>Editor props are optionally.
  * <br/>Inside localConfig you can specify different rules in an array.
  * <br/> <li> editor: name of the editor used</li>
  * <br/> editorProps are props passed to the custom editor and used also to create a custom cqlFilter:
  * <ul>
  *     <li> values: force an editor to use a specific list of values </li>
  *     <li> forceSelection: force the editor to use a defaultOption as value </li>
  *     <li> defaultOption: value used as default if forceSelection is true </li>
  *     <li> allowEmpty: if true it accept empty string as value </li>
  *     <li> filterProps: </li>
  *     <ul>
  *         <li> blacklist: array used to exclude some word for the wfs call </li>
  *         <li> maxFeatures:max number of features fetched for each wfs request </li>
  *         <li> queriableAttributes: attributes used to create the cql filter </li>
  *         <li> predicate: predicate used to create the cql_filter </li>
  *         <li> typeName: layer on which the wfs search is performed </li>
  *         <li> valueField: property used as value based on the data passed to the editors (from stream)
  *         <li> returnFullData: if true it returns the full data given from the response </li>
  *     </ul>
  * </ul>
  * @example
  * {
  *   "name": "FeatureEditor",
  *   "cfg": {
  *     "customEditorsOptions": {
  *       "rules": [{
  *         "regex": {
  *           "attribute": "NAME_OF_THE_ATTRIBUTE",
  *           "url": "regex to match a specific url",
  *           "typeName": "layerName"
  *         },
  *         "editor": "DropDownEditor",
  *         "editorProps": {
  *           "values": ["Opt1", "Opt2"],
  *           "forceSelection": false,
  *           "defaultOption": "Opt1",
  *           "allowEmpty": true,
  *           "filterProps": {
  *             "blacklist": ["via", "piazza", "viale"],
  *             "maxFeatures": 3,
  *             "queriableAttributes": ["ATTRIBUTE1"],
  *             "predicate": "ILIKE",
  *             "typeName": "WORKSPACE:LAYER",
  *             "valueField": "VALUE",
  *             "returnFullData": true
  *           }
  *         }
  *       }]
  *     },
  *   "editingAllowedRoles": ["ADMIN"]
  *   }
  * }
  *
*/
const FeatureDock = (props = {
    tools: EMPTY_OBJ,
    dialogs: EMPTY_OBJ,
    select: EMPTY_ARR
}) => {
    const dockProps = {
        dimMode: "none",
        defaultSize: 0.35,
        fluid: true,
        isVisible: props.open,
        maxDockSize: 0.7,
        minDockSize: 0.1,
        position: "bottom",
        setDockSize: () => {},
        zIndex: 1030
    };
    // columns={[<aside style={{backgroundColor: "red", flex: "0 0 12em"}}>column-selector</aside>]}

    return (
        <Dock {...dockProps} onSizeChange={size => { props.onSizeChange(size, dockProps); }}>
            {props.open &&
        <ContainerDimensions>
            { ({ height }) =>
            // added height to solve resize issue in firefox, edge and ie
                <BorderLayout
                    className="feature-grid-container"
                    key={"feature-grid-container"}
                    height={height - (62 + 32)}
                    header={getHeader()}
                    columns={getPanels(props.tools)}
                    footer={getFooter(props)}>
                    {getDialogs(props.tools)}
                    <Grid
                        editingAllowedRoles={props.editingAllowedRoles}
                        initPlugin={props.initPlugin}
                        customEditorsOptions={props.customEditorsOptions}
                        autocompleteEnabled={props.autocompleteEnabled}
                        url={props.url}
                        typeName={props.typeName}
                        filterRenderers={getFilterRenderers(props.describe)}
                        enableColumnFilters={props.enableColumnFilters}
                        emptyRowsView={getEmptyRowsView()}
                        focusOnEdit={props.focusOnEdit}
                        newFeatures={props.newFeatures}
                        changes={props.changes}
                        mode={props.mode}
                        select={props.select}
                        key={"feature-grid-container"}
                        columnSettings={props.attributes}
                        gridEvents={props.gridEvents}
                        pageEvents={props.pageEvents}
                        describeFeatureType={props.describe}
                        features={props.features}
                        minHeight={600}
                        tools={props.gridTools}
                        pagination={props.pagination}
                        pages={props.pages}
                        virtualScroll={props.virtualScroll}
                        maxStoredPages={props.maxStoredPages}
                        vsOverScan={props.vsOverScan}
                        scrollDebounce={props.scrollDebounce}
                        size={props.size}
                    />
                </BorderLayout> }

        </ContainerDimensions>
            }
        </Dock>);
};
const selector = createSelector(
    state => get(state, "featuregrid.open"),
    state => get(state, "queryform.autocompleteEnabled"),
    state => wfsURLSelector(state),
    state => typeNameSelector(state),
    state => get(state, 'featuregrid.features') || EMPTY_ARR,
    describeSelector,
    state => get(state, "featuregrid.attributes"),
    state => get(state, "featuregrid.tools"),
    selectedFeaturesSelector,
    modeSelector,
    changesSelector,
    newFeaturesSelector,
    hasChangesSelector,
    state => get(state, 'featuregrid.focusOnEdit') || [],
    state => get(state, 'featuregrid.enableColumnFilters'),
    createStructuredSelector(paginationInfo),
    state => get(state, 'featuregrid.pages'),
    state => get(state, 'featuregrid.pagination.size'),
    (open, autocompleteEnabled, url, typeName, features = EMPTY_ARR, describe, attributes, tools, select, mode, changes, newFeatures = EMPTY_ARR, hasChanges, focusOnEdit, enableColumnFilters, pagination, pages, size) => ({
        open,
        autocompleteEnabled,
        url,
        typeName,
        hasChanges,
        newFeatures,
        features,
        describe,
        attributes,
        tools,
        select,
        mode,
        focusOnEdit,
        enableColumnFilters,
        changes: toChangesMap(changes),
        pagination,
        pages,
        size
    })
);
const EditorPlugin = compose(
    connect(selector,
        (dispatch) => ({
            onMount: bindActionCreators(setUp, dispatch),
            gridEvents: bindActionCreators(gridEvents, dispatch),
            pageEvents: bindActionCreators(pageEvents, dispatch),
            initPlugin: bindActionCreators((options) => initPlugin(options), dispatch),
            toolbarEvents: bindActionCreators(toolbarEvents, dispatch),
            gridTools: gridTools.map((t) => ({
                ...t,
                events: bindActionCreators(t.events, dispatch)
            })),
            onSizeChange: (...params) => dispatch(sizeChange(...params))
        })
    ),
    lifecycle({
        componentDidMount() {
            // only the passed properties will be picked
            this.props.onMount(pick(this.props, ['showFilteredObject', 'showTimeSync', 'timeSync']));
        }
    })
)(FeatureDock);

export default createPlugin('FeatureEditor', {
    component: EditorPlugin,
    epics,
    reducers: {
        featuregrid
    },
    containers: {
        TOC: {
            doNotHide: true,
            name: "FeatureEditor"
        }
    }
});
