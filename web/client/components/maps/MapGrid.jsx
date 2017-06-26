const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Grid, Row, Col} = require('react-bootstrap');
const MapCard = require('./MapCard');
const Spinner = require('react-spinkit');

class MapGrid extends React.Component {
    static propTypes = {
        panelProps: PropTypes.object,
        bottom: PropTypes.node,
        loading: PropTypes.bool,
        maps: PropTypes.array,
        currentMap: PropTypes.object,
        fluid: PropTypes.bool,
        viewerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        mapType: PropTypes.string,
        colProps: PropTypes.object,
        // CALLBACKS
        updateMapMetadata: PropTypes.func,
        editMap: PropTypes.func,
        saveAll: PropTypes.func,
        saveMap: PropTypes.func,
        onDisplayMetadataEdit: PropTypes.func,
        removeThumbnail: PropTypes.func,
        errorCurrentMap: PropTypes.func,
        updateCurrentMap: PropTypes.func,
        createThumbnail: PropTypes.func,
        deleteThumbnail: PropTypes.func,
        deleteMap: PropTypes.func,
        resetCurrentMap: PropTypes.func,
        updatePermissions: PropTypes.func,
        metadataModal: PropTypes.func
    };

    static defaultProps = {
        mapType: 'leaflet',
        bottom: "",
        fluid: true,
        colProps: {
            xs: 12,
            sm: 6,
            style: {
                "marginBottom": "20px"
            }
        },
        currentMap: {},
        maps: [],
        // CALLBACKS
        onChangeMapType: function() {},
        updateMapMetadata: () => {},
        createThumbnail: () => {},
        deleteThumbnail: () => {},
        errorCurrentMap: () => {},
        saveAll: () => {},
        onDisplayMetadataEdit: () => {},
        updateCurrentMap: () => {},
        deleteMap: () => {},
        saveMap: () => {},
        removeThumbnail: () => {},
        editMap: () => {},
        resetCurrentMap: () => {},
        updatePermissions: () => {},
        groups: []
    };

    renderMaps = (maps, mapType) => {
        const viewerUrl = this.props.viewerUrl;
        return maps.map((map) => {
            let children = React.Children.count(this.props.children);
            return children === 1 ?
                React.cloneElement(React.Children.only(this.props.children), {viewerUrl, key: map.id, mapType, map}) :
                <Col key={map.id} {...this.props.colProps}>
                    <MapCard viewerUrl={viewerUrl} mapType={mapType}
                        map={map}
                        onEdit={this.props.editMap}
                        onMapDelete={this.props.deleteMap}/>
                </Col>;
        });
    };

    renderLoading = () => {
        return <div style={{width: "100px", overflow: "visible", margin: "auto"}}>Loading...<Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/></div>;
    };

    renderMetadataModal = () => {
        if (this.props.metadataModal) {
            let MetadataModal = this.props.metadataModal;
            return (<MetadataModal key="metadataModal" ref="metadataModal" show={this.props.currentMap && this.props.currentMap.displayMetadataEdit} onHide={this.props.resetCurrentMap}
                onClose={this.props.resetCurrentMap}
                map={this.props.currentMap}
                onSaveAll={this.props.saveAll}
                onSave={this.props.saveMap}
                onRemoveThumbnail={this.props.removeThumbnail}
                onDeleteThumbnail={this.props.deleteThumbnail}
                onCreateThumbnail={this.props.createThumbnail}
                onErrorCurrentMap={this.props.errorCurrentMap}
                onUpdateCurrentMap={this.props.updateCurrentMap}/>);
        }
    };

    render() {
        return (
                <Grid id="mapstore-maps-grid" fluid={this.props.fluid}>
                    <Row>
                        {this.props.loading && this.props.maps.length === 0 ? this.renderLoading() : this.renderMaps(this.props.maps || [], this.props.mapType)}
                    </Row>
                    <Row>
                        {this.props.bottom}
                    </Row>
                    {this.renderMetadataModal()}
                </Grid>
        );
    }
}

module.exports = MapGrid;
