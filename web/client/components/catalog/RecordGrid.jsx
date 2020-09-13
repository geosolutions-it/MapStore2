/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {Grid, Row, Col} = require('react-bootstrap');

const RecordItem = require('./RecordItem').default;

class RecordGrid extends React.Component {
    static propTypes = {
        crs: PropTypes.string,
        recordItem: PropTypes.element,
        catalogURL: PropTypes.string,
        catalogType: PropTypes.string,
        zoomToLayer: PropTypes.bool,
        onLayerAdd: PropTypes.func,
        onPropertiesChange: PropTypes.func,
        onError: PropTypes.func,
        records: PropTypes.array,
        authkeyParamNames: PropTypes.array,
        style: PropTypes.object,
        showGetCapLinks: PropTypes.bool,
        addAuthentication: PropTypes.bool,
        column: PropTypes.object,
        currentLocale: PropTypes.string,
        hideThumbnail: PropTypes.bool,
        hideIdentifier: PropTypes.bool,
        hideExpand: PropTypes.bool,
        source: PropTypes.string,
        onAddBackgroundProperties: PropTypes.func,
        modalParams: PropTypes.object,
        layers: PropTypes.object,
        clearModal: PropTypes.func,
        onAddBackground: PropTypes.func,
        showTemplate: PropTypes.bool,
        service: PropTypes.object,
        defaultFormat: PropTypes.string,
        formatOptions: PropTypes.array,
        layerBaseConfig: PropTypes.object
    };

    static defaultProps = {
        column: {xs: 12},
        currentLocale: 'en-US',
        onLayerAdd: () => {},
        onPropertiesChange: () => {},
        onError: () => {},
        records: [],
        zoomToLayer: true,
        layerBaseConfig: {},
        crs: "EPSG:3857"
    };

    renderRecordItem = (record) => {
        let Item = this.props.recordItem || RecordItem;
        return (
            <Col {...this.props.column} key={record.identifier}>
                <Item
                    crs={this.props.crs}
                    clearModal={this.props.clearModal}
                    layers={this.props.layers}
                    modalParams={this.props.modalParams}
                    onAddBackgroundProperties={this.props.onAddBackgroundProperties}
                    onAddBackground={this.props.onAddBackground}
                    source={this.props.source}
                    onLayerAdd={this.props.onLayerAdd}
                    onPropertiesChange={this.props.onPropertiesChange}
                    zoomToLayer={this.props.zoomToLayer}
                    hideThumbnail={this.props.hideThumbnail}
                    hideIdentifier={this.props.hideIdentifier}
                    hideExpand={this.props.hideExpand}
                    onError={this.props.onError}
                    catalogURL={this.props.catalogURL}
                    catalogType={this.props.catalogType}
                    service={this.props.service}
                    showTemplate={this.props.showTemplate}
                    record={record}
                    authkeyParamNames={this.props.authkeyParamNames}
                    style={{height: "215px", maxHeight: "215px"}}
                    showGetCapLinks={this.props.showGetCapLinks}
                    addAuthentication={this.props.addAuthentication}
                    currentLocale={this.props.currentLocale}
                    defaultFormat={this.props.defaultFormat}
                    formatOptions={this.props.formatOptions}
                    layerBaseConfig={this.props.layerBaseConfig}
                />
            </Col>
        );
    };

    render() {
        if (this.props.records) {
            let mapsList = this.props.records instanceof Array ? this.props.records : [this.props.records];
            return (
                <Grid className="record-grid" fluid style={this.props.style}>
                    <Row>
                        {mapsList.map(this.renderRecordItem)}
                    </Row>
                </Grid>
            );
        }

        return null;
    }
}

module.exports = RecordGrid;
