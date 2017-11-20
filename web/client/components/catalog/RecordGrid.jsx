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

const RecordItem = require('./RecordItem');


class RecordGrid extends React.Component {
    static propTypes = {
        recordItem: PropTypes.element,
        catalogURL: PropTypes.string,
        onZoomToExtent: PropTypes.func,
        zoomToLayer: PropTypes.bool,
        onLayerAdd: PropTypes.func,
        onError: PropTypes.func,
        records: PropTypes.array,
        authkeyParamNames: PropTypes.array,
        style: PropTypes.object,
        showGetCapLinks: PropTypes.bool,
        addAuthentication: PropTypes.bool,
        column: PropTypes.object,
        currentLocale: PropTypes.string
    };

    static defaultProps = {
        column: {xs: 12},
        currentLocale: 'en-US',
        onLayerAdd: () => {},
        onError: () => {},
        records: [],
        zoomToLayer: true
    };

    renderRecordItem = (record) => {
        let Item = this.props.recordItem || RecordItem;
        return (
			<Col {...this.props.column} key={record.identifier}>
                <Item
                    onLayerAdd={this.props.onLayerAdd}
                    onZoomToExtent={this.props.onZoomToExtent}
                    zoomToLayer={this.props.zoomToLayer}
                    onError={this.props.onError}
                    catalogURL={this.props.catalogURL}
                    record={record}
                    authkeyParamNames={this.props.authkeyParamNames}
                    style={{height: "215px", maxHeight: "215px"}}
                    showGetCapLinks={this.props.showGetCapLinks}
                    addAuthentication={this.props.addAuthentication}
                    currentLocale={this.props.currentLocale}/>
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
