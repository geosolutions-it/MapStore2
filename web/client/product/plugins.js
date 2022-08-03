/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isFunction from 'lodash/isFunction';
import merge from 'lodash/merge';
import omit from 'lodash/omit';
import {createPluginManager} from "../utils/PluginsUtils";

function cleanEpics(epics, excludedNames = []) {
    const containsExcludedEpic = !!excludedNames.find((epicName) => epics[epicName]);
    if (containsExcludedEpic) {
        return omit(epics, excludedNames);
    }
    return epics;
}

function toLazyPlugin(name, implementationFunction, overrides, exportedName) {
    const getLazyPlugin = () => {
        return implementationFunction().then((mod) => {
            const impl = exportedName && mod[exportedName] ? mod[exportedName] : mod.default;
            const pluginName = name + 'Plugin';
            if (!isFunction(impl[pluginName])) {
                const {
                    enabler,
                    loadPlugin,
                    disablePluginIf,
                    ...containers
                } = impl[pluginName];
                return {
                    'default': merge({
                        name,
                        component: impl[pluginName],
                        reducers: impl.reducers || {},
                        epics: cleanEpics(impl.epics || {}),
                        containers,
                        disablePluginIf,
                        enabler,
                        loadPlugin
                    }, overrides)
                };
            }
            return {
                'default': merge({
                    name,
                    component: impl[pluginName],
                    reducers: impl.reducers || {},
                    epics: cleanEpics(impl.epics || {}),
                    containers: impl.containers || {}
                }, overrides)
            };
        });
    };
    getLazyPlugin.isLazyWrapper = true;
    return getLazyPlugin;
}

function splitLazyAndStaticPlugins(pluginsDefinition) {
    const pluginManager = createPluginManager();
    const { plugins: allPlugins = {}, ...definition } = pluginsDefinition;
    const plugins = Object.keys(allPlugins)
        .filter((name) => !allPlugins[name].isLazyWrapper)
        .reduce((acc, name) => ({
            ...acc,
            [name]: allPlugins[name]
        }), {});
    const lazyPlugins = Object.keys(allPlugins)
        .filter((name) => allPlugins[name].isLazyWrapper)
        .reduce((acc, name) => ({
            ...acc,
            [name]: allPlugins[name]
        }), {});
    pluginManager.registerPlugins(lazyPlugins);
    return {
        ...definition,
        plugins,
        lazyPlugins
    };
}

/**
  * Please, keep them sorted alphabetically
 */
export const plugins = {
    // product plugins
    // AboutPlugin: require('./plugins/About').default,
    AboutPlugin: toLazyPlugin('About', () => import(/* webpackChunkName: 'plugins/about' */ './plugins/About')),
    AttributionPlugin: toLazyPlugin('Attribution', () => import(/* webpackChunkName: 'plugins/attribution' */ './plugins/Attribution')),
    FooterPlugin: toLazyPlugin('Footer', () => import(/* webpackChunkName: 'plugins/footer' */ './plugins/Footer'), {}, 'FooterPlugin'),
    ForkPlugin: toLazyPlugin('Fork', () => import(/* webpackChunkName: 'plugins/fork' */ './plugins/Fork')),
    HeaderPlugin: toLazyPlugin('Header', () => import(/* webpackChunkName: 'plugins/header' */ './plugins/Header')),
    HomeDescriptionPlugin: toLazyPlugin('HomeDescription', () => import(/* webpackChunkName: 'plugins/HomeDescription' */ './plugins/HomeDescription')),
    MadeWithLovePlugin: toLazyPlugin('MadeWithLove', () => import(/* webpackChunkName: 'plugins/madeWithLove' */ './plugins/MadeWithLove')),
    MapTypePlugin: toLazyPlugin('MapType', () => import(/* webpackChunkName: 'plugins/mapType' */ './plugins/MapType')),
    NavMenuPlugin: toLazyPlugin('NavMenu', () => import(/* webpackChunkName: 'plugins/navMenu' */ './plugins/NavMenu')),
    // framework plugins
    AddGroupPlugin: toLazyPlugin('AddGroup', () => import(/* webpackChunkName: 'plugins/about' */'../plugins/AddGroup')),
    AnnotationsPlugin: toLazyPlugin('Annotations', () => import(/* webpackChunkName: 'plugins/annotations' */ '../plugins/Annotations')),
    AutoMapUpdatePlugin: toLazyPlugin('AutoMapUpdate', () => import(/* webpackChunkName: 'plugins/autoMapUpdate' */ '../plugins/AutoMapUpdate')),
    BackgroundSelectorPlugin: toLazyPlugin('BackgroundSelector', () => import(/* webpackChunkName: 'plugins/backgroundSelector' */ '../plugins/BackgroundSelector')),
    BurgerMenuPlugin: toLazyPlugin('BurgerMenu', () => import(/* webpackChunkName: 'plugins/burgerMenu' */ '../plugins/BurgerMenu')),
    CRSSelectorPlugin: toLazyPlugin('CRSSelector', () => import(/* webpackChunkName: 'plugins/CRSSelector' */ '../plugins/CRSSelector')),
    ContentTabs: toLazyPlugin('ContentTabs', () => import(/* webpackChunkName: 'plugins/contentTabs' */ '../plugins/ContentTabs')),
    ContextPlugin: toLazyPlugin('Context', () => import(/* webpackChunkName: 'plugins/context' */ '../plugins/Context')),
    ContextCreatorPlugin: toLazyPlugin('ContextCreator', () => import(/* webpackChunkName: 'plugins/contextCreator' */ '../plugins/ContextCreator')),
    ContextManagerPlugin: toLazyPlugin('ContextManager', () => import(/* webpackChunkName: 'plugins/contextManager' */ '../plugins/contextmanager/ContextManager')),
    ContextsPlugin: toLazyPlugin('Contexts', () => import(/* webpackChunkName: 'plugins/contexts' */ '../plugins/Contexts')),
    CookiePlugin: toLazyPlugin('Cookie', () => import(/* webpackChunkName: 'plugins/cookie' */ '../plugins/Cookie')),
    CreateNewMapPlugin: toLazyPlugin('CreateNewMap', () => import(/* webpackChunkName: 'plugins/createNewMap' */ '../plugins/CreateNewMap')),
    Dashboard: require('../plugins/Dashboard').default,
    DashboardEditor: toLazyPlugin('DashboardEditor', () => import(/* webpackChunkName: 'plugins/dashboardEditor' */ '../plugins/DashboardEditor')),
    DashboardExport: toLazyPlugin('DashboardExport', () => import(/* webpackChunkName: 'plugins/dashboardExport' */ '../plugins/DashboardExport')),
    DashboardImport: toLazyPlugin('DashboardImport', () => import( /* webpackChunkName: 'plugins/dashboardImport' */'../plugins/DashboardImport')),
    DashboardsPlugin: require('../plugins/Dashboards').default,
    DeleteMapPlugin: toLazyPlugin('DeleteMap', () => import(/* webpackChunkName: 'plugins/deleteMap' */ '../plugins/DeleteMap')),
    DeleteGeoStoryPlugin: toLazyPlugin('DeleteGeoStory', () => import(/* webpackChunkName: 'plugins/deleteGeoStory' */ '../plugins/DeleteGeoStory')),
    DeleteDashboardPlugin: toLazyPlugin('DeleteDashboard', () => import(/* webpackChunkName: 'plugins/deleteDashboard' */ '../plugins/DeleteDashboard')),
    DetailsPlugin: toLazyPlugin('Details', () => import(/* webpackChunkName: 'plugins/details' */ '../plugins/Details')),
    DrawerMenuPlugin: toLazyPlugin('DrawerMenu', () => import(/* webpackChunkName: 'plugins/drawerMenu' */ '../plugins/DrawerMenu')),
    ExpanderPlugin: toLazyPlugin('Expander', () => import(/* webpackChunkName: 'plugins/expander' */ '../plugins/Expander')),
    FeatureEditorPlugin: toLazyPlugin('FeatureEditor', () => import(/* webpackChunkName: 'plugins/featureEditor' */ '../plugins/FeatureEditor')),
    FeaturedMaps: toLazyPlugin('FeaturedMaps', () => import(/* webpackChunkName: 'plugins/featuredMaps' */ '../plugins/FeaturedMaps')),
    FeedbackMaskPlugin: require('../plugins/FeedbackMask').default,
    FilterLayerPlugin: require('../plugins/FilterLayer').default,
    FloatingLegendPlugin: require('../plugins/FloatingLegend').default,
    FullScreenPlugin: toLazyPlugin('FullScreen', () => import(/* webpackChunkName: 'plugins/fullScreen' */ '../plugins/FullScreen')),
    GeoStoryPlugin: require('../plugins/GeoStory').default,
    GeoStoriesPlugin: require('../plugins/GeoStories').default,
    GeoStoryEditorPlugin: require('../plugins/GeoStoryEditor').default,
    GeoStorySavePlugin: require('../plugins/GeoStorySave').GeoStorySave,
    GeoStorySaveAsPlugin: require('../plugins/GeoStorySave').GeoStorySaveAs,
    GeoStoryExport: require('../plugins/GeoStoryExport').default,
    GeoStoryImport: require('../plugins/GeoStoryImport').default,
    DashboardSavePlugin: require('../plugins/DashboardSave').DashboardSave,
    DashboardSaveAsPlugin: require('../plugins/DashboardSave').DashboardSaveAs,
    GeoStoryNavigationPlugin: require('../plugins/GeoStoryNavigation').default,
    GlobeViewSwitcherPlugin: require('../plugins/GlobeViewSwitcher').default,
    GoFull: require('../plugins/GoFull').default,
    GridContainerPlugin: require('../plugins/GridContainer').default,
    GroupManagerPlugin: require('../plugins/manager/GroupManager').default,
    HelpLinkPlugin: toLazyPlugin('HelpLink', () => import(/* webpackChunkName: 'plugins/helpLink' */ '../plugins/HelpLink')),
    HelpPlugin: toLazyPlugin('Help', () => import(/* webpackChunkName: 'plugins/helpPlugin' */ '../plugins/Help')),
    HomePlugin: toLazyPlugin('Home', () => import(/* webpackChunkName: 'plugins/home' */ '../plugins/Home')),
    IdentifyPlugin: toLazyPlugin('Identify', () => import(/* webpackChunkName: 'plugins/identify' */ '../plugins/Identify')),
    LanguagePlugin: toLazyPlugin('Language', () => import(/* webpackChunkName: 'plugins/language' */ '../plugins/Language')),
    LayerDownload: require('../plugins/LayerDownload').default,
    LayerInfoPlugin: require('../plugins/LayerInfo').default,
    LocatePlugin: toLazyPlugin('Locate', () => import(/* webpackChunkName: 'plugins/locate' */ '../plugins/Locate')),
    LoginPlugin: require('../plugins/Login').default,
    ManagerMenuPlugin: toLazyPlugin('ManagerMenu', () => import(/* webpackChunkName: 'plugins/managerMenu' */ '../plugins/manager/ManagerMenu')),
    ManagerPlugin: toLazyPlugin('Manager', () => import(/* webpackChunkName: 'plugins/gridContainer' */ '../plugins/GridContainer')),
    MapEditorPlugin: toLazyPlugin('MapEditor', () => import(/* webpackChunkName: 'plugins/mapEditor' */ '../plugins/MapEditor')),
    MapExportPlugin: toLazyPlugin('MapExport', () => import(/* webpackChunkName: 'plugins/mapExport' */ '../plugins/MapExport')),
    MapFooterPlugin: toLazyPlugin('MapFooter', () => import(/* webpackChunkName: 'plugins/mapFooter' */ '../plugins/MapFooter')),
    MapImportPlugin: toLazyPlugin('MapImport', () => import(/* webpackChunkName: 'plugins/mapImport' */ '../plugins/MapImport')),
    MapLoadingPlugin: toLazyPlugin('MapLoading', () => import(/* webpackChunkName: 'plugins/mapLoading' */ '../plugins/MapLoading')),
    MapPlugin: toLazyPlugin('Map', () => import(/* webpackChunkName: 'plugins/map' */ '../plugins/Map')),
    MapSearchPlugin: toLazyPlugin('MapSearch', () => import(/* webpackChunkName: 'plugins/mapSearch' */ '../plugins/MapSearch')),
    MapsPlugin: require('../plugins/Maps').default,
    MapCatalogPlugin: toLazyPlugin('MapCatalog', () => import(/* webpackChunkName: 'plugins/mapCatalog' */ '../plugins/MapCatalog')),
    MapTemplatesPlugin: toLazyPlugin('MapTemplates', () => import(/* webpackChunkName: 'plugins/measure' */ '../plugins/MapTemplates')),
    MeasurePlugin: toLazyPlugin('Measure', () => import(/* webpackChunkName: 'plugins/gridContainer' */ '../plugins/Measure')),
    MediaEditorPlugin: toLazyPlugin('MediaEditor', () => import(/* webpackChunkName: 'plugins/mediaEditor' */ '../plugins/MediaEditor')),
    MetadataExplorerPlugin: require('../plugins/MetadataExplorer').default,
    MousePositionPlugin: toLazyPlugin('MousePosition', () => import(/* webpackChunkName: 'plugins/mousePosition' */ '../plugins/MousePosition')),
    NotificationsPlugin: toLazyPlugin('Notifications', () => import(/* webpackChunkName: 'plugins/notifications' */ '../plugins/Notifications')),
    OmniBarPlugin: toLazyPlugin('OmniBar', () => import(/* webpackChunkName: 'plugins/omniBar' */ '../plugins/OmniBar')),
    PlaybackPlugin: require('../plugins/Playback.jsx').default,
    PrintPlugin: require('../plugins/Print').default,
    QueryPanelPlugin: require('../plugins/QueryPanel').default,
    RedirectPlugin: require('../plugins/Redirect').default,
    RedoPlugin: toLazyPlugin('Redo', () => import(/* webpackChunkName: 'plugins/history' */ '../plugins/History')),
    RulesDataGridPlugin: require('../plugins/RulesDataGrid').default,
    RulesEditorPlugin: require('../plugins/RulesEditor').default,
    RulesManagerFooter: require('../plugins/RulesManagerFooter').default,
    SavePlugin: toLazyPlugin('Save', () => import(/* webpackChunkName: 'plugins/save' */ '../plugins/Save')),
    SaveAsPlugin: toLazyPlugin('SaveAs', () => import(/* webpackChunkName: 'plugins/saveAs' */ '../plugins/SaveAs')),
    SaveStoryPlugin: toLazyPlugin('SaveStory', () => import(/* webpackChunkName: 'plugins/saveStory' */ '../plugins/GeoStorySave')),
    ScaleBoxPlugin: toLazyPlugin('ScaleBox', () => import(/* webpackChunkName: 'plugins/scaleBox' */ '../plugins/ScaleBox')),
    ScrollTopPlugin: toLazyPlugin('ScrollTop', () => import(/* webpackChunkName: 'plugins/scrollTop' */ '../plugins/ScrollTop')),
    SearchPlugin: toLazyPlugin('Search', () => import(/* webpackChunkName: 'plugins/search' */ '../plugins/Search')),
    SearchServicesConfigPlugin: toLazyPlugin('SearchServicesConfig', () => import(/* webpackChunkName: 'plugins/searchServicesConfig' */ '../plugins/SearchServicesConfig')),
    SearchByBookmarkPlugin: toLazyPlugin('SearchByBookmark', () => import(/* webpackChunkName: 'plugins/searchByBookmark' */ '../plugins/SearchByBookmark')),
    SettingsPlugin: toLazyPlugin('Settings', () => import(/* webpackChunkName: 'plugins/settings' */ '../plugins/Settings')),
    SidebarMenuPlugin: toLazyPlugin('SidebarMenu', () => import(/* webpackChunkName: 'plugins/sidebarMenu' */ '../plugins/SidebarMenu')),
    SharePlugin: toLazyPlugin('Share', () => import(/* webpackChunkName: 'plugins/share' */ '../plugins/Share')),
    SnapshotPlugin: require('../plugins/Snapshot').default,
    StyleEditorPlugin: require('../plugins/StyleEditor').default,
    StreetView: require('../plugins/StreetView').default,
    SwipePlugin: require('../plugins/Swipe').default,
    TOCItemsSettingsPlugin: toLazyPlugin('TOCItemsSettings', () => import(/* webpackChunkName: 'plugins/TOCItemsSettings' */ '../plugins/TOCItemsSettings')),
    TOCPlugin: toLazyPlugin('TOC', () => import(/* webpackChunkName: 'plugins/TOC' */ '../plugins/TOC')),
    ThematicLayerPlugin: require('../plugins/ThematicLayer').default,
    ThemeSwitcherPlugin: require('../plugins/ThemeSwitcher').default,
    TimelinePlugin: require('../plugins/Timeline').default,
    ToolbarPlugin: toLazyPlugin('Toolbar', () => import(/* webpackChunkName: 'plugins/toolbar' */ '../plugins/Toolbar')),
    TutorialPlugin: toLazyPlugin('Tutorial', () => import(/* webpackChunkName: 'plugins/tutorial' */ '../plugins/Tutorial')),
    UndoPlugin: toLazyPlugin('Undo', () => import(/* webpackChunkName: 'plugins/history' */ '../plugins/History')),
    UserManagerPlugin: require('../plugins/manager/UserManager').default,
    UserExtensionsPlugin: require('../plugins/UserExtensions').default,
    UserSessionPlugin: require('../plugins/UserSession').default,
    VersionPlugin: toLazyPlugin('Version', () => import(/* webpackChunkName: 'plugins/version' */ '../plugins/Version')),
    WidgetsBuilderPlugin: toLazyPlugin('WidgetsBuilder', () => import(/* webpackChunkName: 'plugins/widgetsBuilder' */ '../plugins/WidgetsBuilder')),
    WidgetsPlugin: toLazyPlugin('Widgets', () => import(/* webpackChunkName: 'plugins/widgets' */ '../plugins/Widgets')),
    WidgetsTrayPlugin: toLazyPlugin('WidgetsTray', () => import(/* webpackChunkName: 'plugins/widgetsTray' */ '../plugins/WidgetsTray')),
    ZoomAllPlugin: toLazyPlugin('ZoomAll', () => import(/* webpackChunkName: 'plugins/zoomAll' */ '../plugins/ZoomAll')),
    ZoomInPlugin: toLazyPlugin('ZoomIn', () => import(/* webpackChunkName: 'plugins/zoomIn' */ '../plugins/ZoomIn')),
    ZoomOutPlugin: toLazyPlugin('ZoomOut', () => import(/* webpackChunkName: 'plugins/zoomOut' */ '../plugins/ZoomOut'))
};

const pluginsDefinition = {
    plugins,
    requires: {
        ReactSwipe: require('react-swipeable-views').default,
        SwipeHeader: require('../components/data/identify/SwipeHeader').default
    }
};

export default splitLazyAndStaticPlugins(pluginsDefinition);
