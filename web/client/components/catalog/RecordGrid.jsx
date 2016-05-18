/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Grid, Row, Col} = require('react-bootstrap');

const RecordItem = require('./RecordItem');


const RecordGrid = React.createClass({
    propTypes: {
        catalogURL: React.PropTypes.string,
        onZoomToExtent: React.PropTypes.func,
        onLayerAdd: React.PropTypes.func,
        records: React.PropTypes.array,
        style: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            records: [],
            onLayerAdd: () => {},
            mapType: "leaflet"
        };
    },
    renderRecordItem(record) {
        let dc = record.dc;
        let id = dc.identifier && dc.identifier;
        return (
			<Col xs={12} sm={6} md={6} lg={6} key={id}>
                <RecordItem
                    onLayerAdd={this.props.onLayerAdd}
                    onZoomToExtent={this.props.onZoomToExtent}
                    catalogURL={this.props.catalogURL}
                    record={record}
                    style={{height: "215px", maxHeight: "215px"}}/>
			</Col>
        );
    },
    render() {
        if (this.props.records) {
            let mapsList = this.props.records instanceof Array ? this.props.records : [this.props.records];
            return (
                <Grid className="record-grid" style={this.props.style}>
                    <Row>
						{mapsList.map(this.renderRecordItem)}
					</Row>
				</Grid>
            );
        }

        return null;
    }
});

module.exports = RecordGrid;
