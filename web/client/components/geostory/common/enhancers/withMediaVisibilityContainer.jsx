/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Glyphicon } from 'react-bootstrap';

import Loader from '../../../misc/Loader';

import VisibilityContainer from '../VisibilityContainer';
import { SectionTypes, MediaTypes } from '../../../../utils/GeoStoryUtils';


const withMediaVisibility = (MediaComponent) => {

    const ErrorComponent = () => <div className="ms-media-error"><Glyphicon glyph="exclamation-sign"/></div>;
    const LoaderComponent = ({style = {}}) => <div style={style} className="ms-media-loader"><Loader size={52}/></div>;

    function WithMediaVisibility(props) {
        let loaderStyle = {};
        const sectionType = props.sectionType;
        if ((sectionType === SectionTypes.PARAGRAPH || sectionType === SectionTypes.IMMERSIVE) &&
        props.type === MediaTypes.IMAGE) {
            // Calculate paddingTop for setting a proper aspect ratio. The default values for
            // height and width are 9 and 16 respectively to give us 16:9 aspect ratio
            const paddingTop = ((props?.imgHeight || 9) / (props?.imgWidth || 16)) * 100;
            loaderStyle = {paddingTop: `${paddingTop}%`};
        }

        return props.lazy
            ? (
                <VisibilityContainer
                // key needed for immersive background children
                    key={props.id}
                    id={props.id}
                    debounceTime={props.debounceTime}
                    loading={props.isLoading}
                    onLoad={(id) => props.onLoad({ ...props.loading, [id]: false })}
                    loaderComponent={LoaderComponent}
                    loaderStyle={loaderStyle}>
                    <MediaComponent
                        {...props}
                        type={props.type}
                        loaderComponent={LoaderComponent}
                        loaderStyle={loaderStyle}
                        errorComponent={ErrorComponent}/>
                </VisibilityContainer>
            )
            : (
                <MediaComponent
                    {...props}
                    key={props.id}
                    type={props.mediaType || props.type}
                    loaderComponent={LoaderComponent}
                    errorComponent={ErrorComponent}/>
            );

    }

    return WithMediaVisibility;
};

export default withMediaVisibility;
