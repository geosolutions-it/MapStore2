var PropTypes = require('prop-types');
var React = require('react');
var ol = require('openlayers');
var Layers = require('../../../utils/openlayers/Layers');
var assign = require('object-assign');

require('./overview.css');

const defaultOpt = {
    className: 'ol-overviewmap ol-custom-overviewmap',
    collapseLabel: '\u00BB',
    label: '\u00AB',
    collapsed: true,
    collapsible: true
};

class Overview extends React.Component {
    static displayName = 'Overview';

    static propTypes = {
        id: PropTypes.string,
        map: PropTypes.object,
        overviewOpt: PropTypes.object,
        layers: PropTypes.array
    };

    static defaultProps = {
        id: 'overview',
        overviewOpt: {},
        layers: [{type: 'osm', options: {}}]
    };

    componentDidMount() {
        let olLayers = [];
        this.props.layers.forEach((layerOpt) => {
            olLayers.push(Layers.createLayer(layerOpt.type, layerOpt.options || {}));
        });
        let opt = assign({}, defaultOpt, this.props.overviewOpt, {layers: olLayers});
        this.overview = new ol.control.OverviewMap(opt);
        if (this.props.map) {
            this.overview.setMap(this.props.map);
        }
        this.box = this.overview.element.getElementsByClassName("ol-overviewmap-box").item(0);
        this.box.onmousedown = (e) => {
            this.dragstart(e);

            this.box.onmousemove = (ev) => {
                this.draggingel(ev);
            };
            this.overview.element.onmousemove = (ev) => {
                this.draggingel(ev);
            };
            this.box.onmouseup = () => {
                this.dragend();
                this.overview.element.onmousemove = null;
                this.box.onmousemove = null;
                this.box.onmouseup = null;
            };
        };
    }

    render() {
        return null;
    }

    dragstart = (e) => {
        if (!this.dragging) {
            this.dragBox = this.box.cloneNode();
            this.dragBox.setAttribute("class", "ol-overview-dargbox");
            this.dragBox.style.position = "relative";
            this.box.appendChild(this.dragBox);
            if (this.box.style.top === "") {
                this.offsetStartTop = 0;
            } else {
                this.offsetStartTop = parseInt(this.box.style.top.slice(0, -2), 10);
            }
            if (this.box.style.left === "") {
                this.offsetStartLeft = 0;
            } else {
                this.offsetStartLeft = parseInt(this.box.style.left.slice(0, -2), 10);
            }
            this.mouseStartTop = e.pageY;
            this.mouseStartLeft = e.pageX;
            this.dragging = true;
        }
    };

    draggingel = (e) => {
        if (this.dragging === true) {
            this.dragBox.style.top = this.offsetStartTop + e.pageY - this.mouseStartTop + 'px';
            this.dragBox.style.left = this.offsetStartLeft + e.pageX - this.mouseStartLeft + 'px';
            e.stopPropagation();
            e.preventDefault();
        }
    };

    dragend = () => {
        if (this.dragging === true) {
            let offset = {};
            offset.top = this.dragBox.style.top === "" ? 0 : parseInt(this.dragBox.style.top.slice(0, -2), 10);
            offset.left = this.dragBox.style.left === "" ? 0 : parseInt(this.dragBox.style.left.slice(0, -2), 10);
            this.box.removeChild(this.dragBox);
            delete this.dragBox;
            this.dragging = false;
            this.setNewExtent(offset);
        }
    };

    setNewExtent = (offset) => {
        let vWidth = this.box.offsetWidth;
        let vHeight = this.box.offsetHeight;
        let mapSize = this.props.map.getSize();
        let xMove = offset.left * Math.abs(mapSize[0] / vWidth);
        let yMove = offset.top * Math.abs(mapSize[1] / vHeight);
        let bottomLeft = [0 + xMove, mapSize[1] + yMove];
        let topRight = [mapSize[0] + xMove, 0 + yMove];
        let left = this.props.map.getCoordinateFromPixel(bottomLeft);
        let top = this.props.map.getCoordinateFromPixel(topRight);
        let extent = [left[0], left[1], top[0], top[1]];
        this.props.map.getView().fit(extent, mapSize, {nearest: true});
    };
}

module.exports = Overview;
