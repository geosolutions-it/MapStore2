const urlUtil = require('url');
const PropTypes = require('prop-types');
const React = require('react');
const {isArray} = require('lodash');

const Message = require('../../../I18N/Message');
const SecurityUtils = require('../../../../utils/SecurityUtils');

const assign = require('object-assign');

class Legend extends React.Component {
    static propTypes = {
        layer: PropTypes.object,
        legendHeight: PropTypes.number,
        legendWidth: PropTypes.number,
        legendOptions: PropTypes.string,
        style: PropTypes.object,
        currentZoomLvl: PropTypes.number,
        scales: PropTypes.array,
        scaleDependent: PropTypes.bool,
        language: PropTypes.string
    };

    static defaultProps = {
        legendHeight: 12,
        legendWidth: 12,
        legendOptions: "forceLabels:on",
        style: {maxWidth: "100%"},
        scaleDependent: true
    };
    state = {
        error: false
    }
    UNSAFE_componentWillReceiveProps(nProps) {
        if ( this.state.error && this.getUrl(nProps, 0) !== this.getUrl(this.props, 0)) {
            this.setState(() => ({error: false}));
        }
    }
    onImgError = () => {
        this.setState(() => ({error: true}));
    }
    getUrl = (props, urlIdx) => {
        if (props.layer && props.layer.type === "wms" && props.layer.url) {
            const layer = props.layer;
            const idx = urlIdx || isArray(layer.url) && Math.floor(Math.random() * layer.url.length);

            const url = isArray(layer.url) ?
                layer.url[idx] :
                layer.url.replace(/[?].*$/g, '');

            let urlObj = urlUtil.parse(url);

            const cleanParams = SecurityUtils.clearNilValuesForParams(layer.params);
            let query = assign({}, {
                service: "WMS",
                request: "GetLegendGraphic",
                format: "image/png",
                height: props.legendHeight,
                width: props.legendWidth,
                layer: layer.name,
                style: layer.style || null,
                version: layer.version || "1.3.0",
                SLD_VERSION: "1.1.0",
                LEGEND_OPTIONS: props.legendOptions
            }, layer.legendParams || {},
            props.language && layer.localizedLayerStyles ? {LANGUAGE: props.language} : {},
            SecurityUtils.addAuthenticationToSLD(cleanParams || {}, props.layer),
            cleanParams && cleanParams.SLD_BODY ? {SLD_BODY: cleanParams.SLD_BODY} : {},
            props.scales && props.currentZoomLvl && props.scaleDependent ? {SCALE: Math.round(props.scales[props.currentZoomLvl])} : {});
            SecurityUtils.addAuthenticationParameter(url, query);

            return urlUtil.format({
                host: urlObj.host,
                protocol: urlObj.protocol,
                pathname: urlObj.pathname,
                query: query
            });
        }
        return '';
    }
    render() {
        if (!this.state.error && this.props.layer && this.props.layer.type === "wms" && this.props.layer.url) {
            return <img onError={this.onImgError} onLoad={(e) => this.validateImg(e.target)} src={this.getUrl(this.props)} style={this.props.style}/>;
        }
        return <Message msgId="layerProperties.legenderror" />;
    }
    validateImg = (img) => {
        // GeoServer response is a 1x2 px size when legend is not available.
        // In this case we need to show the "Legend Not available" message
        if (img.height <= 1 && img.width <= 2) {
            this.onImgError();
        }
    }
}

module.exports = Legend;
