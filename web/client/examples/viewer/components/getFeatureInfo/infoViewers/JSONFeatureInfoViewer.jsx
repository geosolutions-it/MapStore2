/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var Alert = require('react-bootstrap').Alert;

var ApplyTemplate = require('../../../../../components/misc/ApplyTemplate');
var PropertiesViewer = require('../../../../../components/misc/PropertiesViewer');
var Book = require('../../../../../components/misc/Book');
var I18N = require('../../../../../components/I18N/I18N');

var JSONFeatureInfoViewr = React.createClass({
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
        const getFeatureProps = feature => feature.properties;
        const getFormattedContent = (feature, i) => {
            return (
                <ApplyTemplate key={i} data={feature} template={getFeatureProps}>
                    <PropertiesViewer title={feature.id} exclude={["bbox"]}/>
                </ApplyTemplate>
            );
        };

        output = responses.map((res, i) => {
            let content = "";
            const {response, layerMetadata} = res;

            if (response.features) {
                content = <div key={i}>{response.features.map(getFormattedContent)}</div>;
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

module.exports = JSONFeatureInfoViewr;
