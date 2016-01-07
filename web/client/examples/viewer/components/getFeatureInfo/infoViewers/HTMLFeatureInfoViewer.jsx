/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Alert, Accordion, Panel} = require('react-bootstrap');

const HtmlRenderer = require('../../../../../components/misc/HtmlRenderer');
const I18N = require('../../../../../components/I18N/I18N');

const regexpBody = /^[\s\S]*<body>([\s\S]*)<\/body>[\s\S]*$/i;
const regexpStyle = /(<style[\s\=\w\/\"]*>[^<]*<\/style>)/i;

const HTMLFeatureInfoViewr = React.createClass({
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
    getValidResponses(responses) {
        return responses.filter((res) => typeof res.response === "string" && res.response.indexOf("<?xml") !== 0 && res.response.replace(regexpBody, '$1').trim().length !== 0);
    },
    getNoValidResponses(responses) {
        return responses.filter((res) => !(typeof res.response === "string" && res.response.indexOf("<?xml") !== 0 && res.response.replace(regexpBody, '$1').trim().length !== 0));
    },
    renderInfo(responses) {
        const filteredResponses = this.getValidResponses(responses);
        if (this.props.missingRequests === 0 && filteredResponses.length === 0) {
            return (
                <Alert bsStyle={"danger"}>
                    <h4><I18N.HTML msgId={"noFeatureInfo"}/></h4>
                </Alert>
            );
        }
        return filteredResponses.map((res, i) => {
            const {response, layerMetadata} = res;
            // gets css rules from the response and removes which are related to body tag.
            let styleMatch = regexpStyle.exec(response);
            let style = styleMatch && styleMatch.length === 2 ? regexpStyle.exec(response)[1] : "";
            style = style.replace(/body[,]+/g, '');
            // gets feature info managing an eventually empty response
            let content = response.replace(regexpBody, '$1').trim();
            return (
                <Panel header={layerMetadata.title} eventKey={i + 1} key={i} style={{overflowX: "auto"}}>
                    <HtmlRenderer key={i} html={style + content} />
                </Panel>
            );
        });
    },
    renderEmpryLayer(responses) {
        const notEmptyResponses = this.getValidResponses(responses).length;
        const filteredResponses = this.getNoValidResponses(responses);
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

module.exports = HTMLFeatureInfoViewr;
