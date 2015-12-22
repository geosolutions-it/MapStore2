/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var {Alert, Accordion, Panel} = require('react-bootstrap');

var ApplyTemplate = require('../../../../../components/misc/ApplyTemplate');
var PropertiesViewer = require('../../../../../components/misc/PropertiesViewer');
var I18N = require('../../../../../components/I18N/I18N');

var JSONFeatureInfoViewr = React.createClass({
    propTypes: {
        responses: React.PropTypes.array,
        missingRequests: React.PropTypes.number
    },
    getDefaultProps() {
        return {
            responses: [],
            missingRequests: 0
        };
    },
    renderInfo(responses) {
        const getFeatureProps = feature => feature.properties;
        const getFormattedContent = (feature, i) => {
            return (
                <ApplyTemplate key={i} data={feature} template={getFeatureProps}>
                    <PropertiesViewer title={feature.id} exclude={["bbox"]}/>
                </ApplyTemplate>
            );
        };
        const filteredResponses = responses.filter((res) => res.response && res.response.features && res.response.features.length);
        if (this.props.missingRequests === 0 && filteredResponses.length === 0) {
            return (
                <Alert bsStyle={"danger"}>
                    <h4><I18N.HTML msgId={"noFeatureInfo"}/></h4>
                </Alert>
            );
        }
        return filteredResponses.map((res, i) => {
            const {response, layerMetadata} = res;

            return (
                <Panel header={layerMetadata.title} eventKey={i + 1} key={i}>
                    {response.features.map(getFormattedContent)}
                </Panel>
            );
        });
    },
    renderEmpryLayer(responses) {
        const notEmptyResponses = responses.filter((res) => res.response && res.response.features && res.response.features.length).length;
        const filteredResponses = responses.filter((res) => res.response && res.response.features && res.response.features.length === 0);
        if (this.props.missingRequests === 0 && notEmptyResponses === 0) {
            return null;
        }
        if (filteredResponses.length !== 0) {
            const titles = filteredResponses.map((res) => {
                const {layerMetadata} = res;
                return layerMetadata.title;
            });
            return (
                <Alert bsStyle={"info"}>
                    <I18N.Message msgId={"noInfoForLayers"} />
                    <b>{titles.join(', ')}</b>
                </Alert>
            );
        }
        return null;
    },
    render() {
        let pages = this.renderInfo(this.props.responses);
        let emptyLayers = this.renderEmpryLayer(this.props.responses);
        return (
            <div>
                <Accordion defaultActiveKey={1}>
                    {pages}
                </Accordion>
                {emptyLayers}
            </div>
        );
    }
});

module.exports = JSONFeatureInfoViewr;
