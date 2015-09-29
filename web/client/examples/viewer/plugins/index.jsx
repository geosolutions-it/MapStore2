var About = require('../components/About');
var LangSelector = require('../../../components/I18N/LangSelector');
var BackgroundSwitcherTool = require("../components/BackgroundSwitcherTool");
var ViewerFloatingPanel = require("../components/ViewerFloatingPanel");
var GetFeatureInfo = require("../components/GetFeatureInfo");
var React = require('react');

module.exports = (props) => {
    return [
        <About key="about"/>,
        <LangSelector key="langSelector" currentLocale={props.locale} onLanguageChange={props.loadLocale}/>,
        <ViewerFloatingPanel key="floatingPanel"
            layers={props.mapConfig.layers}
            propertiesChangeHandler={props.changeLayerProperties}
            activeKey={props.floatingPanel.activeKey}
            onActivateItem={props.activatePanel}/>,
        <BackgroundSwitcherTool key="backgroundSwitcher" layers={props.mapConfig.layers} propertiesChangeHandler={props.changeLayerProperties}/>,
        <GetFeatureInfo
            key="getFeatureInfo"
            enabled={props.mapInfo.enabled}
            htmlResponses={props.mapInfo.responses}
            btnIcon="info-sign"
            mapConfig={props.mapConfig}
            actions={{
                getFeatureInfo: props.getFeatureInfo,
                changeMapInfoState: props.changeMapInfoState,
                purgeMapInfoResults: props.purgeMapInfoResults,
                changeMousePointer: props.changeMousePointer
            }}
            clickedMapPoint={props.mapInfo.clickPoint}
        />
    ];
};
