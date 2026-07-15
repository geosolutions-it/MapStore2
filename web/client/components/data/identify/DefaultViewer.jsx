/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import PropTypes from 'prop-types';
import { getDefaultInfoFormatValue, getValidator, getViewers, getViewer, getDefaultViewer, getDefaultInfoViewMode, getLayerFeatureInfoViews } from '../../../utils/MapInfoUtils';
import HTML from '../../../components/I18N/HTML';
import Message from '../../../components/I18N/Message';
import { Alert, Panel, Accordion } from 'react-bootstrap';
import ScrollableTabs from '../../misc/ScrollableTabs';
import ViewerPage from './viewers/ViewerPage';
import { isEmpty, reverse, startsWith } from 'lodash';
import { getFormatForResponse } from '../../../utils/IdentifyUtils';

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
        showEmptyMessageGFI: PropTypes.bool,
        renderValidOnly: PropTypes.bool,
        loaded: PropTypes.bool,
        isMobile: PropTypes.bool,
        disableInfoAlert: PropTypes.bool,
        hidePopupIfNoResults: PropTypes.bool
    };

    static defaultProps = {
        format: getDefaultInfoFormatValue(),
        responses: [],
        requests: [],
        missingResponses: 0,
        collapsible: false,
        headerOptions: {},
        container: Accordion,
        validator: getValidator,
        viewers: getViewers(),
        style: {
            position: "relative",
            marginBottom: 0
        },
        containerProps: {},
        showEmptyMessageGFI: true,
        renderValidOnly: false,
        onNext: () => {},
        onPrevious: () => {},
        setIndex: () => {},
        isMobile: false,
        disableInfoAlert: false,
        hidePopupIfNoResults: false
    };

    state = {
        activeViewIds: {}
    };

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.responses !== this.props.responses
            || nextProps.missingResponses !== this.props.missingResponses
            || nextProps.index !== this.props.index
            || nextState.activeViewIds !== this.state.activeViewIds;
    }

    /**
     * Get validation properties of the responses
     */
    getResponseProperties = (renderValidOnly = this.props.renderValidOnly) => {
        const validator = this.props.validator(this.props.format);
        const responses = this.props.responses.map(res => res === undefined ? {} : res); // Replace any undefined responses
        const validResponses = renderValidOnly ? validator.getValidResponses(responses) : responses;
        const invalidResponses = validator.getNoValidResponses(this.props.responses);
        const emptyResponses = this.props.requests.length === invalidResponses.length;
        const currResponse = this.getCurrentResponse(validResponses[this.props.index]);
        return {
            responses,
            validResponses,
            currResponse,
            emptyResponses,
            invalidResponses
        };
    }

    /**
     * Identify current response is valid
     */
    getCurrentResponse = (response) => {
        const validator = this.props.validator(this.props.format);
        return validator.getValidResponses([response]);
    }

    /**
     * Helper method to calculate panel index properly on mobile devices.
     */
    getPanelIndex = (index, filterIndex = true) => {
        // Recalculate index value of valid responses when mode is mobile
        const { responses, validResponses } = this.getResponseProperties(this.props.isMobile);
        const response = filterIndex ? responses[index] : validResponses[index];
        return !this.props.isMobile
            ? index
            : filterIndex
                ? validResponses.findIndex(el => el === response)
                : responses.findIndex(el => el === response);
    };

    renderEmptyLayers = () => {
        const {invalidResponses, emptyResponses} = this.getResponseProperties();
        if (this.props.missingResponses === 0 && emptyResponses) {
            return null;
        }
        let allowRender = invalidResponses.length !== 0;
        if (!this.props.renderValidOnly) {
            allowRender =  allowRender && this.props.missingResponses === 0;
        }
        if (allowRender) {
            const titles = invalidResponses.map((res) => {
                const {layerMetadata} = res;
                return layerMetadata.title;
            });
            return this.props.showEmptyMessageGFI && !this.props.disableInfoAlert ? (
                <Alert bsStyle={"info"}>
                    <Message msgId={"noInfoForLayers"} />
                    <b>{titles.join(', ')}</b>
                </Alert>
            ) : null;
        }
        return null;
    };

    renderPage = (response) => {
        const Viewer = getDefaultViewer(this.props.format, this.props.viewers);
        if (Viewer) {
            return <Viewer response={response} />;
        }
        return null;
    };

    renderEmptyPages = () => {
        const {emptyResponses} = this.getResponseProperties();
        if (this.props.missingResponses === 0 && emptyResponses) {
            if (this.props.hidePopupIfNoResults) {
                return <span className="hidePopupIfNoResults"/>;
            }
            return (
                <Alert bsStyle={"danger"}>
                    <h4><HTML msgId="noFeatureInfo"/></h4>
                </Alert>
            );
        }
        return null;
    }

    getActiveView = (views, reqId) => {
        return views.find(({ id }) => id === this.state.activeViewIds[reqId]) || views[0];
    }

    getLayerMetadataForView = (layerMetadata, view) => {
        if (!view) {
            return layerMetadata;
        }
        const featureInfo = layerMetadata?.featureInfo || {};
        return {
            ...layerMetadata,
            viewer: view.viewer ?? layerMetadata.viewer,
            featureInfo: {
                ...featureInfo,
                ...view,
                format: view.type,
                template: view.template ?? featureInfo.template,
                viewer: view.viewer ?? featureInfo.viewer
            }
        };
    }

    getResponseForView = (res, view) => {
        const viewResponse = view?.id && res?.viewResponses?.[view.id];
        return {
            response: viewResponse?.response ?? res.response,
            queryParams: viewResponse?.queryParams ?? res.queryParams
        };
    }

    renderViewTabs = (views, activeView, reqId) => {
        if (views.length <= 1) {
            return null;
        }
        return (
            <div style={{ marginBottom: 12 }}>
                <ScrollableTabs
                    className="ms-identify-view-tabs tabs-underline"
                    selectedTabId={activeView.id}
                    onSelect={(activeViewId) => {
                        this.setState(({activeViewIds}) => ({
                            activeViewIds: {...activeViewIds, [reqId]: activeViewId}
                        }));
                    }}
                    tabs={views.map((view) => ({
                        title: view.title,
                        eventKey: view.id
                    }))}/>
            </div>
        );
    }

    renderPages = () => {
        const {validResponses: responses} = this.getResponseProperties(this.props.isMobile || this.props.renderValidOnly);
        return responses.map((res, i) => {
            const {layerMetadata, layer} = res;
            const layerWithMetadata = {
                ...layer,
                ...layerMetadata,
                featureInfo: layerMetadata?.featureInfo || layer?.featureInfo
            };
            const views = getLayerFeatureInfoViews(layerWithMetadata, {
                defaultType: getDefaultInfoViewMode(this.props.format) || 'PROPERTIES'
            });
            const activeView = this.getActiveView(views, res.reqId);
            const layerMetadataForView = this.getLayerMetadataForView(layerWithMetadata, activeView);
            const viewResponse = this.getResponseForView(res, activeView);
            const format = getFormatForResponse({
                ...res,
                queryParams: viewResponse.queryParams
            }, this.props);
            const PageHeader = this.props.header;
            let customViewer;
            if (layerMetadataForView?.viewer?.type) {
                customViewer = getViewer(layerMetadataForView.viewer.type);
            }
            const size = responses.filter((resp) => {
                const responseLayer = {
                    ...resp.layer,
                    ...resp.layerMetadata,
                    featureInfo: resp.layerMetadata?.featureInfo || resp.layer?.featureInfo
                };
                const responseViews = getLayerFeatureInfoViews(responseLayer, {
                    defaultType: getDefaultInfoViewMode(this.props.format) || 'PROPERTIES'
                });
                const response = this.getResponseForView(resp, this.getActiveView(responseViews, resp.reqId));
                return !startsWith(response.response, "no features were found");
            }).length;
            return (<Panel
                eventKey={i}
                key={i}
                collapsible={this.props.collapsible}
                header={PageHeader ? <span><PageHeader
                    size={size}
                    {...this.props.headerOptions}
                    {...layerMetadata}
                    index={this.props.index}
                    onNext={() => this.props.onNext()}
                    onPrevious={() => this.props.onPrevious()}/></span> : null
                }
                style={this.props.style}>
                {this.renderViewTabs(views, activeView, res.reqId)}
                <ViewerPage
                    response={viewResponse.response}
                    format={format}
                    viewers={customViewer || this.props.viewers}
                    layer={layerMetadataForView}/>
            </Panel>);
        });
    };

    render() {
        const Container = this.props.container;
        const {currResponse, emptyResponses} = this.getResponseProperties();
        let componentOrder = [this.renderEmptyLayers(),
            <Container {...this.props.containerProps}
                onChangeIndex={(index) => {
                    this.props.setIndex(this.getPanelIndex(index, false));
                }}
                ref="container"
                index={this.getPanelIndex(this.props.index) || 0}
                key={"swiper"}
                style={this.containerStyle(currResponse)}
                className="swipeable-view">
                {this.renderPages()}
            </Container>
        ];
        // Display renderEmptyPages at top in mobile for seamless swipeable view
        componentOrder = this.props.isMobile ? componentOrder : reverse(componentOrder);
        return (
            <div className="mapstore-identify-viewer">
                {!emptyResponses ? componentOrder.map((c)=> c) : this.renderEmptyPages()}
            </div>
        );
    }

    containerStyle = (currResponse) => {
        if (isEmpty(currResponse) && this.props.isMobile) {
            return {height: "100%"};
        }
        return {display: isEmpty(currResponse) ? 'none' : 'block'};
    }
}

export default DefaultViewer;
