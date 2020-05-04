/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const MapInfoUtils = require('../../../utils/MapInfoUtils');
const HTML = require('../../../components/I18N/HTML');
const Message = require('../../../components/I18N/Message');
const {Alert, Panel, Accordion} = require('react-bootstrap');
const ViewerPage = require('./viewers/ViewerPage');
const {isEqual} = require('lodash');
const {getFormatForResponse} = require('../../../utils/IdentifyUtils');

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
        containerProps: PropTypes.object,
        index: PropTypes.number,
        onNext: PropTypes.func,
        onPrevious: PropTypes.func,
        onUpdateIndex: PropTypes.func,
        setIndex: PropTypes.func,
        showEmptyMessageGFI: PropTypes.bool
    };

    static defaultProps = {
        format: MapInfoUtils.getDefaultInfoFormatValue(),
        responses: [],
        missingResponses: 0,
        collapsible: false,
        headerOptions: {},
        container: Accordion,
        validator: MapInfoUtils.getValidator,
        viewers: MapInfoUtils.getViewers(),
        style: {
            position: "relative",
            marginBottom: 0
        },
        containerProps: {},
        index: 0,
        showEmptyMessageGFI: true,
        onNext: () => {},
        onPrevious: () => {},
        setIndex: () => {}
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        // reset current page on new requests set
        if (!isEqual(nextProps.responses, this.props.responses)) {
            this.props.setIndex(0);
        }
    }

    shouldComponentUpdate(nextProps) {
        return nextProps.responses !== this.props.responses || nextProps.missingResponses !== this.props.missingResponses || nextProps.index !== this.props.index;
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
            return this.props.showEmptyMessageGFI ? (
                <Alert bsStyle={"info"}>
                    <Message msgId={"noInfoForLayers"} />
                    <b>{titles.join(', ')}</b>
                </Alert>
            ) : null;
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
            const {response, layerMetadata} = res;
            const format = getFormatForResponse(res, this.props);
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
                    header={PageHeader ? <span><PageHeader
                        size={responses.length}
                        {...this.props.headerOptions}
                        {...layerMetadata}
                        index={this.props.index}
                        onNext={() => this.props.onNext()}
                        onPrevious={() => this.props.onPrevious()}/></span> : null
                    }
                    style={this.props.style}>
                    <ViewerPage
                        response={response}
                        format={format}
                        viewers={customViewer || this.props.viewers}
                        layer={layerMetadata}/>
                </Panel>
            );
        });
    };

    renderAdditionalInfo = () => {
        const validator = this.props.validator(this.props.format);
        if (validator) {
            return this.renderEmptyLayers(validator);
        }
        return null;
    };

    render() {
        const Container = this.props.container;
        const validator = this.props.validator(this.props.format);
        const validResponses = validator.getValidResponses(this.props.responses);
        return (<div className="mapstore-identify-viewer">
            <Container {...this.props.containerProps}
                onChangeIndex={(index) => { this.props.setIndex(index); }}
                ref="container"
                index={this.props.index || 0}
                key={"swiper"}
                className="swipeable-view"
            >
                {this.renderPages(validResponses)}
            </Container>
            {this.renderAdditionalInfo()}
        </div>)
        ;
    }
}

module.exports = DefaultViewer;
