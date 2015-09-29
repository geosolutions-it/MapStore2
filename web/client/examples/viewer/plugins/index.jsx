var About = require('../components/About');
var LangSelector = require('../../../components/I18N/LangSelector');
var BackgroundSwitcherTool = require("../components/BackgroundSwitcherTool");
var ViewerFloatingPanel = require("../components/ViewerFloatingPanel");
var GetFeatureInfo = require("../components/GetFeatureInfo");

var mapInfo = require('../../../reducers/mapInfo');
var floatingPanel = require('../reducers/floatingPanel');


var {getFeatureInfo, changeMapInfoState, purgeMapInfoResults} = require('../../../actions/mapInfo');
var {activatePanel} = require('../actions/floatingPanel');

var {changeLayerProperties} = require('../../../actions/config');


var React = require('react');

module.exports = {
    components: (props) => {
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
    },
    reducers: {mapInfo, floatingPanel},
    actions: {
        getFeatureInfo,
        changeMapInfoState,
        purgeMapInfoResults,
        activatePanel,
        changeLayerProperties
    }
};
