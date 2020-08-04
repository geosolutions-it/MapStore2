/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {Grid, Row, Col} = require('react-bootstrap');
const MapCard = require('./MapCard');
const Spinner = require('react-spinkit');

class MapGrid extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        panelProps: PropTypes.object,
        bottom: PropTypes.node,
        loading: PropTypes.bool,
        showMapDetails: PropTypes.bool,
        maps: PropTypes.array,
        currentMap: PropTypes.object,
        fluid: PropTypes.bool,
        showAPIShare: PropTypes.bool,
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
        detailsSheetActions: PropTypes.object,
        createThumbnail: PropTypes.func,
        deleteThumbnail: PropTypes.func,
        deleteMap: PropTypes.func,
        onShare: PropTypes.func,
        resetCurrentMap: PropTypes.func,
        updatePermissions: PropTypes.func,
        metadataModal: PropTypes.func,
        onUpdateAttribute: PropTypes.func,
        title: PropTypes.node,
        className: PropTypes.string,
        style: PropTypes.object
    };

    static defaultProps = {
        id: "mapstore-maps-grid",
        mapType: 'leaflet',
        bottom: "",
        fluid: true,
        showAPIShare: true,
        colProps: {
            xs: 12,
            sm: 6
        },
        currentMap: {},
        maps: [],
        // CALLBACKS
        onChangeMapType: function() {},
        updateMapMetadata: () => {},
        detailsSheetActions: {
            onBackDetails: () => {},
            onUndoDetails: () => {},
            onToggleDetailsSheet: () => {},
            onToggleGroupProperties: () => {},
            onToggleUnsavedChangesModal: () => {},
            onsetDetailsChanged: () => {},
            onUpdateDetails: () => {},
            onDeleteDetails: () => {},
            onSaveDetails: () => {}
        },
        createThumbnail: () => {},
        deleteThumbnail: () => {},
        errorCurrentMap: () => {},
        saveAll: () => {},
        onDisplayMetadataEdit: () => {},
        updateCurrentMap: () => {},
        deleteMap: () => {},
        onShare: () => {},
        saveMap: () => {},
        removeThumbnail: () => {},
        editMap: () => {},
        resetCurrentMap: () => {},
        updatePermissions: () => {},
        groups: [],
        onUpdateAttribute: () => {},
        className: '',
        style: {}
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
                        showMapDetails={this.props.showMapDetails}
                        detailsSheetActions={this.props.detailsSheetActions}
                        onMapDelete={this.props.deleteMap}
                        onShare={this.props.onShare}
                        showAPIShare={this.props.showAPIShare}
                        onUpdateAttribute={this.props.onUpdateAttribute}/>
                </Col>;
        });
    };

    renderLoading = () => {
        return <div style={{width: "100px", overflow: "visible", margin: "auto"}}>Loading...<Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/></div>;
    };

    renderMetadataModal = () => {
        if (this.props.metadataModal) {
            let MetadataModal = this.props.metadataModal;
            return (<MetadataModal key="metadataModal" ref="metadataModal" show={this.props.currentMap && this.props.currentMap.displayMetadataEdit}
                map={this.props.currentMap}
                onSaveAll={this.props.saveAll}
                onSave={this.props.saveMap}
                onResetCurrentMap={this.props.resetCurrentMap}
                onRemoveThumbnail={this.props.removeThumbnail}
                onDisplayMetadataEdit={this.props.onDisplayMetadataEdit}
                onDeleteThumbnail={this.props.deleteThumbnail}
                detailsSheetActions={this.props.detailsSheetActions}
                onCreateThumbnail={this.props.createThumbnail}
                onErrorCurrentMap={this.props.errorCurrentMap}
                onUpdateCurrentMap={this.props.updateCurrentMap}/>);
        }
        return null;
    };

    render() {
        return (
            <Grid id={this.props.id} fluid={this.props.fluid} className={'ms-grid-container ' + this.props.className} style={this.props.style}>
                {this.props.title && <Row>
                    {this.props.title}
                </Row>}
                <Row className="ms-grid">
                    {this.props.loading && this.props.maps.length === 0 ? this.renderLoading() : this.renderMaps(this.props.maps || [], this.props.mapType)}
                </Row>
                {this.props.bottom}
                {this.renderMetadataModal()}
            </Grid>
        );
    }
}

module.exports = MapGrid;
