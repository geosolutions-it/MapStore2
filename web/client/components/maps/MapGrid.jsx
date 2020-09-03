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
        user: PropTypes.object,
        fluid: PropTypes.bool,
        showAPIShare: PropTypes.bool,
        viewerUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        mapType: PropTypes.string,
        colProps: PropTypes.object,
        // CALLBACKS
        editMap: PropTypes.func,
        onDisplayMetadataEdit: PropTypes.func,
        deleteMap: PropTypes.func,
        onShare: PropTypes.func,
        resetCurrentMap: PropTypes.func,
        metadataModal: PropTypes.func,
        onUpdateAttribute: PropTypes.func,
        onSaveSuccess: PropTypes.func,
        onSaveError: PropTypes.func,
        onMapSaved: PropTypes.func,
        onShowDetailsSheet: PropTypes.func,
        onHideDetailsSheet: PropTypes.func,
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
        onDisplayMetadataEdit: () => {},
        deleteMap: () => {},
        onShare: () => {},
        editMap: () => {},
        resetCurrentMap: () => {},
        groups: [],
        onUpdateAttribute: () => {},
        onSaveSuccess: () => {},
        onSaveError: () => {},
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
                        onMapDelete={this.props.deleteMap}
                        onShare={this.props.onShare}
                        showAPIShare={this.props.showAPIShare}
                        onShowDetailsSheet={this.props.onShowDetailsSheet}
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
            return (<MetadataModal key="metadataModal"
                user={this.props.user}
                clickOutEnabled={false}
                category={this.props.currentMap?.category?.name || 'MAP'}
                enableDetails={this.props.currentMap?.category?.name === 'MAP'}
                show={this.props.currentMap && this.props.currentMap.displayMetadataEdit}
                showReadOnlyDetailsSheet={this.props.currentMap?.showDetailsSheet}
                onCloseReadOnlyDetailsSheet={this.props.onHideDetailsSheet}
                resource={this.props.currentMap}
                onSaveSuccess={() => {
                    this.props.onSaveSuccess();
                    this.props.onMapSaved();
                }}
                onSaveError={() => {
                    this.props.onSaveError();
                    this.props.onMapSaved(this.props.currentMap?.id);
                }}
                onClose={() => {
                    this.props.onDisplayMetadataEdit(false);
                    this.props.resetCurrentMap();
                }}/>);
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
