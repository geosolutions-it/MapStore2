/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const {bindActionCreators} = require('redux');
const {get} = require('lodash');
const Dock = require('react-dock').default;
const Grid = require('../components/data/featuregrid/FeatureGrid');
const {resultsSelector, describeSelector, wfsURLSelector, typeNameSelector} = require('../selectors/query');
const {modeSelector, changesSelector, newFeaturesSelector, hasChangesSelector, selectedFeaturesSelector} = require('../selectors/featuregrid');
const { toChangesMap} = require('../utils/FeatureGridUtils');
const {getPanels, getHeader, getFooter, getDialogs, getEmptyRowsView, getFilterRenderers} = require('./featuregrid/panels/index');
const BorderLayout = require('../components/layout/BorderLayout');
const EMPTY_ARR = [];
const EMPTY_OBJ = {};
const {gridTools, gridEvents, pageEvents, toolbarEvents} = require('./featuregrid/index');
const ContainerDimensions = require('react-container-dimensions').default;

/**
  * @name FeatureEditor
  * @memberof plugins
  * @class
  * @prop {object} cfg.customEditorsOptions Set of options used to connect the custom editors to the featuregrid
  * @classdesc
  * FeatureEditor Plugin Provides functionalities to browse/edit data via WFS. It can be configured passing custom editors
  * <br/>Rules are applied in order and the first rule that match the regex wins.
  * <br/>That means that for those conditions it is used the custom editor specified in the editor param.
  * <br/>All the conditions inside a rule must match to apply the editor.
  * <br/>If no rule is applied then it will be used the default editor based on the dataType of that column.
  * <br/>At least one of the three kind of regex must be specified.
  * <br/>Editor props are optionally.
  * <br/>Inside localConfig you can specify different rules in an array.
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
  *           "forceSelection": true
  *         }
  *       }]
  *     }
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
        dockSize: 0.35,
        fluid: true,
        isVisible: props.open,
        maxDockSize: 0.7,
        minDockSize: 0.1,
        position: "bottom",
        setDockSize: () => {},
        zIndex: 1030
    };
    // columns={[<aside style={{backgroundColor: "red", flex: "0 0 12em"}}>column-selector</aside>]}
    return (<Dock {...dockProps} >
        {props.open &&
        <ContainerDimensions>
        { ({ height }) =>
            // added height to solve resize issue in firefox, edge and ie
        <BorderLayout
            key={"feature-grid-container"}
            height={height - (62 + 32)}
            header={getHeader()}
            columns={getPanels(props.tools)}
            footer={getFooter(props)}>
            {getDialogs(props.tools)}
            <Grid
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
                describeFeatureType={props.describe}
                features={props.features}
                minHeight={600}
                tools={props.gridTools}/>
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
    resultsSelector,
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
    (open, autocompleteEnabled, url, typeName, features = EMPTY_ARR, describe, attributes, tools, select, mode, changes, newFeatures = EMPTY_ARR, hasChanges, focusOnEdit, enableColumnFilters) => ({
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
        changes: toChangesMap(changes)
    })
);
const EditorPlugin = connect(selector, (dispatch) => ({
    gridEvents: bindActionCreators(gridEvents, dispatch),
    pageEvents: bindActionCreators(pageEvents, dispatch),
    toolbarEvents: bindActionCreators(toolbarEvents, dispatch),
    gridTools: gridTools.map((t) => ({
        ...t,
        events: bindActionCreators(t.events, dispatch)
    }))
}))(FeatureDock);

module.exports = {
     FeatureEditorPlugin: EditorPlugin,
     epics: require('../epics/featuregrid'),
     reducers: {
         featuregrid: require('../reducers/featuregrid')
     }
 };
