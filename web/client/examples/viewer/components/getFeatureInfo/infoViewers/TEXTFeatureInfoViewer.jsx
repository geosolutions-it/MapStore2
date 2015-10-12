/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Alert = require('react-bootstrap').Alert;

var Book = require('../../../../../components/misc/Book');
var I18N = require('../../../../../components/I18N/I18N');

var HtmlRenderer = require('../../../../../components/misc/HtmlRenderer');

var TEXTFeatureInfoViewer = React.createClass({
    propTypes: {
        responses: React.PropTypes.array
    },
    getDefaultProps() {
        return {
            responses: []
        };
    },
    renderInfo(responses) {
        var output = [];

        output = responses.map((res, i) => {
            let content = "";
            const {response, layerMetadata} = res;

            if (typeof response === "string" && response.indexOf("<?xml") !== 0) {
                content = (
                    <HtmlRenderer
                        key={i}
                        html={'<div style="font-family: monospace; font-size: 12px;">' + response.replace(/\n/g, "<br/>") + "</div>"}/>
                );
            } else {
                content = (
                    <Alert bsStyle={"danger"} key={i}>
                        <h4><I18N.HTML msgId={"getFeatureInfoError.title"}/></h4>
                        <p><I18N.HTML msgId={"getFeatureInfoError.text"}/></p>
                    </Alert>
                );
            }

            return {component: content, title: layerMetadata.title};
        });
        return output.reduce((prev, item) => {
            prev.titles.push(<span><b>Layer: </b>{item.title}</span>);
            prev.pages.push(item.component);
            return prev;
        }, {titles: [], pages: []});
    },
    render() {
        var {titles, pages} = this.renderInfo(this.props.responses);
        return (
            <Book pageTitles={titles}>
                {pages}
            </Book>
        );
    }
});

module.exports = TEXTFeatureInfoViewer;
