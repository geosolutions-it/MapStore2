const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const MapInfoUtils = require('../../../utils/MapInfoUtils');
const FeatureInfoUtils = require('../../../utils/FeatureInfoUtils');
const HTML = require('../../../components/I18N/HTML');
const Message = require('../../../components/I18N/Message');

const {Alert, Panel, Accordion} = require('react-bootstrap');

const DefaultHeader = require('./DefaultHeader');
const ViewerPage = require('./viewers/ViewerPage');

class DefaultViewer extends React.Component {
    static propTypes = {
        format: PropTypes.string,
        collapsible: PropTypes.bool,
        requests: PropTypes.array,
        responses: PropTypes.array,
        missingResponses: PropTypes.number,
        container: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        header: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        headerOptions: PropTypes.object,
        validator: PropTypes.func,
        viewers: PropTypes.object,
        style: PropTypes.object,
        containerProps: PropTypes.object
    };

    static defaultProps = {
        format: MapInfoUtils.getDefaultInfoFormatValue(),
        responses: [],
        missingResponses: 0,
        collapsible: false,
        header: DefaultHeader,
        headerOptions: {},
        container: Accordion,
        validator: MapInfoUtils.getValidator,
        viewers: MapInfoUtils.getViewers(),
        style: {
            position: "relative",
            marginBottom: 0
        },
        containerProps: {}
    };

    state = {
        index: 0
    };

    componentWillReceiveProps(nextProps) {
        // reset current page on new requests set
        if (nextProps.requests !== this.props.requests) {
            this.setState({index: 0});
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.responses !== this.props.responses || nextProps.missingResponses !== this.props.missingResponses || nextState.index !== this.state.index;
    }

    renderEmptyLayers = (validator) => {
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
    };

    renderPage = (response) => {
        const Viewer = this.props.viewers[this.props.format];
        if (Viewer) {
            return <Viewer response={response} />;
        }
        return null;
    };

    renderPages = (responses) => {
        if (this.props.missingResponses === 0 && responses.length === 0) {
            return (
                <Alert bsStyle={"danger"}>
                    <h4><HTML msgId="noFeatureInfo"/></h4>
                </Alert>
            );
        }
        return responses.map((res, i) => {
            const {response, layerMetadata, format, queryParams} = res;
            let infoFormat;
            if (queryParams && queryParams.hasOwnProperty('info_format')) {
                infoFormat = queryParams.info_format;
            }
            const PageHeader = this.props.header;
            let customViewer;
            if (layerMetadata.viewer && layerMetadata.viewer.type) {
                customViewer = MapInfoUtils.getViewer(layerMetadata.viewer.type);
            }
            return (
                <Panel
                    eventKey={i}
                    key={i}
                    collapsible={this.props.collapsible}
                    header={<span><PageHeader
                        size={responses.length}
                        {...this.props.headerOptions}
                        {...layerMetadata}
                        index={this.state.index}
                        onNext={() => this.next()}
                        onPrevious={() => this.previous()}/></span>
                    }
                    style={this.props.style}>
                    <ViewerPage response={response} format={infoFormat || format && FeatureInfoUtils.INFO_FORMATS[format] || this.props.format} viewers={customViewer || this.props.viewers} layer={layerMetadata}/>
                </Panel>
            );
        });
    };

    renderAdditionalInfo = () => {
        const validator = this.props.validator(this.props.format);
        if (validator) {
            return this.renderEmptyLayers(validator);
        }
    };

    render() {
        const Container = this.props.container;
        const validator = this.props.validator(this.props.format);
        const validResponses = validator.getValidResponses(this.props.responses);
        return (<div className="mapstore-identify-viewer">
                <Container {...this.props.containerProps}
                    onChangeIndex={(index) => {this.setState({index}); }}
                    ref="container"
                    index={this.state.index || 0}
                    key={"swiper"}
                    className="swipeable-view"
                    >
                    {this.renderPages(validResponses)}
                </Container>
                {this.renderAdditionalInfo()}
            </div>)
        ;
    }

    next = () => {
        this.setState({index: Math.min(this.props.validator(this.props.format).getValidResponses(this.props.responses).length - 1, this.state.index + 1)});
    };

    previous = () => {
        this.setState({index: Math.max(0, this.state.index - 1) });
    };
}

module.exports = DefaultViewer;
