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

const {StylePolygon, StylePolyline, StylePoint} = require('./index');
const StylePanel = require('../../components/import/style/StylePanel');

const Dialog = require('../../components/misc/StandardDialog');

class StyleDialog extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        layers: PropTypes.array,
        selected: PropTypes.object,
        style: PropTypes.object,
        shapeStyle: PropTypes.object,
        onError: PropTypes.func,
        setLayers: PropTypes.func,
        addShapeLayer: PropTypes.func,
        onSelectLayer: PropTypes.func,
        onLayerAdded: PropTypes.func,
        error: PropTypes.string,
        mapType: PropTypes.string,
        wrap: PropTypes.bool,
        wrapWithPanel: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        visible: PropTypes.bool,
        modal: PropTypes.bool,
        onClose: PropTypes.func,
        closeGlyph: PropTypes.string,
        uploadMessage: PropTypes.string,
        buttonSize: PropTypes.string
    };

    static defaultProps = {
        id: "mapstore-shapefile-upload",
        uploadMessage: "shapefile.placeholder",
        wrap: true,
        modal: true,
        wrapWithPanel: false,
        panelStyle: {
            minWidth: "360px",
            zIndex: 1995,
            position: "absolute",
            overflow: "visible",
            top: "30px",
            left: "calc(50% - 150px)"
        },
        panelClassName: "toolbar-panel",
        visible: false,
        onClose: () => {},
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
        const panel = (<StylePanel
            {...this.props}
            setLayers={this.props.setLayers}
            stylers={stylers}
            uploadMessage={<Message msgId={this.props.uploadMessage}/>}
            cancelMessage={<Message msgId="shapefile.cancel"/>}
            nextMessage={<Message msgId="shapefile.next"/>}
            finishMessage={<Message msgId="shapefile.finish"/>}
            skipMessage={<Message msgId="shapefile.skip"/>}
        />);


        if (this.props.layers) {
            return (<Dialog
                id="import-style-dialog"
                onClose={this.props.onClose}
                modal={this.props.modal} show header={<Message msgId="shapefile.title" />}>
                {panel}
            </Dialog>);
        }
        return panel;
    }
}

module.exports = StyleDialog;
