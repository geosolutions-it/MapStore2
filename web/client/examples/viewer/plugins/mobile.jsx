var GetFeatureInfo = require("../components/getFeatureInfo/GetFeatureInfo");
var LayerTree = require('../components/LayerTree');
var Settings = require('../components/Settings');
var LangBar = require('../../../components/I18N/LangBar');
var CRSSelector = require("../../../components/mapcontrols/mouseposition/CRSSelector");
var ToggleButton = require('../../../components/buttons/ToggleButton');
var { ActionCreators } = require('redux-undo');
var {undo, redo} = ActionCreators;
var BackgroundSwitcher = require("../../../components/BackgroundSwitcher/BackgroundSwitcher");
var MousePosition = require("../../../components/mapcontrols/mouseposition/MousePosition");
var {Message} = require('../../../components/I18N/I18N');
var Menu = require('../../../components/menu/DrawerMenu');
var mapInfo = require('../../../reducers/mapInfo');
var floatingPanel = require('../reducers/floatingPanel');
var mousePosition = require('../../../reducers/mousePosition');
var measurement = require('../../../reducers/measurement');
var {searchResults} = require('../../../reducers/search');
var help = require('../../../reducers/help');

var LocateBtn = require("../../../components/mapcontrols/Locate/LocateBtn");
var locate = require('../../../reducers/locate');
var {changeLocateState} = require('../../../actions/locate');
// search SearchBar
var SearchBar = require("../../../components/Search/SearchBar");
var NominatimResultList = require("../../../components/Search/geocoding/NominatimResultList");

var {getFeatureInfo, changeMapInfoState, purgeMapInfoResults, changeMapInfoFormat} = require('../../../actions/mapInfo');
var {activatePanel} = require('../actions/floatingPanel');
var {changeMousePosition, changeMousePositionCrs, changeMousePositionState} = require('../../../actions/mousePosition');

var {toggleNode, sortNode, changeLayerProperties, layerLoad} = require('../../../actions/layers');
var {changeMapView, changeZoomLevel} = require('../../../actions/map');
var {textSearch, resultsPurge} = require("../../../actions/search");

var {changeMeasurementState} = require('../../../actions/measurement');
var {Button, PanelGroup, Panel, Glyphicon} = require('react-bootstrap');
var {changeHelpState, changeHelpText, changeHelpwinVisibility} = require('../../../actions/help');

var React = require('react');

var {isObject} = require('lodash');

const reorderLayers = (groups, allLayers) => {
    return groups.slice(0).reverse().reduce((previous, group) => {
        return previous.concat(
            group.nodes.filter((node) => !isObject(node)).reverse().map((layer) => allLayers.filter((fullLayer) => fullLayer.name === layer)[0])
        ).concat(reorderLayers((group.nodes || []).filter((node) => isObject(node)).reverse(), allLayers).reverse());
    }, []);
};

var {connect} = require('react-redux');

var GlobalSpinner = connect((state) => {
    return {
        loading: state.layers.flat.some((layer) => layer.loading)
    };
})(require('../../../components/spinners/GlobalSpinner/GlobalSpinner'));
var menu;
module.exports = {
    components: (props) => {
        return [

            <SearchBar key="seachBar" onSearch={props.textSearch} onSearchReset={props.resultsPurge}/>,
            <NominatimResultList key="nominatim-result-list" results={props.searchResults} onItemClick={(props.changeMapView)} afterItemClick={props.resultsPurge} mapConfig={props.map}/>,
            <Menu key="drawermenu" ref={ (ref) => { menu = ref; } } alignment="left">
                <PanelGroup accordion defaultActiveKey="1">
                    <Panel eventKey="1" header="Layers" collapsible>
                        <LayerTree
                            key="layerSwitcher"
                            isPanel={true}
                            groupStyle={{style: {
                                marginBottom: "0px",
                                cursor: "pointer"
                            }}}
                            groups={props.layers.groups}
                            propertiesChangeHandler={props.changeLayerProperties}
                            onToggleGroup={(group, status) => props.toggleNode(group, 'groups', status)}
                            onToggleLayer={(layer, status) => props.toggleNode(layer, 'layers', status)}
                            />
                    </Panel>
                    <Panel eventKey="2" header="Backgrounds" collapsible>
                        <BackgroundSwitcher
                            key="backgroundSwitcher"
                            isPanel={true}
                            fluid={true}
                            columnProperties={{
                                xs: 6,
                                sm: 6,
                                md: 6
                             }}
                            layers={props.layers.flat.filter((layer) => layer.group === "background")}
                            title={<div><Message msgId="background"/></div>}
                            helpText={<Message msgId="helptexts.backgroundSwitcher"/>}
                            buttonTooltip={<Message msgId="backgroundSwither.tooltip"/>}
                            propertiesChangeHandler={props.changeLayerProperties}/>
                    </Panel>
                    <Panel eventKey="3" header="Settings">
                        <Settings
                            key="settingsPanel"
                            isPanel={true}
                            buttonTooltip={<Message msgId="settings" />}
                            helpText={<Message msgId="helptexts.settingsPanel"/>}>
                            <h5><Message msgId="language" /></h5>
                            <LangBar key="langSelector"
                            currentLocale={props.locale}
                            onLanguageChange={props.loadLocale}/>
                            <CRSSelector
                                key="crsSelector"
                                onCRSChange={props.changeMousePositionCrs}
                                enabled={true}
                                inputProps={{
                                    label: <Message msgId="mousePositionCoordinates" />,
                                    buttonBefore: <ToggleButton
                                        isButton={true}
                                        text={<Message msgId="enable" />}
                                        pressed={props.mousePositionEnabled}
                                        glyphicon="eye-open"
                                        onClick={props.changeMousePositionState}/>
                                }}
                                crs={(props.mousePositionCrs) ? props.mousePositionCrs : props.map.projection} />
                        </Settings>
                    </Panel>
                </PanelGroup>
            </Menu>,
            <Button id="drawer-menu-button" key="menu-button" onClick={() => {menu.show(); }}><Glyphicon glyph="menu-hamburger"/></Button>,
            <LocateBtn
                   id="locateMeButton"
                   key="locate-me-button"
                   style={{width: "auto"}}
                   locate={props.locate.state}
                   onClick={props.changeLocateState}
                   tooltip={<Message msgId="locate.tooltip"/>}/>,
            <MousePosition
                id="mapstore-mouseposition-mobile"
                key="mousePosition"
                enabled={props.mousePositionEnabled}
                mousePosition={props.map.center}
                crs={(props.mousePositionCrs) ? props.mousePositionCrs : props.map.projection}/>,
            <GetFeatureInfo
                key="getFeatureInfo"
                enabled={props.mapInfo.enabled}
                htmlResponses={props.mapInfo.responses}
                htmlRequests={props.mapInfo.requests}
                infoFormat={props.mapInfo.infoFormat}
                map={props.map}
                layers={props.layers.flat}
                actions={{
                    getFeatureInfo: props.getFeatureInfo,
                    purgeMapInfoResults: props.purgeMapInfoResults,
                    changeMousePointer: props.changeMousePointer
                }}
                clickedMapPoint={props.mapInfo.clickPoint} />,
            <GlobalSpinner key="globalSpinner"/>
        ];
    },
    reducers: {
        mapInfo,
        floatingPanel,
        mousePosition,
        measurement,
        searchResults,
        locate,
        help
    },
    actions: {
        getFeatureInfo,
        textSearch,
        resultsPurge,
        changeMapInfoState,
        purgeMapInfoResults,
        activatePanel,
        changeLayerProperties,
        changeMousePositionState,
        changeMousePositionCrs,
        changeMousePosition,
        changeLocateState,
        changeZoomLevel,
        // layerLoading,
        layerLoad,
        changeMapView,
        toggleNode,
        sortNode,
        undo,
        redo,
        changeMapInfoFormat,
        changeMeasurementState,
        changeHelpState,
        changeHelpText,
        changeHelpwinVisibility
    }
};
