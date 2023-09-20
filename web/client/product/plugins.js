/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import Context from "../plugins/Context";
import ContextCreator from "../plugins/ContextCreator";
import Dashboard from "../plugins/Dashboard";
import Dashboards from "../plugins/Dashboards";
import FeedbackMask from '../plugins/FeedbackMask';
import GeoStories from "../plugins/GeoStories";
import GeoStory from "../plugins/GeoStory";
import Identify from '../plugins/Identify';
import Login from '../plugins/Login';
import Maps from "../plugins/Maps";
import Print from "../plugins/Print";
import RulesDataGrid from "../plugins/RulesDataGrid";
import RulesEditor from "../plugins/RulesEditor";
import RulesManagerFooter from "../plugins/RulesManagerFooter";
import UserSession from "../plugins/UserSession";
import FeatureEditor from '../plugins/FeatureEditor';

import {toModulePlugin} from "../utils/ModulePluginsUtils";

/**
  * Please, keep them sorted alphabetically
 */
export const plugins = {
    // ### STATIC PLUGINS ### //
    ContextCreatorPlugin: ContextCreator,
    ContextPlugin: Context,
    Dashboard: Dashboard,
    DashboardsPlugin: Dashboards,
    FeedbackMaskPlugin: FeedbackMask,
    GeoStoriesPlugin: GeoStories,
    GeoStoryPlugin: GeoStory,
    IdentifyPlugin: Identify,
    LoginPlugin: Login,
    MapsPlugin: Maps,
    PrintPlugin: Print,
    RulesDataGridPlugin: RulesDataGrid,
    RulesEditorPlugin: RulesEditor,
    RulesManagerFooter: RulesManagerFooter,
    UserSessionPlugin: UserSession,
    FeatureEditorPlugin: FeatureEditor,

    // ### DYNAMIC PLUGINS ### //
    // product plugins
    AboutPlugin: toModulePlugin('About', () => import(/* webpackChunkName: 'plugins/about' */ './plugins/About')),
    AttributionPlugin: toModulePlugin('Attribution', () => import(/* webpackChunkName: 'plugins/attribution' */ './plugins/Attribution')),
    FooterPlugin: toModulePlugin('Footer', () => import(/* webpackChunkName: 'plugins/footer' */ './plugins/Footer'), {}, 'FooterPlugin'),
    ForkPlugin: toModulePlugin('Fork', () => import(/* webpackChunkName: 'plugins/fork' */ './plugins/Fork')),
    HeaderPlugin: toModulePlugin('Header', () => import(/* webpackChunkName: 'plugins/header' */ './plugins/Header')),
    HomeDescriptionPlugin: toModulePlugin('HomeDescription', () => import(/* webpackChunkName: 'plugins/HomeDescription' */ './plugins/HomeDescription')),
    MadeWithLovePlugin: toModulePlugin('MadeWithLove', () => import(/* webpackChunkName: 'plugins/madeWithLove' */ './plugins/MadeWithLove')),
    // framework plugins
    MapTypePlugin: toModulePlugin('MapType', () => import(/* webpackChunkName: 'plugins/mapType' */ './plugins/MapType')),
    NavMenuPlugin: toModulePlugin('NavMenu', () => import(/* webpackChunkName: 'plugins/navMenu' */ './plugins/NavMenu')),
    AddGroupPlugin: toModulePlugin('AddGroup', () => import(/* webpackChunkName: 'plugins/about' */'../plugins/AddGroup')),
    AnnotationsPlugin: toModulePlugin('Annotations', () => import(/* webpackChunkName: 'plugins/annotations' */ '../plugins/Annotations')),
    AutoMapUpdatePlugin: toModulePlugin('AutoMapUpdate', () => import(/* webpackChunkName: 'plugins/autoMapUpdate' */ '../plugins/AutoMapUpdate')),
    BackgroundSelectorPlugin: toModulePlugin('BackgroundSelector', () => import(/* webpackChunkName: 'plugins/backgroundSelector' */ '../plugins/BackgroundSelector')),
    BurgerMenuPlugin: toModulePlugin('BurgerMenu', () => import(/* webpackChunkName: 'plugins/burgerMenu' */ '../plugins/BurgerMenu')),
    CRSSelectorPlugin: toModulePlugin('CRSSelector', () => import(/* webpackChunkName: 'plugins/CRSSelector' */ '../plugins/CRSSelector')),
    ContentTabs: toModulePlugin('ContentTabs', () => import(/* webpackChunkName: 'plugins/contentTabs' */ '../plugins/ContentTabs')),
    ContextManagerPlugin: toModulePlugin('ContextManager', () => import(/* webpackChunkName: 'plugins/contextManager' */ '../plugins/contextmanager/ContextManager')),
    ContextsPlugin: toModulePlugin('Contexts', () => import(/* webpackChunkName: 'plugins/contexts' */ '../plugins/Contexts')),
    ContextImportPlugin: toModulePlugin('ContextImport', () => import(/* webpackChunkName: 'plugins/contextImport' */ '../plugins/ContextImport')),
    ContextExportPlugin: toModulePlugin('ContextExport', () => import(/* webpackChunkName: 'plugins/contextExport' */ '../plugins/ContextExport')),
    CookiePlugin: toModulePlugin('Cookie', () => import(/* webpackChunkName: 'plugins/cookie' */ '../plugins/Cookie')),
    CreateNewMapPlugin: toModulePlugin('CreateNewMap', () => import(/* webpackChunkName: 'plugins/createNewMap' */ '../plugins/CreateNewMap')),
    DashboardEditor: toModulePlugin('DashboardEditor', () => import(/* webpackChunkName: 'plugins/dashboardEditor' */ '../plugins/DashboardEditor')),
    DashboardExport: toModulePlugin('DashboardExport', () => import(/* webpackChunkName: 'plugins/dashboardExport' */ '../plugins/DashboardExport')),
    DashboardImport: toModulePlugin('DashboardImport', () => import( /* webpackChunkName: 'plugins/dashboardImport' */'../plugins/DashboardImport')),
    DeleteMapPlugin: toModulePlugin('DeleteMap', () => import(/* webpackChunkName: 'plugins/deleteMap' */ '../plugins/DeleteMap')),
    DeleteGeoStoryPlugin: toModulePlugin('DeleteGeoStory', () => import(/* webpackChunkName: 'plugins/deleteGeoStory' */ '../plugins/DeleteGeoStory')),
    DeleteDashboardPlugin: toModulePlugin('DeleteDashboard', () => import(/* webpackChunkName: 'plugins/deleteDashboard' */ '../plugins/DeleteDashboard')),
    DetailsPlugin: toModulePlugin('Details', () => import(/* webpackChunkName: 'plugins/details' */ '../plugins/Details')),
    DrawerMenuPlugin: toModulePlugin('DrawerMenu', () => import(/* webpackChunkName: 'plugins/drawerMenu' */ '../plugins/DrawerMenu')),
    ExpanderPlugin: toModulePlugin('Expander', () => import(/* webpackChunkName: 'plugins/expander' */ '../plugins/Expander')),
    FeaturedMaps: toModulePlugin('FeaturedMaps', () => import(/* webpackChunkName: 'plugins/featuredMaps' */ '../plugins/FeaturedMaps')),
    FilterLayerPlugin: toModulePlugin('FilterLayer', () => import(/* webpackChunkName: 'plugins/filterLayer' */ '../plugins/FilterLayer')),
    FloatingLegendPlugin: toModulePlugin('FloatingLegend', () => import(/* webpackChunkName: 'plugins/floatingLegend' */ '../plugins/FloatingLegend')),
    FullScreenPlugin: toModulePlugin('FullScreen', () => import(/* webpackChunkName: 'plugins/fullScreen' */ '../plugins/FullScreen')),
    GeoStoryEditorPlugin: toModulePlugin('GeoStoryEditor', () => import(/* webpackChunkName: 'plugins/geoStoryEditor' */ '../plugins/GeoStoryEditor')),
    GeoStorySavePlugin: toModulePlugin('GeoStorySave', () => import(/* webpackChunkName: 'plugins/geoStorySave' */ '../plugins/GeoStorySave'), { exportedName: 'GeoStorySave'}),
    GeoStorySaveAsPlugin: toModulePlugin('GeoStorySaveAs', () => import(/* webpackChunkName: 'plugins/geoStorySave' */ '../plugins/GeoStorySave'), { exportedName: 'GeoStorySaveAs'}),
    GeoStoryExport: toModulePlugin('GeoStoryExport', () => import(/* webpackChunkName: 'plugins/geoStoryExport' */ '../plugins/GeoStoryExport')),
    GeoStoryImport: toModulePlugin('GeoStoryImport', () => import(/* webpackChunkName: 'plugins/geoStoryImport' */ '../plugins/GeoStoryImport')),
    DashboardSavePlugin: toModulePlugin('DashboardSave', () => import(/* webpackChunkName: 'plugins/dashboardSave' */ '../plugins/DashboardSave'), { exportedName: 'DashboardSave'}),
    DashboardSaveAsPlugin: toModulePlugin('DashboardSaveAs', () => import(/* webpackChunkName: 'plugins/dashboardSave' */ '../plugins/DashboardSave'), { exportedName: 'DashboardSaveAs'}),
    GeoProcessing: toModulePlugin('GeoProcessing', () => import(/* webpackChunkName: 'plugins/GeoProcessing' */ '../plugins/GeoProcessing')),
    GeoStoryNavigationPlugin: toModulePlugin('GeoStoryNavigation', () => import(/* webpackChunkName: 'plugins/geoStoryNavigation' */ '../plugins/GeoStoryNavigation')),
    GroupManagerPlugin: toModulePlugin('GroupManager', () => import(/* webpackChunkName: 'plugins/groupManager' */ '../plugins/manager/GroupManager')),
    GlobeViewSwitcherPlugin: toModulePlugin('GlobeViewSwitcher', () => import(/* webpackChunkName: 'plugins/globeViewSwitcher' */ '../plugins/GlobeViewSwitcher')),
    GoFull: toModulePlugin('GoFull', () => import(/* webpackChunkName: 'plugins/goFull' */ '../plugins/GoFull')),
    GridContainerPlugin: toModulePlugin('GridContainer', () => import(/* webpackChunkName: 'plugins/gridContainer' */ '../plugins/GridContainer')),
    HelpLinkPlugin: toModulePlugin('HelpLink', () => import(/* webpackChunkName: 'plugins/helpLink' */ '../plugins/HelpLink')),
    HelpPlugin: toModulePlugin('Help', () => import(/* webpackChunkName: 'plugins/helpPlugin' */ '../plugins/Help')),
    HomePlugin: toModulePlugin('Home', () => import(/* webpackChunkName: 'plugins/home' */ '../plugins/Home')),
    LanguagePlugin: toModulePlugin('Language', () => import(/* webpackChunkName: 'plugins/language' */ '../plugins/Language')),
    LayerDownload: toModulePlugin('LayerDownload', () => import(/* webpackChunkName: 'plugins/layerDownload' */ '../plugins/LayerDownload')),
    LayerInfoPlugin: toModulePlugin('LayerInfo', () => import(/* webpackChunkName: 'plugins/layerInfo' */ '../plugins/LayerInfo')),
    LocatePlugin: toModulePlugin('Locate', () => import(/* webpackChunkName: 'plugins/locate' */ '../plugins/Locate')),
    LongitudinalProfileToolPlugin: toModulePlugin('LongitudinalProfileTool', () => import(/* webpackChunkName: 'plugins/LongitudinalProfileTool' */ '../plugins/LongitudinalProfileTool')),
    ManagerMenuPlugin: toModulePlugin('ManagerMenu', () => import(/* webpackChunkName: 'plugins/managerMenu' */ '../plugins/manager/ManagerMenu')),
    ManagerPlugin: toModulePlugin('Manager', () => import(/* webpackChunkName: 'plugins/manager' */ '../plugins/manager/Manager')),
    MapEditorPlugin: toModulePlugin('MapEditor', () => import(/* webpackChunkName: 'plugins/mapEditor' */ '../plugins/MapEditor')),
    MapExportPlugin: toModulePlugin('MapExport', () => import(/* webpackChunkName: 'plugins/mapExport' */ '../plugins/MapExport')),
    MapFooterPlugin: toModulePlugin('MapFooter', () => import(/* webpackChunkName: 'plugins/mapFooter' */ '../plugins/MapFooter')),
    MapImportPlugin: toModulePlugin('MapImport', () => import(/* webpackChunkName: 'plugins/mapImport' */ '../plugins/MapImport')),
    MapLoadingPlugin: toModulePlugin('MapLoading', () => import(/* webpackChunkName: 'plugins/mapLoading' */ '../plugins/MapLoading')),
    MapPlugin: toModulePlugin('Map', () => import(/* webpackChunkName: 'plugins/map' */ '../plugins/Map')),
    MapSearchPlugin: toModulePlugin('MapSearch', () => import(/* webpackChunkName: 'plugins/mapSearch' */ '../plugins/MapSearch')),
    MapCatalogPlugin: toModulePlugin('MapCatalog', () => import(/* webpackChunkName: 'plugins/mapCatalog' */ '../plugins/MapCatalog')),
    MapTemplatesPlugin: toModulePlugin('MapTemplates', () => import(/* webpackChunkName: 'plugins/measure' */ '../plugins/MapTemplates')),
    MapViewsPlugin: toModulePlugin('MapViews', () => import(/* webpackChunkName: 'plugins/mapViews' */ '../plugins/MapViews')),
    MeasurePlugin: toModulePlugin('Measure', () => import(/* webpackChunkName: 'plugins/gridContainer' */ '../plugins/Measure')),
    MediaEditorPlugin: toModulePlugin('MediaEditor', () => import(/* webpackChunkName: 'plugins/mediaEditor' */ '../plugins/MediaEditor')),
    MetadataExplorerPlugin: toModulePlugin('MetadataExplorer', () => import(/* webpackChunkName: 'plugins/metadataExplorer' */ '../plugins/MetadataExplorer')),
    MousePositionPlugin: toModulePlugin('MousePosition', () => import(/* webpackChunkName: 'plugins/mousePosition' */ '../plugins/MousePosition')),
    NotificationsPlugin: toModulePlugin('Notifications', () => import(/* webpackChunkName: 'plugins/notifications' */ '../plugins/Notifications')),
    OmniBarPlugin: toModulePlugin('OmniBar', () => import(/* webpackChunkName: 'plugins/omniBar' */ '../plugins/OmniBar')),
    PlaybackPlugin: toModulePlugin('Playback', () => import(/* webpackChunkName: 'plugins/playback' */ '../plugins/Playback')),
    QueryPanelPlugin: toModulePlugin('QueryPanel', () => import(/* webpackChunkName: 'plugins/queryPanel' */ '../plugins/QueryPanel')),
    RedirectPlugin: toModulePlugin('Redirect', () => import(/* webpackChunkName: 'plugins/redirect' */ '../plugins/Redirect')),
    RedoPlugin: toModulePlugin('Redo', () => import(/* webpackChunkName: 'plugins/history' */ '../plugins/History')),
    SavePlugin: toModulePlugin('Save', () => import(/* webpackChunkName: 'plugins/save' */ '../plugins/Save')),
    SaveAsPlugin: toModulePlugin('SaveAs', () => import(/* webpackChunkName: 'plugins/saveAs' */ '../plugins/SaveAs')),
    SaveStoryPlugin: toModulePlugin('SaveStory', () => import(/* webpackChunkName: 'plugins/saveStory' */ '../plugins/GeoStorySave')),
    ScaleBoxPlugin: toModulePlugin('ScaleBox', () => import(/* webpackChunkName: 'plugins/scaleBox' */ '../plugins/ScaleBox')),
    ScrollTopPlugin: toModulePlugin('ScrollTop', () => import(/* webpackChunkName: 'plugins/scrollTop' */ '../plugins/ScrollTop')),
    SearchPlugin: toModulePlugin('Search', () => import(/* webpackChunkName: 'plugins/search' */ '../plugins/Search')),
    SearchServicesConfigPlugin: toModulePlugin('SearchServicesConfig', () => import(/* webpackChunkName: 'plugins/searchServicesConfig' */ '../plugins/SearchServicesConfig')),
    SearchByBookmarkPlugin: toModulePlugin('SearchByBookmark', () => import(/* webpackChunkName: 'plugins/searchByBookmark' */ '../plugins/SearchByBookmark')),
    SettingsPlugin: toModulePlugin('Settings', () => import(/* webpackChunkName: 'plugins/settings' */ '../plugins/Settings')),
    SidebarMenuPlugin: toModulePlugin('SidebarMenu', () => import(/* webpackChunkName: 'plugins/sidebarMenu' */ '../plugins/SidebarMenu')),
    SharePlugin: toModulePlugin('Share', () => import(/* webpackChunkName: 'plugins/share' */ '../plugins/Share')),
    PermalinkPlugin: toModulePlugin('Permalink', () => import(/* webpackChunkName: 'plugins/permalink' */ '../plugins/Permalink')),
    SnapshotPlugin: toModulePlugin('Snapshot', () => import(/* webpackChunkName: 'plugins/snapshot' */ '../plugins/Snapshot')),
    StreetView: toModulePlugin('StreetView', () => import(/* webpackChunkName: 'plugins/streetView' */ '../plugins/StreetView')),
    StyleEditor: toModulePlugin('StyleEditor', () => import(/* webpackChunkName: 'plugins/styleEditor' */ '../plugins/StyleEditor')),
    SwipePlugin: toModulePlugin('Swipe', () => import(/* webpackChunkName: 'plugins/swipe' */ '../plugins/Swipe')),
    TOCItemsSettingsPlugin: toModulePlugin('TOCItemsSettings', () => import(/* webpackChunkName: 'plugins/TOCItemsSettings' */ '../plugins/TOCItemsSettings')),
    TOCPlugin: toModulePlugin('TOC', () => import(/* webpackChunkName: 'plugins/TOC' */ '../plugins/TOC')),
    ThematicLayerPlugin: toModulePlugin('ThematicLayer', () => import(/* webpackChunkName: 'plugins/thematicLayer' */ '../plugins/ThematicLayer')),
    ThemeSwitcherPlugin: toModulePlugin('ThemeSwitcher', () => import(/* webpackChunkName: 'plugins/themeSwitcher' */ '../plugins/ThemeSwitcher')),
    TimelinePlugin: toModulePlugin('Timeline', () => import(/* webpackChunkName: 'plugins/timeline' */ '../plugins/Timeline')),
    ToolbarPlugin: toModulePlugin('Toolbar', () => import(/* webpackChunkName: 'plugins/toolbar' */ '../plugins/Toolbar')),
    TutorialPlugin: toModulePlugin('Tutorial', () => import(/* webpackChunkName: 'plugins/tutorial' */ '../plugins/Tutorial')),
    UndoPlugin: toModulePlugin('Undo', () => import(/* webpackChunkName: 'plugins/history' */ '../plugins/History')),
    UserExtensionsPlugin: toModulePlugin('UserExtensions', () => import(/* webpackChunkName: 'plugins/userExtensions' */ '../plugins/UserExtensions')),
    UserManagerPlugin: toModulePlugin('UserManager', () => import(/* webpackChunkName: 'plugins/userManager' */ '../plugins/manager/UserManager')),
    WidgetsBuilderPlugin: toModulePlugin('WidgetsBuilder', () => import(/* webpackChunkName: 'plugins/widgetsBuilder' */ '../plugins/WidgetsBuilder')),
    WidgetsPlugin: toModulePlugin('Widgets', () => import(/* webpackChunkName: 'plugins/widgets' */ '../plugins/Widgets')),
    WidgetsTrayPlugin: toModulePlugin('WidgetsTray', () => import(/* webpackChunkName: 'plugins/widgetsTray' */ '../plugins/WidgetsTray')),
    ZoomAllPlugin: toModulePlugin('ZoomAll', () => import(/* webpackChunkName: 'plugins/zoomAll' */ '../plugins/ZoomAll')),
    ZoomInPlugin: toModulePlugin('ZoomIn', () => import(/* webpackChunkName: 'plugins/zoomIn' */ '../plugins/ZoomIn')),
    ZoomOutPlugin: toModulePlugin('ZoomOut', () => import(/* webpackChunkName: 'plugins/zoomOut' */ '../plugins/ZoomOut'))
};

const pluginsDefinition = {
    plugins,
    requires: {
        ReactSwipe: require('react-swipeable-views').default,
        SwipeHeader: require('../components/data/identify/SwipeHeader').default
    }
};

export default pluginsDefinition;
