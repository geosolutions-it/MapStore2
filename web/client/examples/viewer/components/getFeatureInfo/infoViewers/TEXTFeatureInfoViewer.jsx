/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Alert, Accordion, Panel} = require('react-bootstrap');

const I18N = require('../../../../../components/I18N/I18N');

const TEXTFeatureInfoViewer = React.createClass({
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
        const filteredResponses = responses.filter((res) => res.response !== "" && res.response !== "no features were found\n" && (typeof res.response === "string" && res.response.indexOf("<?xml") !== 0));
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
                    <pre>{response}</pre>
                </Panel>
            );
        });
    },
    renderEmpryLayer(responses) {
        const notEmptyResponses = responses.filter((res) => res.response !== "" && res.response !== "no features were found\n" && (typeof res.response === "string" && res.response.indexOf("<?xml") !== 0)).length;
        const filteredResponses = responses.filter((res) => res.response === "" || res.response === "no features were found\n" || res.response && (typeof res.response === "string" && res.response.indexOf("<?xml") === 0));
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
        var pages = this.renderInfo(this.props.responses);
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

module.exports = TEXTFeatureInfoViewer;
