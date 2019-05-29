/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const PropTypes = require('prop-types');
const React = require('react');

const Message = require('../locale/Message');

const {ShapeFileUploadAndStyle, StylePolygon, StylePolyline, StylePoint} = require('./index');

const {Glyphicon, Panel} = require('react-bootstrap');

const Dialog = require('../../components/misc/Dialog');

require('./css/shapeFile.css');

class ShapeFile extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        layers: PropTypes.array,
        selected: PropTypes.object,
        style: PropTypes.object,
        shapeStyle: PropTypes.object,
        onShapeError: PropTypes.func,
        onShapeChoosen: PropTypes.func,
        addShapeLayer: PropTypes.func,
        shapeLoading: PropTypes.func,
        onSelectLayer: PropTypes.func,
        onLayerAdded: PropTypes.func,
        error: PropTypes.string,
        mapType: PropTypes.string,
        wrap: PropTypes.bool,
        wrapWithPanel: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        visible: PropTypes.bool,
        toggleControl: PropTypes.func,
        closeGlyph: PropTypes.string,
        buttonSize: PropTypes.string
    };

    static defaultProps = {
        id: "mapstore-shapefile-upload",
        wrap: true,
        wrapWithPanel: false,
        panelStyle: {
            minWidth: "360px",
            zIndex: 100,
            position: "absolute",
            overflow: "visible",
            top: "100px",
            left: "calc(50% - 150px)"
        },
        panelClassName: "toolbar-panel",
        visible: false,
        toggleControl: () => {},
        closeGlyph: "1-close",
        buttonSize: "small"
    };

    render() {
        const stylers = {
            Polygon: <StylePolygon/>,
            MultiPolygon: <StylePolygon/>,
            GeometryCollection: <StylePolygon/>,
            LineString: <StylePolyline/>,
            MultiLineString: <StylePolyline/>,
            MultiPoint: <StylePoint/>,
            Point: <StylePoint/>
        };
        const panel = (<ShapeFileUploadAndStyle role="body" {...this.props} stylers={stylers}
            uploadMessage={<Message msgId="shapefile.placeholder"/>}
            cancelMessage={<Message msgId="shapefile.cancel"/>}
            addMessage={<Message msgId="shapefile.add"/>}
            />);

        if (this.props.wrap) {
            if (this.props.visible) {
                if (this.props.wrapWithPanel) {
                    return (<Panel id={this.props.id} header={<span><span className="shapefile-panel-title"><Message msgId="shapefile.title"/></span><span className="shapefile-panel-close panel-close" onClick={this.props.toggleControl}></span></span>} style={this.props.panelStyle} className={this.props.panelClassName}>
                        {panel}
                    </Panel>);
                }
                return (<Dialog id={this.props.id} style={this.props.panelStyle} className={this.props.panelClassName}>
                    <span role="header">
                        <span className="shapefile-panel-title"><Message msgId="shapefile.title"/></span>
                        <button onClick={this.props.toggleControl} className="shapefile-panel-close close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>�</span>}</button>
                    </span>
                    {panel}
                </Dialog>);
            }
            return null;
        }
        return panel;
    }
}

module.exports = ShapeFile;
