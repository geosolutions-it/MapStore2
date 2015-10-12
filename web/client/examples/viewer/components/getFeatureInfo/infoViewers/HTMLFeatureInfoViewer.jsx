/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Alert = require('react-bootstrap').Alert;

var HtmlRenderer = require('../../../../../components/misc/HtmlRenderer');
var Book = require('../../../../../components/misc/Book');
var I18N = require('../../../../../components/I18N/I18N');

var HTMLFeatureInfoViewr = React.createClass({
    propTypes: {
        responses: React.PropTypes.array
    },
    getDefaultProps() {
        return {
            responses: []
        };
    },
    renderInfo(responses) {
        const regexpBody = /^[\s\S]*<body>([\s\S]*)<\/body>[\s\S]*$/i;
        const regexpStyle = /(<style[\s\=\w\/\"]*>[^<]*<\/style>)/i;
        var output = [];

        output = responses.map((res, i) => {
            let content = "";
            let style;
            const {response, layerMetadata} = res;

            if (typeof response === "string" && response.indexOf("<?xml") !== 0) {
                // gets css rules from the response and removes which are related to body tag.
                let styleMatch = regexpStyle.exec(response);
                style = styleMatch && styleMatch.length === 2 ? regexpStyle.exec(response)[1] : "";
                style = style.replace(/body[,]+/g, '');
                // gets feature info managing an eventually empty response
                content = response.replace(regexpBody, '$1').trim();
                if (content.length === 0) {
                    content = <p key={i} style={{margin: "16px"}}><I18N.Message msgId="noFeatureInfo"/></p>;
                } else {
                    content = <HtmlRenderer key={i} html={style + content} />;
                }
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

module.exports = HTMLFeatureInfoViewr;
