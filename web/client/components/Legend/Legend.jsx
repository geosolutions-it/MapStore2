const urlUtil = require('url');
const React = require('react');
var Legend = React.createClass({
    propTypes: {
        layer: React.PropTypes.object,
        legendHeigth: React.PropTypes.number,
        legendWidth: React.PropTypes.number,
        legendOptions: React.PropTypes.string
    },
    getDefaultProps() {
        return {
            legendHeigth: 12,
            legendWidth: 12,
            legendOptions: "forceLabels:on;fontSize:10"
        };
    },
   render() {
       if (this.props.layer && this.props.layer.type === "wms" && this.props.layer.url) {
           let layer = this.props.layer;
           let url = this.props.layer.url;
           let urlObj = urlUtil.parse(url);
           let legendUrl = urlUtil.format({
               host: urlObj.host,
               protocol: urlObj.protocol,
               pathname: urlObj.pathname,
               query: {
                   service: "WMS",
                   request: "GetLegendGraphic",
                   format: "image/png",
                   height: this.props.legendHeigth,
                   width: this.props.legendWidth,
                   layer: layer.name,
                   style: layer.style || null,
                   LEGEND_OPTIONS: this.props.legendOptions
              // SCALE TODO
               }
           });
           return <img src={legendUrl} style={{maxWidth: "100%"}}/>;
       }
       return null;
   }
});
module.exports = Legend;
