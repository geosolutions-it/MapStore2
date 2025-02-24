/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { lazy } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import isEqual from "lodash/isEqual";
import { createPlugin } from '../utils/PluginsUtils';
import * as epics from '../epics/featuregrid';
import featuregrid from '../reducers/featuregrid';
import FeatureEditorFallback from '../components/data/featuregrid/FeatureEditorFallback';
import withSuspense from '../components/misc/withSuspense';
import {compose, lifecycle} from "recompose";
import { browseData } from "../actions/layers";
import { initPlugin, setViewportFilter } from "../actions/featuregrid";
import {isViewportFilterActive} from "../selectors/featuregrid";

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
  * @prop {array} cfg.snapConfig.additionalLayers Array of additional layers to include into snapping layers list. Provides a way to include layers from "state.additionallayers".
  * @prop {array} cfg.filterByViewport Activate filter by viewport tool by default.
  * @prop {array} cfg.showFilterByViewportTool Show button to toggle filter by viewport in toolbar.
  * @prop {boolean} cfg.useUTCOffset avoid using UTC dates in attribute table and datetime editor, should be kept consistent with dateFormats
  * @prop {object} cfg.dateFormats Allows to specify custom date formats ( in [ISO_8601](https://en.wikipedia.org/wiki/ISO_8601)  format) to use to display dates in the table. `date` `date-time` and `time` are the supported entries for the date format. Example:
  * @prop {boolean} cfg.showPopoverSync default false. Hide the popup of map sync if false, shows the popup of map sync if true
  * ```
  * "dateFormats": {
  *    "date-time": "MM DD YYYY - HH:mm:ss",
  *    "date": "MM DD YYYY",
  *    "time": "HH:mm:ss"
  * }
  * ```
  *
  * @classdesc
  * `FeatureEditor` Plugin, also called *FeatureGrid*, provides functionalities to browse/edit data via WFS. The grid can be configured to use paging or
  * <br/>virtual scroll mechanisms. By default virtual scroll is enabled. When on virtual scroll mode, the maxStoredPages param
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
  *   "editingAllowedRoles": ["ADMIN"],
  *   "snapTool": true,
  *   "snapConfig": {
  *     "vertex": true,
  *     "edge": true,
  *     "pixelTolerance": 10,
 *      "additionalLayers": [
 *         "ADDITIONAL_LAYER_ID"
 *      ],
 *      "strategy": "bbox",
 *      "maxFeatures": 4000
  *   },
 *    "filterByViewport": true,
 *    "showFilterByViewportTool": true
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
const EditorPlugin = connect(
    createSelector(
        [
            state => state?.featuregrid?.open,
            isViewportFilterActive
        ],
        (open, viewportFilter) => ({ open, viewportFilterInitialized: viewportFilter !== null })),
    {
        setViewportFilter,
        initPlugin
    }
)(compose(
    lifecycle({
        componentDidMount() {
            // Initialize configurations once plugin is loaded
            !this.props.viewportFilterInitialized && this.props.filterByViewport && this.props.setViewportFilter(true);
            this.props.initPlugin({
                virtualScroll: this.props.virtualScroll ?? true,
                editingAllowedRoles: this.props.editingAllowedRoles,
                editingAllowedGroups: this.props.editingAllowedGroups,
                maxStoredPages: this.props.maxStoredPages
            });
        },
        componentDidUpdate(prevProps) {
            // Re-Initialize configurations
            !this.props.viewportFilterInitialized && this.props.filterByViewport && this.props.setViewportFilter(true);

            const {virtualScroll, editingAllowedRoles, editingAllowedGroups, maxStoredPages} = this.props ?? {};
            if (prevProps.virtualScroll !== virtualScroll
                || !isEqual(prevProps.editingAllowedRoles, editingAllowedRoles)
                || !isEqual(prevProps.editingAllowedGroups, editingAllowedGroups)
                || prevProps.maxStoredPages !== maxStoredPages
            ) {
                this.props.initPlugin({
                    virtualScroll: virtualScroll ?? true,
                    editingAllowedRoles,
                    editingAllowedGroups,
                    maxStoredPages
                });
            }
        }
    }),
    withSuspense(
        props => !!props.open,
        { fallback: <FeatureEditorFallback /> }
    )
)((lazy(() => import('./featuregrid/FeatureEditor')))));

const AttributeTableButton = connect(() => ({}), {
    onClick: browseData
})(({
    onClick,
    selectedNodes,
    status,
    itemComponent,
    statusTypes,
    ...props
}) => {
    const ItemComponent = itemComponent;
    const layer = selectedNodes?.[0]?.node;
    if ([statusTypes.LAYER].includes(status) && layer?.search && !layer?.error) {
        return (
            <ItemComponent
                {...props}
                glyph="features-grid"
                tooltipId={'toc.toolFeaturesGridTooltip'}
                onClick={() => onClick({
                    ...layer,
                    url: layer?.search?.url || layer.url
                })}
            />
        );
    }
    return null;
});

export default createPlugin('FeatureEditor', {
    component: EditorPlugin,
    epics,
    reducers: {
        featuregrid
    },
    containers: {
        TOC: {
            doNotHide: true,
            name: "FeatureEditor",
            Component: AttributeTableButton,
            target: 'toolbar',
            position: 7
        }
    }
});
