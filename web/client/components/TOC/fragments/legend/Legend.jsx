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
        legendHeigth: PropTypes.number,
        legendWidth: PropTypes.number,
        legendOptions: PropTypes.string,
        style: PropTypes.object,
        currentZoomLvl: PropTypes.number,
        scales: PropTypes.array
    };

    static defaultProps = {
        legendHeigth: 12,
        legendWidth: 12,
        legendOptions: "forceLabels:on;fontSize:10",
        style: {maxWidth: "100%"}
    };
    state = {
        error: false
    }
    componentWillReceiveProps() {
        if (this.state.error) {
            this.setState(() => ({error: false}));
        }
    }
    onImgError = () => {
        this.setState(() => ({error: true}));
    }
    render() {
        if (!this.state.error && this.props.layer && this.props.layer.type === "wms" && this.props.layer.url) {
            let layer = this.props.layer;
            const url = isArray(layer.url) ?
                layer.url[Math.floor(Math.random() * layer.url.length)] :
                layer.url.replace(/[?].*$/g, '');

            let urlObj = urlUtil.parse(url);
            let query = assign({}, {
                service: "WMS",
                request: "GetLegendGraphic",
                format: "image/png",
                height: this.props.legendHeigth,
                width: this.props.legendWidth,
                layer: layer.name,
                style: layer.style || null,
                version: layer.version || "1.3.0",
                SLD_VERSION: "1.1.0",
                LEGEND_OPTIONS: this.props.legendOptions
            }, layer.legendParams || {},
            layer.params || {},
            layer.params && layer.params.SLD_BODY ? {SLD_BODY: layer.params.SLD_BODY} : {},
            this.props.scales && this.props.currentZoomLvl ? {SCALE: Math.round(this.props.scales[this.props.currentZoomLvl])} : {});
            SecurityUtils.addAuthenticationParameter(url, query);

            let legendUrl = urlUtil.format({
                host: urlObj.host,
                protocol: urlObj.protocol,
                pathname: urlObj.pathname,
                query: query
            });
            return <img onError={this.onImgError} src={legendUrl} style={this.props.style}/>;
        }
        return <Message msgId="layerProperties.legenderror" />;
    }
}

module.exports = Legend;
