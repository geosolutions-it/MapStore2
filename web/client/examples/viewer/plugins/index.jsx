var About = require('../components/About');
// var LangSelector = require('../../../components/I18N/LangSelector');
var LangBar = require('../../../components/I18N/LangBar');
var {Message} = require('../../../components/I18N/I18N');

var ToggleButton = require('../../../components/buttons/ToggleButton');
var BackgroundSwitcher = require("../../../components/BackgroundSwitcher/BackgroundSwitcher");
var LayerTree = require('../components/LayerTree');
var MapToolBar = require("../components/MapToolBar");
var Settings = require("../components/Settings");
var GetFeatureInfo = require("../components/GetFeatureInfo");
var MousePosition = require("../../../components/mapcontrols/mouseposition/MousePosition");
var CRSSelector = require("../../../components/mapcontrols/mouseposition/CRSSelector");
var ScaleBox = require("../../../components/ScaleBox/ScaleBox");
var GlobalSpinner = require('../../../components/spinners/GlobalSpinner/GlobalSpinner');
var ZoomToMaxExtentButton = require('../../../components/buttons/ZoomToMaxExtentButton');

var mapInfo = require('../../../reducers/mapInfo');
var floatingPanel = require('../reducers/floatingPanel');
var layers = require('../reducers/layers');
var mousePosition = require('../../../reducers/mousePosition');

var {getFeatureInfo, changeMapInfoState, purgeMapInfoResults} = require('../../../actions/mapInfo');
var {activatePanel} = require('../actions/floatingPanel');
var {changeMousePosition, changeMousePositionCrs, changeMousePositionState} = require('../../../actions/mousePosition');

var {changeLayerProperties} = require('../../../actions/config');
var {changeZoomLevel} = require('../../../actions/map');

var {layerLoading, layerLoad} = require('../../../actions/map');
var {changeMapView} = require('../../../actions/map');
var {toggleNode} = require('../actions/layers');

var React = require('react');

module.exports = {
    components: (props) => {
        return [
            <About style={{
                    position: "absolute",
                        zIndex: 1000,
                        bottom: "-8px",
                        right: "0px",
                        margin: "8px"
                    }} key="about"/>,
            <MapToolBar
                layers={props.mapConfig.layers}
                propertiesChangeHandler={props.changeLayerProperties}
                activeKey={props.floatingPanel.activeKey}
                onActivateItem={props.activatePanel}
                mapInfo={props.mapInfo}
                changeMapInfoState={props.changeMapInfoState}>
                <ToggleButton
                    isButton={true}
                    pressed={props.mapInfo.enabled}
                    glyphicon="info-sign"
                    onClick={props.changeMapInfoState}/>
                <LayerTree
                    key="layerSwitcher"
                    isPanel={true}
                    buttonTooltip={<Message msgId="layers"/>}
                    title={<Message msgId="layers"/>}
                    loadingList={props.mapConfig.loadingLayers}
                    groups={props.mapConfig.groups}
                    propertiesChangeHandler={props.changeLayerProperties}
                    onToggleGroup={(group, status) => props.toggleNode(group, 'groups', status)}
                    onToggleLayer={(layer, status) => props.toggleNode(layer, 'layers', status)}
                    />
                <BackgroundSwitcher
                    key="backgroundSwitcher"
                    isPanel={true}
                    layers={props.mapConfig.layers}
                    title={<div><Message msgId="background"/></div>}
                    buttonTooltip={<Message msgId="backgroundSwither.tooltip"/>}
                    propertiesChangeHandler={props.changeLayerProperties}/>
                <Settings
                    isPanel={true}
                    buttonTooltip={<Message msgId="settings" />}>
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
                        crs={(props.mousePositionCrs) ? props.mousePositionCrs : props.mapConfig.projection} />
                </Settings>
            </MapToolBar>,
            <GetFeatureInfo
                key="getFeatureInfo"
                enabled={props.mapInfo.enabled}
                htmlResponses={props.mapInfo.responses}
                htmlRequests={props.mapInfo.requests}
                mapConfig={props.mapConfig}
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
                crs={(props.mousePositionCrs) ? props.mousePositionCrs : props.mapConfig.projection}/>,
            <ScaleBox
                onChange={props.changeZoomLevel}
                currentZoomLvl={props.mapConfig.zoom} />,
            <GlobalSpinner loadingLayers={props.mapConfig.loadingLayers}/>,
            <ZoomToMaxExtentButton
                key="zoomToMaxExtent"
                mapConfig={props.mapConfig}
                actions={{
                    changeMapView: props.changeMapView
                }} />
        ];
    },
    reducers: {mapInfo, floatingPanel, mousePosition, layers},
    actions: {
        getFeatureInfo,
        changeMapInfoState,
        purgeMapInfoResults,
        activatePanel,
        changeLayerProperties,
        changeMousePositionState,
        changeMousePositionCrs,
        changeMousePosition,
        changeZoomLevel,
        layerLoading,
        layerLoad,
        changeMapView,
        toggleNode
    }
};
