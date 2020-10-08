/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const PropTypes = require('prop-types');
const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const { compose, branch, withPropsOnChange} = require('recompose');

const {Glyphicon} = require('react-bootstrap');

const {changeLayerProperties, changeGroupProperties, toggleNode, contextNode,
    moveNode, showSettings, hideSettings, updateSettings, updateNode, removeNode,
    browseData, selectNode, filterLayers, refreshLayerVersion, hideLayerMetadata,
    download} = require('../actions/layers');
const { setActive, setMode } = require('../actions/swipe');
const {openQueryBuilder} = require("../actions/layerFilter");
const {getLayerCapabilities} = require('../actions/layerCapabilities');
const {zoomToExtent} = require('../actions/map');
const {error} = require('../actions/notifications');
const {
    groupsSelector,
    layersSelector,
    selectedNodesSelector,
    layerFilterSelector,
    layerSettingSelector,
    layerMetadataSelector,
    wfsDownloadSelector} = require('../selectors/layers');
const { layerSwipeSettingsSelector } = require('../selectors/swipe');
const {mapSelector, mapNameSelector} = require('../selectors/map');
const {currentLocaleSelector, currentLocaleLanguageSelector} = require("../selectors/locale");
const {widgetBuilderAvailable} = require('../selectors/controls');
const {generalInfoFormatSelector} = require("../selectors/mapInfo");
const {userSelector} = require('../selectors/security');
const {isLocalizedLayerStylesEnabledSelector} = require('../selectors/localizedLayerStyles');

const LayersUtils = require('../utils/LayersUtils');
const mapUtils = require('../utils/MapUtils');
const LocaleUtils = require('../utils/LocaleUtils');

const Message = require('../components/I18N/Message');
const assign = require('object-assign');

const layersIcon = require('./toolbar/assets/img/layers.png');

const {isObject, head, find} = require('lodash');

const {setControlProperties, setControlProperty} = require('../actions/controls');
const {createWidget} = require('../actions/widgets');

const {getMetadataRecordById} = require("../actions/catalog");

const {activeSelector} = require("../selectors/catalog");
const {isCesium} = require('../selectors/maptype');

const addFilteredAttributesGroups = (nodes, filters) => {
    return nodes.reduce((newNodes, currentNode) => {
        let node = assign({}, currentNode);
        if (node.nodes) {
            node = assign({}, node, {nodes: addFilteredAttributesGroups(node.nodes, filters)});
        }
        filters.forEach(filter => {
            if (filter.func(node)) {
                node = assign({}, node, filter.options);
            } else {
                node = assign({}, node);
            }
        });
        newNodes.push(node);
        return newNodes;
    }, []);
};

const filterLayersByTitle = (layer, filterText, currentLocale) => {
    const translation = isObject(layer.title) ? layer.title[currentLocale] || layer.title.default : layer.title;
    const title = translation || layer.name;
    return title.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
};

const tocSelector = createSelector(
    [
        (state) => state.controls && state.controls.toolbar && state.controls.toolbar.active === 'toc',
        groupsSelector,
        layerSettingSelector,
        layerSwipeSettingsSelector,
        layerMetadataSelector,
        wfsDownloadSelector,
        mapSelector,
        currentLocaleSelector,
        currentLocaleLanguageSelector,
        selectedNodesSelector,
        layerFilterSelector,
        layersSelector,
        mapNameSelector,
        activeSelector,
        widgetBuilderAvailable,
        generalInfoFormatSelector,
        isCesium,
        userSelector,
        isLocalizedLayerStylesEnabledSelector
    ], (enabled, groups, settings, swipeSettings, layerMetadata, wfsdownload, map, currentLocale, currentLocaleLanguage, selectedNodes, filterText, layers, mapName, catalogActive, activateWidgetTool, generalInfoFormat, isCesiumActive, user, isLocalizedLayerStylesEnabled) => ({
        enabled,
        groups,
        settings,
        swipeSettings,
        layerMetadata,
        wfsdownload,
        currentZoomLvl: map && map.zoom,
        scales: mapUtils.getScales(
            map && map.projection || 'EPSG:3857',
            map && map.mapOptions && map.mapOptions.view && map.mapOptions.view.DPI || null
        ),
        currentLocale,
        currentLocaleLanguage,
        selectedNodes,
        filterText,
        generalInfoFormat,
        selectedLayers: layers.filter((l) => head(selectedNodes.filter(s => s === l.id))),
        noFilterResults: layers.filter((l) => filterLayersByTitle(l, filterText, currentLocale)).length === 0,
        updatableLayersCount: layers.filter(l => l.group !== 'background' && (l.type === 'wms' || l.type === 'wmts')).length,
        selectedGroups: selectedNodes.map(n => LayersUtils.getNode(groups, n)).filter(n => n && n.nodes),
        mapName,
        filteredGroups: addFilteredAttributesGroups(groups, [
            {
                options: {showComponent: true},
                func: () => !filterText
            },
            {
                options: {loadingError: true},
                func: (node) => head((node.nodes || []).filter(n => n.loadingError && n.loadingError !== 'Warning'))
            },
            {
                options: {expanded: true, showComponent: true},
                func: (node) => filterText && head((node.nodes || []).filter(l => filterLayersByTitle(l, filterText, currentLocale) || l.nodes && head(node.nodes.filter(g => g.showComponent))))
            },
            {
                options: { showComponent: false },
                func: (node) => head((node.nodes || []).filter(l => l.hidden || l.id === "annotations" && isCesiumActive)) && node.nodes.length === 1
            },
            {
                options: { showComponent: false },
                func: (node) => node.id === "annotations" && isCesiumActive
            }
        ]),
        catalogActive,
        activateWidgetTool,
        user,
        isLocalizedLayerStylesEnabled
    })
);

const TOC = require('../components/TOC/TOC');
const Header = require('../components/TOC/Header');
const Toolbar = require('../components/TOC/Toolbar');
const DefaultGroup = require('../components/TOC/DefaultGroup');
const DefaultLayer = require('../components/TOC/DefaultLayer');
const DefaultLayerOrGroup = require('../components/TOC/DefaultLayerOrGroup');

class LayerTree extends React.Component {
    static propTypes = {
        id: PropTypes.number,
        items: PropTypes.array,
        buttonContent: PropTypes.node,
        groups: PropTypes.array,
        settings: PropTypes.object,
        swipeSettings: PropTypes.object,
        layerMetadata: PropTypes.object,
        wfsdownload: PropTypes.object,
        metadataTemplate: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object, PropTypes.func]),
        refreshMapEnabled: PropTypes.bool,
        groupStyle: PropTypes.object,
        groupPropertiesChangeHandler: PropTypes.func,
        layerPropertiesChangeHandler: PropTypes.func,
        onToggleGroup: PropTypes.func,
        onToggleLayer: PropTypes.func,
        onContextMenu: PropTypes.func,
        onBrowseData: PropTypes.func,
        onQueryBuilder: PropTypes.func,
        onDownload: PropTypes.func,
        onSelectNode: PropTypes.func,
        selectedNodes: PropTypes.array,
        onZoomToExtent: PropTypes.func,
        retrieveLayerData: PropTypes.func,
        onSort: PropTypes.func,
        onSettings: PropTypes.func,
        onRefreshLayer: PropTypes.func,
        onNewWidget: PropTypes.func,
        hideSettings: PropTypes.func,
        updateSettings: PropTypes.func,
        updateNode: PropTypes.func,
        removeNode: PropTypes.func,
        activateTitleTooltip: PropTypes.bool,
        showFullTitleOnExpand: PropTypes.bool,
        activateOpacityTool: PropTypes.bool,
        activateSortLayer: PropTypes.bool,
        activateFilterLayer: PropTypes.bool,
        activateMapTitle: PropTypes.bool,
        activateToolsContainer: PropTypes.bool,
        activateRemoveLayer: PropTypes.bool,
        activateRemoveGroup: PropTypes.bool,
        activateLegendTool: PropTypes.bool,
        activateZoomTool: PropTypes.bool,
        activateQueryTool: PropTypes.bool,
        activateDownloadTool: PropTypes.bool,
        activateSettingsTool: PropTypes.bool,
        activateMetedataTool: PropTypes.bool,
        activateWidgetTool: PropTypes.bool,
        activateLayerInfoTool: PropTypes.bool,
        activateSwipeOnLayer: PropTypes.bool,
        maxDepth: PropTypes.number,
        visibilityCheckType: PropTypes.string,
        settingsOptions: PropTypes.object,
        chartStyle: PropTypes.object,
        currentZoomLvl: PropTypes.number,
        scales: PropTypes.array,
        layerOptions: PropTypes.object,
        metadataOptions: PropTypes.object,
        spatialOperations: PropTypes.array,
        spatialMethodOptions: PropTypes.array,
        groupOptions: PropTypes.object,
        currentLocale: PropTypes.string,
        currentLocaleLanguage: PropTypes.string,
        onFilter: PropTypes.func,
        filterText: PropTypes.string,
        generalInfoFormat: PropTypes.string,
        selectedLayers: PropTypes.array,
        selectedGroups: PropTypes.array,
        mapName: PropTypes.string,
        filteredGroups: PropTypes.array,
        noFilterResults: PropTypes.bool,
        onAddLayer: PropTypes.func,
        onAddGroup: PropTypes.func,
        onError: PropTypes.func,
        onGetMetadataRecord: PropTypes.func,
        hideLayerMetadata: PropTypes.func,
        activateAddLayerButton: PropTypes.bool,
        activateAddGroupButton: PropTypes.bool,
        activateLayerFilterTool: PropTypes.bool,
        catalogActive: PropTypes.bool,
        refreshLayerVersion: PropTypes.func,
        hideOpacityTooltip: PropTypes.bool,
        layerNodeComponent: PropTypes.func,
        groupNodeComponent: PropTypes.func,
        isLocalizedLayerStylesEnabled: PropTypes.bool,
        onLayerInfo: PropTypes.func,
        onSetSwipeActive: PropTypes.func,
        updatableLayersCount: PropTypes.number,
        onSetActive: PropTypes.func,
        onSetSwipeMode: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        items: [],
        groupPropertiesChangeHandler: () => {},
        layerPropertiesChangeHandler: () => {},
        retrieveLayerData: () => {},
        onToggleGroup: () => {},
        onToggleLayer: () => {},
        onContextMenu: () => {},
        onToggleQuery: () => {},
        onZoomToExtent: () => {},
        onSettings: () => {},
        onRefreshLayer: () => {},
        onNewWidget: () => {},
        updateNode: () => {},
        removeNode: () => {},
        onSelectNode: () => {},
        selectedNodes: [],
        activateOpacityTool: true,
        activateTitleTooltip: true,
        showFullTitleOnExpand: false,
        activateSortLayer: true,
        activateFilterLayer: true,
        activateMapTitle: true,
        activateToolsContainer: true,
        activateLegendTool: true,
        activateZoomTool: true,
        activateSettingsTool: true,
        activateMetedataTool: true,
        activateRemoveLayer: true,
        activateRemoveGroup: true,
        activateQueryTool: true,
        activateDownloadTool: false,
        activateWidgetTool: false,
        activateLayerFilterTool: false,
        activateLayerInfoTool: true,
        activateSwipeOnLayer: false,
        maxDepth: 3,
        visibilityCheckType: "glyph",
        settingsOptions: {
            includeCloseButton: false,
            closeGlyph: "1-close",
            buttonSize: "small",
            showFeatureInfoTab: true
        },
        layerOptions: {},
        metadataOptions: {},
        groupOptions: {},
        spatialOperations: [
            {"id": "INTERSECTS", "name": "queryform.spatialfilter.operations.intersects"},
            {"id": "BBOX", "name": "queryform.spatialfilter.operations.bbox"},
            {"id": "CONTAINS", "name": "queryform.spatialfilter.operations.contains"},
            {"id": "WITHIN", "name": "queryform.spatialfilter.operations.within"}
        ],
        spatialMethodOptions: [
            {"id": "Viewport", "name": "queryform.spatialfilter.methods.viewport"},
            {"id": "BBOX", "name": "queryform.spatialfilter.methods.box"},
            {"id": "Circle", "name": "queryform.spatialfilter.methods.circle"},
            {"id": "Polygon", "name": "queryform.spatialfilter.methods.poly"}
        ],
        currentLocale: 'en-US',
        filterText: '',
        selectedLayers: [],
        selectedGroups: [],
        mapName: '',
        filteredGroups: [],
        noFilterResults: false,
        onAddLayer: () => {},
        onAddGroup: () => {},
        onError: () => {},
        onGetMetadataRecord: () => {},
        hideLayerMetadata: () => {},
        activateAddLayerButton: false,
        activateAddGroupButton: false,
        catalogActive: false,
        refreshLayerVersion: () => {},
        metadataTemplate: null,
        onLayerInfo: () => {},
        onSetActive: () => {},
        onSetSwipeMode: () => {}
    };

    getNoBackgroundLayers = (group) => {
        return group.name !== 'background';
    };

    getDefaultGroup = () => {
        const GroupNode = this.props.groupNodeComponent || DefaultGroup;
        return (
            <GroupNode
                onSort={!this.props.filterText && this.props.activateSortLayer ? this.props.onSort : null}
                {...this.props.groupOptions}
                titleTooltip={this.props.activateTitleTooltip}
                propertiesChangeHandler={this.props.groupPropertiesChangeHandler}
                onToggle={this.props.onToggleGroup}
                style={this.props.groupStyle}
                groupVisibilityCheckbox
                visibilityCheckType={this.props.visibilityCheckType}
                currentLocale={this.props.currentLocale}
                selectedNodes={this.props.selectedNodes}
                onSelect={this.props.activateToolsContainer ? this.props.onSelectNode : null}/>);
    }
    getDefaultLayer = () => {
        const LayerNode = this.props.layerNodeComponent || DefaultLayer;
        return (
            <LayerNode
                {...this.props.layerOptions}
                titleTooltip={this.props.activateTitleTooltip}
                showFullTitleOnExpand={this.props.showFullTitleOnExpand}
                onToggle={this.props.onToggleLayer}
                activateOpacityTool={this.props.activateOpacityTool}
                onContextMenu={this.props.onContextMenu}
                propertiesChangeHandler={this.props.layerPropertiesChangeHandler}
                onSelect={this.props.activateToolsContainer ? this.props.onSelectNode : null}
                visibilityCheckType={this.props.visibilityCheckType}
                activateLegendTool={this.props.activateLegendTool}
                currentZoomLvl={this.props.currentZoomLvl}
                scales={this.props.scales}
                currentLocale={this.props.currentLocale}
                selectedNodes={this.props.selectedNodes}
                filterText={this.props.filterText}
                onUpdateNode={this.props.updateNode}
                hideOpacityTooltip={this.props.hideOpacityTooltip}
                language={this.props.isLocalizedLayerStylesEnabled ? this.props.currentLocaleLanguage : null}
            />
        );
    }

    renderTOC = () => {
        const Group = this.getDefaultGroup();
        const Layer = this.getDefaultLayer();
        const sections = [this.props.activateToolsContainer, this.props.activateFilterLayer, this.props.activateMapTitle].filter(s => s);
        const bodyClass = sections.length > 0 ? ' toc-body-sections-' + sections.length : ' toc-body-sections';
        return (
            <div>
                <Header
                    title={this.props.mapName}
                    showTitle={this.props.activateMapTitle}
                    showFilter={this.props.activateFilterLayer && (this.props.groups.filter(g => (g.nodes || []).length) || []).length}
                    showTools={this.props.activateToolsContainer}
                    onClear={() => { this.props.onSelectNode(); }}
                    onFilter={this.props.onFilter}
                    filterTooltipClear={<Message msgId="toc.clearFilter" />}
                    filterPlaceholder={LocaleUtils.getMessageById(this.context.messages, "toc.filterPlaceholder")}
                    filterText={this.props.filterText}
                    toolbar={
                        <Toolbar
                            groups={this.props.groups}
                            selectedLayers={this.props.selectedLayers}
                            selectedGroups={this.props.selectedGroups}
                            generalInfoFormat={this.props.generalInfoFormat}
                            settings={this.props.settings}
                            swipeSettings={this.props.swipeSettings}
                            layerMetadata={this.props.layerMetadata}
                            wfsdownload={this.props.wfsdownload}
                            metadataTemplate={this.props.metadataTemplate}
                            maxDepth={this.props.maxDepth}
                            activateTool={{
                                activateToolsContainer: this.props.activateToolsContainer,
                                activateRemoveLayer: this.props.activateRemoveLayer,
                                activateRemoveGroup: this.props.activateRemoveGroup,
                                activateZoomTool: this.props.activateZoomTool,
                                activateQueryTool: this.props.activateQueryTool,
                                activateDownloadTool: this.props.activateDownloadTool,
                                activateSettingsTool: this.props.activateSettingsTool,
                                activateAddLayer: this.props.activateAddLayerButton && !this.props.catalogActive,
                                activateAddGroup: this.props.activateAddGroupButton,
                                includeDeleteButtonInSettings: false,
                                activateMetedataTool: this.props.activateMetedataTool,
                                activateWidgetTool: this.props.activateWidgetTool,
                                activateLayerFilterTool: this.props.activateLayerFilterTool,
                                activateLayerInfoTool: this.props.updatableLayersCount > 0 && this.props.activateLayerInfoTool,
                                activateSwipeOnLayer: this.props.activateSwipeOnLayer
                            }}
                            options={{
                                modalOptions: {},
                                metadataOptions: this.props.metadataOptions,
                                settingsOptions: this.props.settingsOptions
                            }}
                            style={{
                                chartStyle: this.props.chartStyle
                            }}
                            text={{
                                settingsText: <Message msgId="layerProperties.windowTitle"/>,
                                opacityText: <Message msgId="opacity"/>,
                                elevationText: <Message msgId="elevation"/>,
                                saveText: <Message msgId="save"/>,
                                closeText: <Message msgId="close"/>,
                                confirmDeleteText: <Message msgId="layerProperties.deleteLayer" />,
                                confirmDeleteMessage: <Message msgId="layerProperties.deleteLayerMessage" />,
                                confirmDeleteLayerGroupText: <Message msgId="layerProperties.deleteLayerGroup" />,
                                confirmDeleteLayerGroupMessage: <Message msgId="layerProperties.deleteLayerGroupMessage" />,
                                confirmDeleteConfirmText: <Message msgId="layerProperties.delete"/>,
                                confirmDeleteCancelText: <Message msgId="cancel"/>,
                                addLayer: <Message msgId="toc.addLayer"/>,
                                addLayerTooltip: <Message msgId="toc.addLayer" />,
                                addLayerToGroupTooltip: <Message msgId="toc.addLayerToGroup" />,
                                addGroupTooltip: <Message msgId="toc.addGroup" />,
                                addSubGroupTooltip: <Message msgId="toc.addSubGroup" />,
                                createWidgetTooltip: <Message msgId="toc.createWidget"/>,
                                zoomToTooltip: {
                                    LAYER: <Message msgId="toc.toolZoomToLayerTooltip"/>,
                                    LAYERS: <Message msgId="toc.toolZoomToLayersTooltip"/>
                                },
                                settingsTooltip: {
                                    LAYER: <Message msgId="toc.toolLayerSettingsTooltip"/>,
                                    GROUP: <Message msgId="toc.toolGroupSettingsTooltip"/>
                                },
                                featuresGridTooltip: <Message msgId="toc.toolFeaturesGridTooltip"/>,
                                downloadToolTooltip: <Message msgId="toc.toolDownloadTooltip" />,
                                trashTooltip: {
                                    LAYER: <Message msgId="toc.toolTrashLayerTooltip"/>,
                                    LAYERS: <Message msgId="toc.toolTrashLayersTooltip"/>,
                                    GROUP: <Message msgId="toc.toolTrashGroupTooltip"/>
                                },
                                reloadTooltip: {
                                    LAYER: <Message msgId="toc.toolReloadLayerTooltip"/>,
                                    LAYERS: <Message msgId="toc.toolReloadLayersTooltip"/>
                                },
                                layerMetadataTooltip: <Message msgId="toc.layerMetadata.toolLayerMetadataTooltip"/>,
                                layerMetadataPanelTitle: <Message msgId="toc.layerMetadata.layerMetadataPanelTitle"/>,
                                layerFilterTooltip: <Message msgId="toc.layerFilterTooltip"/>,
                                layerInfoTooltip: <Message msgId="toc.layerInfoTooltip"/>
                            }}
                            onToolsActions={{
                                onZoom: this.props.onZoomToExtent,
                                onNewWidget: this.props.onNewWidget,
                                onBrowseData: this.props.onBrowseData,
                                onQueryBuilder: this.props.onQueryBuilder,
                                onDownload: this.props.onDownload,
                                onUpdate: this.props.updateNode,
                                onRemove: this.props.removeNode,
                                onClear: this.props.onSelectNode,
                                onSettings: this.props.onSettings,
                                onUpdateSettings: this.props.updateSettings,
                                onRetrieveLayerData: this.props.retrieveLayerData,
                                onHideSettings: this.props.hideSettings,
                                onReload: this.props.refreshLayerVersion,
                                onAddLayer: this.props.onAddLayer,
                                onAddGroup: this.props.onAddGroup,
                                onGetMetadataRecord: this.props.onGetMetadataRecord,
                                onHideLayerMetadata: this.props.hideLayerMetadata,
                                onShow: this.props.layerPropertiesChangeHandler,
                                onLayerInfo: this.props.onLayerInfo,
                                onSetActive: this.props.onSetActive,
                                onSetSwipeMode: this.props.onSetSwipeMode
                            }}/>
                    }/>
                <div className={'mapstore-toc' + bodyClass}>
                    {this.props.noFilterResults && this.props.filterText ?
                        <div>
                            <div className="toc-filter-no-results"><Message msgId="toc.noFilteredResults" /></div>
                        </div>
                        :
                        <TOC onError={this.props.onError} onSort={!this.props.filterText && this.props.activateSortLayer ? this.props.onSort : null} filter={this.getNoBackgroundLayers} nodes={this.props.filteredGroups}>
                            <DefaultLayerOrGroup groupElement={Group} layerElement={Layer}/>
                        </TOC>
                    }
                </div>
            </div>
        );
    };

    render() {
        if (!this.props.groups) {
            return <div />;
        }
        return this.renderTOC();
    }
}

/**
 * enhances the TOC to check `Permissions` properties and enable/disable
 * the proper tools.
 * @memberof plugins.TOC
 */
const securityEnhancer = withPropsOnChange(
    [
        "user",
        "addLayersPermissions", "activateAddLayerButton",
        "removeLayersPermissions", "activateRemoveLayer",
        "sortingPermission", "activateRemoveLayer",
        "addGroupsPermissions", "activateAddGroupButton",
        "removeGroupsPermissions", "activateRemoveGroup",
        "layerInfoToolPermissions", "activateLayerInfoTool"
    ],
    (props) => {
        const {
            addLayersPermissions = true,
            removeLayersPermissions = true,
            sortingPermissions = true,
            addGroupsPermissions = true,
            removeGroupsPermissions = true,
            layerInfoToolPermissions = false,
            activateAddLayerButton,
            activateRemoveLayer,
            activateSortLayer,
            activateAddGroupButton,
            activateRemoveGroup,
            activateLayerInfoTool,
            user
        } = props;

        const activateParameter = (allow, activate) => {
            const isUserAdmin = user && user.role === 'ADMIN' || false;
            return (allow || isUserAdmin) ? activate : false;
        };

        return {
            activateAddLayerButton: activateParameter(addLayersPermissions, activateAddLayerButton),
            activateRemoveLayer: activateParameter(removeLayersPermissions, activateRemoveLayer),
            activateSortLayer: activateParameter(sortingPermissions, activateSortLayer),
            activateAddGroupButton: activateParameter(addGroupsPermissions, activateAddGroupButton),
            activateRemoveGroup: activateParameter(removeGroupsPermissions, activateRemoveGroup),
            activateLayerInfoTool: activateParameter(layerInfoToolPermissions, activateLayerInfoTool)
        };
    });


/**
 * enhances the TOC to check the presence of TOC plugins to display/add buttons to the toolbar.
 * NOTE: the flags are required because of old configurations about permissions.
 * TODO: delegate button rendering and actions to the plugins (now this is only a check and some plugins are dummy, only to allow plug/unplug). Also permissions should be delegated to the related plugins
 * @memberof plugins.TOC
 */
const checkPluginsEnhancer = branch(
    ({ checkPlugins = true }) => checkPlugins,
    withPropsOnChange(
        [
            "items",
            "activateAddLayerButton",
            "activateAddGroupButton",
            "activateLayerFilterTool",
            "activateSettingsTool",
            "FeatureEditor",
            "activateLayerInfoTool",
            "activateSwipeOnLayer"
        ],
        ({
            items = [],
            activateAddLayerButton = true,
            activateAddGroupButton = true,
            activateQueryTool = true,
            activateSettingsTool = true,
            activateLayerFilterTool = true,
            activateWidgetTool = true,
            activateLayerInfoTool = true,
            activateSwipeOnLayer = true
        }) => ({
            activateAddLayerButton: activateAddLayerButton && !!find(items, { name: "MetadataExplorer" }) || false, // requires MetadataExplorer (Catalog)
            activateAddGroupButton: activateAddGroupButton && !!find(items, { name: "AddGroup" }) || false,
            activateSettingsTool: activateSettingsTool && !!find(items, { name: "TOCItemsSettings"}) || false,
            activateQueryTool: activateQueryTool && !!find(items, {name: "FeatureEditor"}) || false,
            activateLayerFilterTool: activateLayerFilterTool && !!find(items, {name: "FilterLayer"}) || false,
            // NOTE: activateWidgetTool is already controlled by a selector. TODO: Simplify investigating on the best approach
            // the button should hide if also widgets plugins is not available. Maybe is a good idea to merge the two plugins
            activateWidgetTool: activateWidgetTool && !!find(items, { name: "WidgetBuilder" }) && !!find(items, { name: "Widgets" }),
            activateLayerInfoTool: activateLayerInfoTool && !!find(items, { name: "LayerInfo" }) || false,
            activateSwipeOnLayer: activateSwipeOnLayer && !!find(items, { name: "Swipe" }) || false
        })
    )
);


/**
 * Provides Table Of Content visualization.
 * @memberof plugins
 * @name TOC
 * @class
 * @prop {boolean} cfg.activateFilterLayer: activate filter layers tool, default `true`
 * @prop {boolean} cfg.activateMapTitle: show map title, default `true`
 * @prop {boolean} cfg.activateTitleTooltip: show tooltip with full title on layers and groups, default `true`
 * @prop {boolean} cfg.activateOpacityTool: show opacity slider in collapsible panel of layer, default `true`
 * @prop {boolean} cfg.activateToolsContainer: activate layers and group global toolbar, default `true`
 * @prop {boolean} cfg.activateLegendTool: show legend in collapsible panel, default `true`
 * @prop {boolean} cfg.activateZoomTool: activate zoom to extension tool, default `true`
 * @prop {boolean} cfg.activateSettingsTool: activate settings of layers and groups, default `true`
 * @prop {boolean} cfg.activateRemoveLayer: activate remove layer tool, default `true`
 * @prop {boolean} cfg.activateQueryTool: activate query tool options, default `false`
 * @prop {boolean} cfg.activateDownloadTool: activate a button to download layer data through wfs, default `false`
 * @prop {boolean} cfg.activateSortLayer: activate drag and drop to sort layers, default `true`
 * @prop {boolean} cfg.checkPlugins if true, check if AddLayer, AddGroup ... plugins are present to auto-configure the toolbar
 * @prop {boolean} cfg.activateAddLayerButton: activate a button to open the catalog, default `true`
 * @prop {boolean} cfg.activateAddGroupButton: activate a button to add a new group, default `true`
 * @prop {boolean} cfg.showFullTitleOnExpand shows full length title in the legend. default `false`.
 * @prop {boolean} cfg.hideOpacityTooltip hide toolip on opacity sliders
 * @prop {string[]|string|object|function} cfg.metadataTemplate custom template for displaying metadata
 * example :
 * ```
 * {
 * "name": "TOC",
 *      "cfg": {
 *          "metadataTemplate": ["<div id={model.identifier}>",
 *              "<Bootstrap.Table className='responsive'>",
 *                  "<thead>",
 *                  "<tr>",
 *                      "<th>Campo</th><th>Valore</th>",
 *                  "</tr>",
 *                  "</thead>",
 *                  "<tbody>",
 *                      "<tr>",
 *                          "<td>Identifier</td><td>{model.identifier}</td>",
 *                      "</tr>",
 *                      "<tr>",
 *                          "<td>Title</td><td>{model.title}</td>",
 *                      "</tr>",
 *                      "<tr>",
 *                          "<td>Abstract</td><td>{model.abstract}</td>",
 *                      "</tr>",
 *                      "<tr>",
 *                          "<td>Subject</td><td>{Array.isArray(model.subject) ? model.subject.map((value, i) => <ul key={'meta'+i}><li key={i}>{value}</li></ul>) : model.subject}</td>",
 *                      "</tr>",
 *                      "<tr>",
 *                          "<td>Type</td><td>{model.type}</td>",
 *                      "</tr>",
 *                      "<tr>",
 *                          "<td>Creator</td><td>{model.creator}</td>",
 *                      "</tr>",
 *                  "</tbody>",
 *              "</Bootstrap.Table>",
 *          "</div>"]
 *      }
 *  }
 * ```
 *
 * @prop {element} cfg.groupNodeComponent render a custom component for group node
 * @prop {element} cfg.layerNodeComponent render a custom component for layer node
 * @prop {object} cfg.layerOptions: options to pass to the layer.
 * Some of the layerOptions are: `legendContainerStyle`, `legendStyle`. These 2 allow to customize the legend:
 * For instance you can pass some styling props to the legend.
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
 * Another legendOptions entry can be `WMSLegendOptions` it is styling prop for the wms legend.
 * example:
 * ```
 * "layerOptions": {
 *  "legendOptions": {
 *   "WMSLegendOptions": "forceLabels:on"
 *  }
 * }
 * ```
 * Another one legendOptions entry is `scaleDependent`, this option activates / deactivates scale dependency.
 * example:
 * ```
 * "layerOptions": {
 *  "legendOptions": {
 *   "scaleDependent": true
 *  }
 * }
 * ```
 * Another layerOptions entry can be `indicators`. `indicators` is an array of icons to add to the TOC. They must satisfy a condition to be shown in the TOC.
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
 *
 * Another layerOptions entry is `tooltipOptions` which contains options for customizing the tooltip
 * You can customize the max length for the tooltip with `maxLength` (Default is 807)
 * You can change the conjuction string in the "both" case with `separator` (Default is " - ")
 * for example
 * ```
 * "layerOptions" : {
 *   "tooltipOptions": {
 *     "maxLength": 200,
 *     "separator": " : "
 *   }
 * }
 * ```
 * @prop {object} cfg.metadataOptions options to pass to iso19139 xml metadata parser
 * @prop {object} cfg.metadataOptions.xmlNamespaces namespaces that are used in the metadata xml
 * ```
 * "xmlNamespaces": {
 *     "gmd": "http://www.isotc211.org/2005/gmd",
 *     "srv": "http://www.isotc211.org/2005/srv",
 *     "gco": "http://www.isotc211.org/2005/gco",
 *     "gmx": "http://www.isotc211.org/2005/gmx",
 *     "gfc": "http://www.isotc211.org/2005/gfc",
 *     "gts": "http://www.isotc211.org/2005/gts",
 *     "gml": "http://www.opengis.net/gml"
 * }
 * ```
 * @prop {object[]} cfg.metadataOptions.extractors metadata properties extractor definitions
 * ```
 * "extractors": [{
 *     "properties": {
 *         "title": "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString",
 *         "lastRevisionDate": "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:Date[../../gmd:dateType/gmd:CI_DateTypeCode[@codeListValue='revision']]",
 *         "pointsOfContact": {
 *             "xpath": "/gmd:MD_Metadata/gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty",
 *             "properties": {
 *                 "individualName": "gmd:individualName/gco:CharacterString",
 *                 "organisationName": "gmd:organisationName/gco:CharacterString",
 *                 "contactInfo": {
 *                     "xpath": "gmd:contactInfo/gmd:CI_Contact",
 *                     "properties": {
 *                         "phone": "gmd:phone/gmd:CI_Telephone/gmd:voice/gco:CharacterString",
 *                         "hoursOfService": "gmd:hoursOfService/gco:CharacterString"
 *                     }
 *                 },
 *                 "role": "gmd:role/gmd:CI_RoleCode/@codeListValue"
 *             }
 *         }
 *     },
 *     "layersRegex": "^espub_mob:gev_ajeu$"
 * }]
 * ```
 *
 * Each extractor is an object, that has two props: "properties" and "layersRegex". "layersRegex" allows to define a regular exression
 * that would be use to determine the names of the layers that the extractor should be used with.
 * "properties" is an object that contains a description of what metadata info should be displayed and how.
 * Each property of this object must be in the following form:
 *
 * ```
 * {
 *   [localizedPropKey]: "xpath string"
 * }
 * ```
 *
 * or
 *
 * ```
 * {
 *   [localizedPropKey]: {
 *     "xpath": "base xpath string",
 *     "properties": {
 *       ...
 *     }
 *   }
 * }
 * ```
 *
 * "localizedPropKey" is a value that is going to be used to compute a localized string id in the default metadata template like this:
 * "toc.layerMetadata.${localizedPropKey}". If the translation is missing a default string will be shown containing localizedPropKey.
 * The value of each "properties" object's prop can be either a string containing an xpath string that will be used to extract
 * a string from metadata xml to be displayed as a value of the corresponding prop in the ui, or an object
 * that describes a subtable, if metadata prop cannot be displayed just as a singular string value. That object has two properties:
 * "xpath", and "properties". "xpath" defines a relative xpath to be used as a base for all properties in "properties". This "properties" object
 * adheres to the same structure described here.
 *
 * If there are multiple extractors which "layersRegex" matches layer's name, the one that occures in the array first will be used for
 * metadata processing.
 */
const TOCPlugin = connect(tocSelector, {
    groupPropertiesChangeHandler: changeGroupProperties,
    layerPropertiesChangeHandler: changeLayerProperties,
    retrieveLayerData: getLayerCapabilities,
    onToggleGroup: LayersUtils.toggleByType('groups', toggleNode),
    onToggleLayer: LayersUtils.toggleByType('layers', toggleNode),
    onContextMenu: contextNode,
    onBrowseData: browseData,
    onQueryBuilder: openQueryBuilder,
    onDownload: download,
    onSort: moveNode,
    onSettings: showSettings,
    onZoomToExtent: zoomToExtent,
    hideSettings,
    updateSettings,
    updateNode,
    removeNode,
    onSelectNode: selectNode,
    onFilter: filterLayers,
    onAddLayer: setControlProperties.bind(null, "metadataexplorer", "enabled", true, "group"),
    onAddGroup: setControlProperties.bind(null, "addgroup", "enabled", true, "parent"),
    onGetMetadataRecord: getMetadataRecordById,
    onError: error,
    hideLayerMetadata,
    onNewWidget: () => createWidget(),
    refreshLayerVersion,
    onLayerInfo: setControlProperty.bind(null, 'layerinfo', 'enabled', true, false),
    onSetActive: setActive,
    onSetSwipeMode: setMode
})(compose(
    securityEnhancer,
    checkPluginsEnhancer
)(LayerTree));

const API = require('../api/catalog').default;

module.exports = {
    TOCPlugin: assign(TOCPlugin, {
        Toolbar: {
            name: 'toc',
            position: 7,
            exclusive: true,
            panel: true,
            help: <Message msgId="helptexts.layerSwitcher"/>,
            tooltip: "layers",
            wrap: true,
            title: 'layers',
            icon: <Glyphicon glyph="1-layer"/>,
            priority: 1
        },
        DrawerMenu: {
            name: 'toc',
            position: 1,
            glyph: "1-layer",
            icon: <img src={layersIcon}/>,
            buttonConfig: {
                buttonClassName: "square-button no-border",
                tooltip: "toc.layers"
            },
            priority: 2
        }
    }),
    reducers: {
        queryform: require('../reducers/queryform'),
        query: require('../reducers/query')
    },
    // TODO: remove this dependency, it is needed only to use getMetadataRecordById and related actions that can be moved in the TOC
    epics: require("../epics/catalog").default(API)
};
