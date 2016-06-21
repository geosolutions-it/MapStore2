/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const MapInfoUtils = require('../../../utils/MapInfoUtils');
const HTML = require('../../../components/I18N/HTML');
const Message = require('../../../components/I18N/Message');

const {Alert, Panel, Accordion} = require('react-bootstrap');

const DefaultHeader = require('./DefaultHeader');
const DefaultViewer = React.createClass({
    propTypes: {
        format: React.PropTypes.string,
        collapsible: React.PropTypes.bool,
        responses: React.PropTypes.array,
        missingResponses: React.PropTypes.number,
        container: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func]),
        header: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func]),
        headerOptions: React.PropTypes.object,
        validator: React.PropTypes.func,
        viewers: React.PropTypes.object,
        style: React.PropTypes.object,
        containerProps: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            format: MapInfoUtils.getDefaultInfoFormatValue(),
            responses: [],
            missingResponses: 0,
            collapsible: true,
            header: DefaultHeader,
            headerOptions: {},
            container: Accordion,
            validator: MapInfoUtils.getValidator,
            viewers: MapInfoUtils.getViewers(),
            style: {maxHeight: "500px", overflow: "auto"},
            containerProps: {}
        };
    },
    shouldComponentUpdate(nextProps) {
        return nextProps.responses !== this.props.responses || nextProps.missingResponses !== this.props.missingResponses;
    },
    renderEmptyLayers(validator) {
        const notEmptyResponses = validator.getValidResponses(this.props.responses).length;
        const invalidResponses = validator.getNoValidResponses(this.props.responses);
        if (this.props.missingResponses === 0 && notEmptyResponses === 0) {
            return null;
        }
        if (invalidResponses.length !== 0) {
            const titles = invalidResponses.map((res) => {
                const {layerMetadata} = res;
                return layerMetadata.title;
            });
            return (
                <Alert bsStyle={"info"}>
                    <Message msgId={"noInfoForLayers"} />
                    <b>{titles.join(', ')}</b>
                </Alert>
            );
        }
        return null;
    },
    renderPage(response) {
        const Viewer = this.props.viewers[this.props.format];
        if (Viewer) {
            return <Viewer response={response} />;
        }
        return null;
    },
    renderPages(responses) {
        if (this.props.missingResponses === 0 && responses.length === 0) {
            return (
                <Alert bsStyle={"danger"}>
                    <h4><HTML msgId="noFeatureInfo"/></h4>
                </Alert>
            );
        }
        return responses.map((res, i) => {
            const {response, layerMetadata} = res;
            const PageHeader = this.props.header;
            return (
                <Panel
                    eventKey={i}
                    key={i}
                    collapsible={this.props.collapsible}
                    header={<span><PageHeader {...this.props.headerOptions} {...layerMetadata} container={() => this.refs.container}/></span>}
                    style={this.props.style}>
                    {this.renderPage(response)}
                </Panel>
            );
        });
    },
    renderAdditionalInfo() {
        const validator = this.props.validator(this.props.format);
        if (validator) {
            return this.renderEmptyLayers(validator);
        }
    },
    render() {
        const Container = this.props.container;
        const validator = this.props.validator(this.props.format);
        const validResponses = validator.getValidResponses(this.props.responses);
        return (<div>
                <Container {...this.props.containerProps} ref="container" defaultActiveKey={0} key={"swiper-" + this.props.responses.length + "-" + this.props.missingResponses} shouldUpdate={(nextProps, props) => {return nextProps !== props; }}>
                    {this.renderPages(validResponses)}
                </Container>
                {this.renderAdditionalInfo()}
            </div>
        );
    }
});

module.exports = DefaultViewer;
