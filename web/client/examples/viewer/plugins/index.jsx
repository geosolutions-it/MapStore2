var About = require('../components/About');
var MapToolBar = require("../components/MapToolBar");
var Settings = require("../components/Settings");
var LangBar = require('../../../components/I18N/LangBar');
var {Message} = require('../../../components/I18N/I18N');
var CRSSelector = require("../../../components/mapcontrols/mouseposition/CRSSelector");
var ToggleButton = require('../../../components/buttons/ToggleButton');
var MousePosition = require("../../../components/mapcontrols/mouseposition/MousePosition");
var FeatureInfoFormatSelector = require("../../../components/misc/FeatureInfoFormatSelector");
var MeasureComponent = require("../../../components/MeasureComponent/MeasureComponent");
var GetFeatureInfo = require("../components/getFeatureInfo/GetFeatureInfo");
var ScaleBox = require("../../../components/ScaleBox/ScaleBox");
var ZoomToMaxExtentButton = require('../../../components/buttons/ZoomToMaxExtentButton');
var LayerTree = require('../components/LayerTree');
var HistoryBar = require("../../../components/mapcontrols/navigationhistory/HistoryBar");
var { ActionCreators } = require('redux-undo');
var {undo, redo} = ActionCreators;
var BackgroundSwitcher = require("../../../components/BackgroundSwitcher/BackgroundSwitcher");
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

var {toggleNode, sortNode, changeLayerProperties, layerLoading, layerLoad} = require('../../../actions/layers');
var {changeMapView, changeZoomLevel} = require('../../../actions/map');
var {textSearch, resultsPurge} = require("../../../actions/search");

var {changeMeasurementState} = require('../../../actions/measurement');

var {changeHelpState, changeHelpText, changeHelpwinVisibility} = require('../../../actions/help');
var HelpWrapper = require('../../../components/Help/HelpWrapper');
var HelpTextPanel = require('../../../components/Help/HelpTextPanel');
var HelpBadge = require('../../../components/Help/HelpBadge');
var HelpToggleBtn = require('../../../components/Help/HelpToggleBtn');

var React = require('react');

var {isObject} = require('lodash');

const reorderLayers = (groups, allLayers) => {
    return groups.slice(0).reverse().reduce((previous, group) => {
        return previous.concat(
            group.nodes.filter((node) => !isObject(node)).reverse().map((layer) => allLayers.filter((fullLayer) => fullLayer.name === layer)[0])
        ).concat(reorderLayers((group.nodes || []).filter((node) => isObject(node)).reverse(), allLayers).reverse());
    }, []);
};

var sortLayers = (groups, allLayers) => {
    return allLayers.filter((layer) => layer.group === 'background').concat(reorderLayers(groups, allLayers));
};

var {connect} = require('react-redux');

var GlobalSpinner = connect((state) => {
    return {
        loading: state.layers.flat.some((layer) => layer.loading)
    };
})(require('../../../components/spinners/GlobalSpinner/GlobalSpinner'));

module.exports = {
    components: (props) => {
        return [
            <About
                key="about"
                style={{
                    position: "absolute",
                        zIndex: 1000,
                        bottom: "-8px",
                        right: "0px",
                        margin: "8px"
                    }} />,
            <HelpWrapper
                key="seachBar-help"
                helpText={<Message msgId="helptexts.searchBar"/>}
                helpEnabled={props.help.enabled}
                changeHelpText={props.changeHelpText}
                changeHelpwinVisibility={props.changeHelpwinVisibility}
                >
                <SearchBar key="seachBar" onSearch={props.textSearch} onSearchReset={props.resultsPurge}/>
            </HelpWrapper>,
            <NominatimResultList key="nominatimresults" results={props.searchResults} onItemClick={(props.changeMapView)} afterItemClick={props.resultsPurge} mapConfig={props.map}/>,
            <MapToolBar
                activeKey={props.floatingPanel.activeKey}
                onActivateItem={props.activatePanel}
                key="mapToolbar"
                helpEnabled={props.help.enabled}
                changeHelpText={props.changeHelpText}
                changeHelpwinVisibility={props.changeHelpwinVisibility}
                >
                 <LocateBtn
                         text={<HelpBadge
                         className="mapstore-tb-helpbadge"
                         helpText={<Message msgId="helptexts.locateBtn"/>}
                         isVisible={props.help.enabled}
                         changeHelpText={props.changeHelpText}
                         changeHelpwinVisibility={props.changeHelpwinVisibility}
                         />}
                         key="locate"
                        locate={props.locate.state}
                        onClick={props.changeLocateState}
                        tooltip={<Message msgId="locate.tooltip"/>}/>
                <ToggleButton
                    text={<HelpBadge
                        className="mapstore-tb-helpbadge"
                        helpText={<Message msgId="helptexts.infoButton"/>}
                        isVisible={props.help.enabled}
                        changeHelpText={props.changeHelpText}
                        changeHelpwinVisibility={props.changeHelpwinVisibility}
                        />}
                    key="infoButton"
                    isButton={true}
                    pressed={props.mapInfo.enabled}
                    glyphicon="info-sign"
                    helpText={<Message msgId="helptexts.infoButton"/>}
                    onClick={props.changeMapInfoState}/>
                <LayerTree
                    key="layerSwitcher"
                    isPanel={true}
                    buttonTooltip={<Message msgId="layers"/>}
                    title={<Message msgId="layers"/>}
                    helpText={<Message msgId="helptexts.layerSwitcher"/>}
                    groups={props.layers.groups}
                    propertiesChangeHandler={props.changeLayerProperties}
                    onToggleGroup={(group, status) => props.toggleNode(group, 'groups', status)}
                    onToggleLayer={(layer, status) => props.toggleNode(layer, 'layers', status)}
                    onSort={(node, reorder) => props.sortNode(node, reorder, sortLayers)}
                    />
                <BackgroundSwitcher
                    key="backgroundSwitcher"
                    isPanel={true}
                    layers={props.layers.flat.filter((layer) => layer.group === "background")}
                    title={<div><Message msgId="background"/></div>}
                    helpText={<Message msgId="helptexts.backgroundSwitcher"/>}
                    buttonTooltip={<Message msgId="backgroundSwither.tooltip"/>}
                    propertiesChangeHandler={props.changeLayerProperties}/>
                <MeasureComponent
                    key="measureComponent"
                    isPanel={true}
                    title={<div><Message msgId="measureComponent.title"/></div>}
                    buttonTooltip={<Message msgId="measureComponent.tooltip"/>}
                    helpText={<Message msgId="helptexts.measureComponent"/>}
                    lengthButtonText={<Message msgId="measureComponent.lengthButtonText"/>}
                    areaButtonText={<Message msgId="measureComponent.areaButtonText"/>}
                    resetButtonText={<Message msgId="measureComponent.resetButtonText"/>}
                    lengthLabel={<Message msgId="measureComponent.lengthLabel"/>}
                    areaLabel={<Message msgId="measureComponent.areaLabel"/>}
                    bearingLabel={<Message msgId="measureComponent.bearingLabel"/>}
                    toggleMeasure={props.changeMeasurementState}
                    lineMeasureEnabled={props.measurement.lineMeasureEnabled}
                    areaMeasureEnabled={props.measurement.areaMeasureEnabled}
                    bearingMeasureEnabled={props.measurement.bearingMeasureEnabled}
                    measurement={props.measurement}
                />
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
                                btnConfig={{disabled: (!props.browser.touch) ? false : true}}
                                pressed={props.mousePositionEnabled}
                                glyphicon="eye-open"
                                onClick={props.changeMousePositionState}/>
                        }}
                        crs={(props.mousePositionCrs) ? props.mousePositionCrs : props.map.projection} />
                    <FeatureInfoFormatSelector
                        key="featureinfoformat"
                        onInfoFormatChange={props.changeMapInfoFormat}
                        inputProps={{
                            label: <Message msgId="infoFormatLbl" />
                        }}
                        infoFormat={props.mapInfo.infoFormat}/>
                    <HistoryBar
                        key="history"
                        undoBtnProps={{
                            onClick: props.undo,
                            label: <Message msgId="history.undoBtnTooltip"/>,
                            disabled: (props.mapHistory.past.length > 0) ? false : true
                        }}
                        redoBtnProps={{
                            onClick: props.redo,
                            label: <Message msgId="history.redoBtnTooltip" />,
                            disabled: (props.mapHistory.future.length > 0) ? false : true
                    }}/>
                </Settings>
                <HelpToggleBtn
                    key="help"
                    pressed={props.help.enabled}
                    changeHelpState={props.changeHelpState}
                    changeHelpwinVisibility={props.changeHelpwinVisibility}/>
            </MapToolBar>,
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
            <MousePosition
                key="mousePosition"
                enabled={props.mousePositionEnabled}
                mousePosition={props.mousePosition}
                crs={(props.mousePositionCrs) ? props.mousePositionCrs : props.map.projection}/>,
            <HelpWrapper
                key="scalebox-help"
                helpText={<Message msgId="helptexts.scaleBox"/>}
                helpEnabled={props.help.enabled}
                changeHelpText={props.changeHelpText}
                changeHelpwinVisibility={props.changeHelpwinVisibility}
                >
                <ScaleBox
                    key="scaleBox"
                    onChange={props.changeZoomLevel}
                    currentZoomLvl={props.map.zoom} />
            </HelpWrapper>,
            <HelpWrapper
                key="zoomall-help"
                helpText={<Message msgId="helptexts.zoomToMaxExtentButton"/>}
                helpEnabled={props.help.enabled}
                changeHelpText={props.changeHelpText}
                changeHelpwinVisibility={props.changeHelpwinVisibility}
                >
                <ZoomToMaxExtentButton
                    key="zoomToMaxExtent"
                    mapConfig={props.map}
                    actions={{
                        changeMapView: props.changeMapView
                    }}
                />
            </HelpWrapper>,
            <GlobalSpinner key="globalSpinner"/>,
            <HelpTextPanel
                key="helpTextPanel"
                isVisible={props.help.helpwinViz}
                helpText={props.help.helpText}/>
        ];
    },
    reducers: {mapInfo, floatingPanel, mousePosition, measurement, searchResults, locate, help},
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
        layerLoading,
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
