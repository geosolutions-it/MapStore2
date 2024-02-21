/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React, { useState, useEffect } from 'react';
import { FormControl as FormControlRB, FormGroup, InputGroup, Glyphicon, Button as ButtonRB } from 'react-bootstrap';
import { connect } from 'react-redux';
import {
    moveNode,
    updateNode,
    selectNode
} from '../../actions/layers';
import {
    layersSelector,
    groupsSelector,
    selectedNodesSelector
} from '../../selectors/layers';
import { userSelector } from '../../selectors/security';
import { currentLocaleSelector, currentLocaleLanguageSelector } from '../../selectors/locale';
import { mapSelector, mapNameSelector } from '../../selectors/map';
import { isLocalizedLayerStylesEnabledSelector } from '../../selectors/localizedLayerStyles';
import { createPlugin } from '../../utils/PluginsUtils';
import { createShallowSelectorCreator } from '../../utils/ReselectUtils';
import { NodeTypes, ROOT_GROUP_ID, DEFAULT_GROUP_ID } from '../../utils/LayersUtils';
import { StatusTypes, isSingleDefaultGroup, selectedNodesIdsToObject } from './utils/TOCUtils';
import isEqual from 'lodash/isEqual';
import usePluginItems from '../../hooks/usePluginItems';
import ZoomToLayersButton from './containers/ZoomToLayersButton';
import ReloadLayersButton from './containers/ReloadLayersButton';
import RemoveNodesButton from './containers/RemoveNodesButton';
import GroupOptionsButton from './containers/GroupOptionsButton';
import TOCSettings from './containers/TOCSettings';
import Toolbar from './components/Toolbar';
import { ControlledTOC } from './components/TOC';
import ContextMenu from './components/ContextMenu';
import { getScales, getResolutions } from '../../utils/MapUtils';
import { visualizationModeSelector } from '../../selectors/maptype';
import tooltip from '../../components/misc/enhancers/tooltip';
import localizedProps from '../../components/misc/enhancers/localizedProps';
import { registerCustomSaveHandler } from '../../selectors/mapsave';
import toc from './reducers/toc';
import { setControlProperty } from '../../actions/controls';
import { updateTOCConfig } from './actions/toc';
const Button = tooltip(ButtonRB);
const FormControl = localizedProps('placeholder')(FormControlRB);
registerCustomSaveHandler('toc', (state) => (state?.toc?.config));

/**
 * Provides Table Of Content visualization. Lists the layers on the map, organized in groups and provides the possibility to select them.
 * Based on current layer(s)/group(s) selection, shows a set of tools for the current selection.
 * This is also a plugin container. Tools injected providing only the name to the container need an internal support (deprecated). Here an example:
 * ```javascript
 * export default createPlugin('AddGroup', {
 *     component: AddGroupPlugin,
 *     containers: {
 *         TOC: {
 *             doNotHide: true,
 *             name: "AddGroup" // this works only if AddGroup is one of the plugins internally supported by TOC.
 *         }
 *     }
 * });
 * ```
 * The new **(recommended)** mode to inject tools in the TOC is by using `target`.
 * This method allows to insert a component in the defined target. Actually `toolbar` is the only target supported for the `target`, and allows to add a button on the toolbar.
 * ```javascript
 * createPlugin(
 *  'MyPlugin',
 *  {
 *      containers: {
 *         TOC: {
 *             name: "TOOLNAME", // a name for the current tool.
 *             target: "toolbar", // the target where to insert the component
 *             //In case of `target: toolbar`, `selector` determine to show or not show the tool (returning `true` or `false`).
 *             // As argument of this function you have several information, that will be passed also to the component.
 *             // - `status`: that can be `LAYER`, `LAYERS`, `GROUP` or `GROUPS`, depending if only one or more than one layer is selected.
 *             // - `selectedGroups`: current list of selected groups
 *             // - `selectedLayers`: current list of selected layers
 *             selector: ({ status }) => status === 'LAYER',
 *             // The component to render. It receives as props the same object passed to the `selector` function.
 *             Component: connect(...)(MyButton)
 *                 createSelector(layerSwipeSettingsSelector, (swipeSettings) => ({swipeSettings})),
 *             // ...
 *         },
 * // ...
 * ```
 * @memberof plugins
 * @name TOC
 * @class
 * @prop {boolean} cfg.activateFilterLayer: activate filter layers tool, default `true`
 * @prop {boolean} cfg.activateMapTitle: show map title, default `true`
 * @prop {boolean} cfg.activateToolsContainer: activate layers and group global toolbar, default `true`
 * @prop {boolean} cfg.activateRemoveLayer: activate remove layer tool, default `true`
 * @prop {boolean} cfg.activateRemoveGroup if set to false, do not show the remove button for layer groups. default `true`
 * @prop {boolean} cfg.activateSortLayer: activate drag and drop to sort layers, default `true`
 * @prop {boolean} cfg.activateAddLayerButton: activate a button to open the catalog, default `true`
 * @prop {boolean} cfg.activateAddGroupButton: activate a button to add a new group, default `true`
 * @prop {boolean} cfg.activateLayerInfoTool: activate a button to enable the layer info
 * @prop {boolean} [addLayersPermissions=true] if false, only users of role ADMIN can see the "add layers" button. Default true.
 * @prop {boolean} [removeLayersPermissions=true] if false, only users of role ADMIN have the permission to remove layers. Default true.
 * @prop {boolean} [sortingPermissions=true] if false, only users of role ADMIN have the permission to move layers in the TOC. Default true.
 * @prop {boolean} [addGroupsPermissions=true] if false, only users of role ADMIN have the permission to add groups to the TOC. Default true.
 * @prop {boolean} [removeGroupsPermissions=true] if false, only users of role ADMIN can remove groups from the TOC. Default true.
 * @prop {boolean} [layerInfoToolPermissions=false] if false, only users of role ADMIN can see the layer info tool. Default false.
 * @prop {boolean} cfg.activateZoomTool: activate zoom to extension tool, default `true`
 * @prop {element} cfg.groupNodeComponent render a custom component for group node
 * @prop {element} cfg.layerNodeComponent render a custom component for layer node
 * @prop {boolean} cfg.activateOpacityTool: show opacity slider in collapsible panel of layer, default `true`
 * @prop {boolean} cfg.activateTitleTooltip: show tooltip with full title on layers and groups, default `true`
 * @prop {boolean} cfg.activateLegendTool: show legend in collapsible panel, default `true`
 * @prop {boolean} cfg.hideOpacityTooltip hide tooltip on opacity sliders
 * @prop {object} cfg.layerOptions: options to pass to the layer.
 * @prop {object} cfg.layerOptions.legendOptions default options for legend
 * Some of the `layerOptions` are: `legendContainerStyle`, `legendStyle`. These 2 allow to customize the legend CSS.
 * this example is to make the legend scrollable horizontally
 * ```
 * "layerOptions": {
 *  "legendOptions": {
 *    "legendContainerStyle": {
 *     "overflowX": "auto"
 *    },
 *    "legendStyle": {
 *      "maxWidth": "250%"
 *    }
 *   }
 *  }
 * ```
 * Other `legendOptions` entries can be:
 * - `WMSLegendOptions` it is styling prop for the wms legend.
 * - `legendWidth`: default `width` in pixel to send to the WMS `GetLegendGraphic`. (Can be customized from `LayerSettings`)
 * - `legendHeight`: default `height` in pixel to send to the WMS `GetLegendGraphic`. (Can be customized from `LayerSettings`)
 * - `scaleDependent`, this option activates / deactivates scale dependency.
 * example:
 * ```
 * "layerOptions": {
 *  "legendOptions": {
 *   "scaleDependent": true,
 *   "WMSLegendOptions": "forceLabels:on",
 *   "legendWidth": 12,
 *   "legendHeight": 12
 *  }
 * }
 * ```
 * @prop {object} cfg.layerOptions.indicators Another `layerOptions` entry can be `indicators`. `indicators` is an array of icons to add to the TOC. They must satisfy a condition to be shown in the TOC.
 * For the moment only indicators of type `dimension` are supported.
 * example :
 * ```
 * "layerOptions" : {
 *   "indicators": [{
 *      "key": "dimension", // key: required id for the entry to render
 *      "type": "dimension", // type: only one supported is dimension
 *      "glyph": "calendar", // glyph to use
 *      "props": { // props to pass to the indicator
 *          "style": {
 *               "color": "#dddddd",
 *               "float": "right"
 *          },
 *          "tooltip": "dateFilter.supportedDateFilter", // tooltip (can be also a localized msgId)
 *          "placement": "bottom" // tooltip position
 *      },
 *      "condition": { // condition (lodash style) to satisfy ( for type dimension, the condition is to match at least one of the "dimensions" )
 *          "name": "time"
 *      }
 *   }]
 * }
 * ```
 * @prop {object} cfg.layerOptions.tooltipOptions Another `layerOptions` entry is `tooltipOptions` which contains options for customizing the tooltip
 * You can customize the max length for the tooltip with `maxLength` (Default is 807)
 * You can change the conjunction string in the "both" case with `separator` (Default is " - ")
 * for example
 * ```
 * "layerOptions" : {
 *   "tooltipOptions": {
 *     "maxLength": 200,
 *     "separator": " : "
 *   }
 * }
 * ```
 */
function TOC({
    tree,
    onSort = () => {},
    onChange = () => {},
    onSelectNode = () => {},
    groupNodeComponent,
    layerNodeComponent,
    items = [],
    selectedNodes,
    addLayersPermissions = true,
    removeLayersPermissions = true,
    sortingPermissions = true,
    addGroupsPermissions = true,
    removeGroupsPermissions = true,
    layerInfoToolPermissions = false,

    activateRemoveLayer = true,
    activateSortLayer = true,
    activateRemoveGroup = true,
    activateAddLayerButton = true,
    activateAddGroupButton = true,
    activateLayerInfoTool = true,

    user,
    title,
    activateFilterLayer = true,
    activateMapTitle = true,
    activateToolsContainer = true,
    activateZoomTool = true,
    hideOpacitySlider = false,

    activateTitleTooltip = true,
    activateLegendTool = true,
    showOpacityTooltip = true,
    defaultOpen,
    theme,
    showFullTitle,

    groupOptions = {},
    layerOptions = {},
    currentLocale,
    language,
    scales,
    zoom,
    resolution,
    resolutions,
    visualizationMode,
    toolbarButtonProps,
    init,
    onOpen,
    onResetInit
}, context) {
    const activateParameter = (allow, activate) => {
        const isUserAdmin = user && user.role === 'ADMIN' || false;
        return (allow || isUserAdmin) ? activate : false;
    };
    const singleDefaultGroup = isSingleDefaultGroup(tree);
    // this configuration can be accessed by
    // toolbar and context items
    const config = {
        activateAddLayerButton: activateParameter(addLayersPermissions, activateAddLayerButton),
        activateRemoveLayer: activateParameter(removeLayersPermissions, activateRemoveLayer),
        sortable: activateParameter(sortingPermissions, activateSortLayer),
        activateAddGroupButton: activateParameter(addGroupsPermissions, activateAddGroupButton),
        activateRemoveGroup: activateParameter(removeGroupsPermissions, activateRemoveGroup),
        activateLayerInfoTool: activateParameter(layerInfoToolPermissions, activateLayerInfoTool),
        singleDefaultGroup,
        hideOpacitySlider,
        defaultOpen,
        theme,
        showFullTitle,
        showOpacityTooltip
    };
    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({
        items: [
            ...(activateZoomTool
                ? [
                    { name: 'TOCZoomToMenuItem', target: 'context-menu', Component: ZoomToLayersButton, position: 4 },
                    { name: 'TOCZoomToMenuItem', target: 'toolbar', Component: ZoomToLayersButton, position: 4 }
                ]
                : []),
            { name: 'TOCReloadLayersMenuItem', target: 'context-menu', Component: ReloadLayersButton, position: 9 },
            { name: 'TOCRemoveNodesButton', target: 'toolbar', Component: RemoveNodesButton, position: 8 },
            { name: 'TOCRemoveNodesMenuItem', target: 'context-menu', Component: RemoveNodesButton, position: 8 },
            { name: 'TOCGroupOptionsMenuItem', target: 'context-menu', Component: GroupOptionsButton, position: 1 },
            { name: 'TOCSettings', target: 'context-menu', Component: TOCSettings, position: 0 },
            ...items
        ],
        loadedPlugins
    });
    const sortedItems = [...configuredItems].sort((a, b) => a.position > b.position ? 1 : -1);
    const contextMenuItems = sortedItems.filter(item => item.target === 'context-menu');
    const toolbarMenuItems = sortedItems.filter(item => item.target === 'toolbar');
    const nodeToolItems = sortedItems.filter(item => item.target === 'node-tool');
    const nodeItems = sortedItems.filter(item => item.target === 'node');

    const [filterText, setFilterText] = useState('');
    const [contextMenu, setContextMenu] = useState(null);

    function handleGlobalContextMenu(event) {
        event.preventDefault();
        setContextMenu({
            id: ROOT_GROUP_ID,
            type: NodeTypes.GROUP,
            node: singleDefaultGroup ? tree[0] : {
                id: null,
                nodes: tree
            },
            position: [event.clientX, event.clientY]
        });
    }

    // automatically open the toc
    // when default open is true
    useEffect(() => {
        if (init) {
            if (defaultOpen) {
                onOpen();
                // we need to reset init to false
                // so if we navigate to a new map we can initialize it again
                onResetInit();
            }
        }
    }, [init]);

    return (
        <div className="ms-toc-container" onContextMenu={handleGlobalContextMenu}>
            <div className="ms-toc-header">
                {activateMapTitle && title ? <div className="ms-toc-title"><Glyphicon glyph="1-map"/> {title} </div> : null}
                {activateFilterLayer ? <div className="ms-toc-filter">
                    <FormGroup>
                        <InputGroup>
                            <FormControl
                                placeholder="toc.filterPlaceholder"
                                value={filterText}
                                onChange={(event) => setFilterText(event?.target?.value)}
                            />
                            {filterText
                                ? <InputGroup.Button>
                                    <Button tooltipId="toc.clearFilter" onClick={() => setFilterText('')}><Glyphicon glyph="1-close"/></Button>
                                </InputGroup.Button>
                                : <InputGroup.Addon>
                                    <Glyphicon glyph="filter"/>
                                </InputGroup.Addon>}
                        </InputGroup>
                    </FormGroup>
                </div> : null}
                {activateToolsContainer ? <Toolbar
                    items={toolbarMenuItems}
                    selectedNodes={selectedNodes}
                    statusTypes={StatusTypes}
                    nodeTypes={NodeTypes}
                    rootGroupId={ROOT_GROUP_ID}
                    defaultGroupId={DEFAULT_GROUP_ID}
                    config={config}
                    buttonProps={toolbarButtonProps}
                /> : null}
            </div>
            <ControlledTOC
                tree={tree}
                filterText={filterText}
                onSort={onSort}
                onChange={onChange}
                groupNodeComponent={groupNodeComponent}
                layerNodeComponent={layerNodeComponent}
                contextMenu={contextMenu}
                theme={theme}
                className={contextMenu?.id === ROOT_GROUP_ID ? 'focused' : ''}
                config={{
                    resolution,
                    resolutions,
                    showFullTitle,
                    visualizationMode,
                    sortable: config.sortable,
                    hideOpacitySlider,
                    language,
                    currentLocale,
                    scales,
                    zoom,
                    showTitleTooltip: activateTitleTooltip,
                    showOpacityTooltip,
                    groupOptions,
                    layerOptions: {
                        ...layerOptions,
                        hideLegend: !activateLegendTool
                    }
                }}
                onContextMenu={({ event, node: currentNode, nodeType, parentId }) => {
                    onSelectNode();
                    setContextMenu({
                        id: currentNode?.id,
                        node: currentNode,
                        type: nodeType,
                        parentId,
                        position: [event.clientX, event.clientY]
                    });
                }}
                selectedNodes={selectedNodes}
                onSelectNode={onSelectNode}
                nodeTypes={NodeTypes}
                rootGroupId={ROOT_GROUP_ID}
                nodeToolItems={nodeToolItems}
                nodeItems={nodeItems}
                singleDefaultGroup={singleDefaultGroup}
            />
            {activateToolsContainer ? <ContextMenu
                value={contextMenu}
                show={!!contextMenu}
                position={contextMenu?.position}
                onClick={() => setContextMenu(null)}
                onClose={() => setContextMenu(null)}
                items={contextMenuItems}
                statusTypes={StatusTypes}
                nodeTypes={NodeTypes}
                defaultGroupId={DEFAULT_GROUP_ID}
                rootGroupId={ROOT_GROUP_ID}
                config={config}
            /> : null}
        </div>
    );
}

const getResolutionsProps = (state) => {
    const map = mapSelector(state);
    // fallback for 3D visualization mode
    const resolutions = map?.resolutions || getResolutions() || [];
    const resolution = resolutions[Math.round(map?.zoom)];
    return {
        resolutions,
        resolution
    };
};

const getTOCConfig = (state, props) => {
    const config = state?.toc?.config || {};
    const layers = layersSelector(state).filter(({ group }) => group !== 'background');
    return {
        init: config.init,
        defaultOpen: config.defaultOpen ?? props?.defaultOpen,
        theme: config.theme ?? props?.theme,
        hideOpacitySlider: config.hideOpacitySlider ?? props?.hideOpacitySlider ?? props?.activateOpacityTool,
        showFullTitle: config.showFullTitle ?? props?.showFullTitle,
        showOpacityTooltip: config.showOpacityTooltip ?? props?.showOpacityTooltip ?? !props?.hideOpacityTooltip,
        activateFilterLayer: !layers.length ? false : props?.activateFilterLayer ?? true
    };
};

const tocSelector = createShallowSelectorCreator(isEqual)(
    (state) => state.controls && state.controls.toolbar && state.controls.toolbar.active === 'toc',
    groupsSelector,
    layersSelector,
    selectedNodesSelector,
    userSelector,
    mapSelector,
    mapNameSelector,
    currentLocaleSelector,
    currentLocaleLanguageSelector,
    isLocalizedLayerStylesEnabledSelector,
    getResolutionsProps,
    visualizationModeSelector,
    getTOCConfig,
    (enabled, tree, layers, selectedNodes, user, map, title, currentLocale, currentLocaleLanguage, isLocalizedLayerStylesEnabled, { resolutions, resolution }, visualizationMode, config) => ({
        enabled,
        tree,
        layers,
        selectedNodes: selectedNodesIdsToObject(selectedNodes, layers, tree),
        user,
        title,
        currentLocale,
        language: isLocalizedLayerStylesEnabled ? currentLocaleLanguage : null,
        scales: getScales(
            map && map.projection || 'EPSG:3857',
            map && map.mapOptions && map.mapOptions.view && map.mapOptions.view.DPI || null
        ),
        zoom: map?.zoom,
        resolutions,
        resolution,
        visualizationMode,
        defaultOpen: config.defaultOpen,
        theme: config.theme,
        hideOpacitySlider: config.hideOpacitySlider,
        init: config.init,
        showFullTitle: config.showFullTitle,
        showOpacityTooltip: config.showOpacityTooltip,
        activateFilterLayer: config.activateFilterLayer
    })
);

const ConnectedTOC = connect(tocSelector, {
    onSort: moveNode,
    onChange: updateNode,
    onSelectNode: selectNode,
    onOpen: setControlProperty.bind(null, 'drawer', 'enabled', true),
    onResetInit: updateTOCConfig.bind(null, { init: false })
})(TOC);

export default createPlugin('TOC', {
    component: ConnectedTOC,
    containers: {
        DrawerMenu: {
            name: 'toc',
            position: 1,
            glyph: '1-layer',
            buttonConfig: {
                buttonClassName: 'square-button no-border',
                tooltip: 'toc.layers'
            },
            priority: 2
        }
    },
    reducers: {
        toc
    }
});
