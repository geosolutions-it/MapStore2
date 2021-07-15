/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useEffect} from "react";
import { connect } from 'react-redux';
import find from "lodash/find";
import cs from 'classnames';
import { getAllGeoCarouselSections } from "../../../../selectors/geostory";
import {update} from "../../../../actions/geostory";

const getVectorFeature = (responses = [], layerInfo) => {
    const {response: { features: [feature = {}] = []} = {}} = find(responses, ({queryParams: {request} = {}, layerMetadata: {title} = {}} = {})=> !request && title.toLowerCase() === layerInfo) || {};
    return feature;
};

const getCardTitleByContentRefId = (contentRefId, sections) => {
    const result = find(sections, ({contents}) => find(contents, {id: contentRefId}));
    if (result) {
        const {id: contentId, thumbnail: {title = ''} = {}} = find(result.contents, {id: contentRefId}) || {};
        return {sectionId: result.id, contentId, title};
    }
    return result;
};

// Simple card viewer for geostory carousel item vector feature
export default connect(
    (state)=>({sections: getAllGeoCarouselSections(state)}),
    {onClickMarker: update}
)(({responses, layerInfo, sections, onClickMarker}) => {
    const {contentRefId} = getVectorFeature(responses, layerInfo);
    const {title, contentId, sectionId} = getCardTitleByContentRefId(contentRefId, sections) || {};
    useEffect(()=>{
        onClickMarker(`sections[{"id":"${sectionId}"}].contents[{"id":"${contentId}"}].carouselToggle`, true);
    }, [sectionId]);
    return (<div
        className={cs('ms-geostory-carousel-viewer',
            {'ms-geostory-carousel-viewer-info': !!title, 'ms-geostory-carousel-viewer-alert-info alert-info': !title})
        }>
        {title || 'No title'}
    </div>);
});
