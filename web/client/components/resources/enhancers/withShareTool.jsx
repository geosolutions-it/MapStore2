/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import {compose, withState} from 'recompose';
import ConfigUtils from '../../../utils/ConfigUtils';
import SharePanel from '../../share/SharePanel';
import ShareUtils from '../../../utils/ShareUtils';
import {isString} from 'lodash';

export const addSharePanel = Component => props => {
    const { showShareModal, onShowShareModal, shareModalSettings, setShareModalSettings, editedResource, setEditedResource, shareOptions = {}, getLocationObject = () => window.location, version, ...other } = props;
    const { getShareUrl = () => { }, shareApi = false } = other;
    const options = editedResource && typeof shareOptions === 'function' ? shareOptions(editedResource) : shareOptions;
    const shareUrlResult = editedResource ? getShareUrl(editedResource) : '';
    const resourceUrl = isString(shareUrlResult) ? shareUrlResult : shareUrlResult.url;
    // window.location
    const location = getLocationObject();
    const baseURL = location && (location.origin + location.pathname);
    const fullUrl = editedResource ? baseURL + '#/' + resourceUrl : '';
    const showAPI = isString(shareUrlResult) ? shareApi : shareUrlResult.shareApi;

    return (<div>
        <Component onShare={resource => {
            setEditedResource(resource);
            onShowShareModal(true);
        }} {...other} />
        <SharePanel
            modal
            draggable={false}
            isVisible={showShareModal}
            settings={shareModalSettings}
            shareUrl={fullUrl}
            showAPI={showAPI}
            version={version}
            shareApiUrl={showAPI ? ShareUtils.getApiUrl(fullUrl) : ''}
            shareConfigUrl={ShareUtils.getConfigUrl(fullUrl, ConfigUtils.getConfigProp('geoStoreUrl'))}
            onClose={() => onShowShareModal(false)}
            onUpdateSettings={setShareModalSettings}
            {...options} />
    </div>);
};

/**
* Adds sharing functionality to a resource grid.
* @memberof components.resources.enhancers
* @name withShareTool
* @type {function}
* @prop {function} getShareUrl: takes a resource and returns an appropriate sharing url, or url along with shareApi value to override the one in shareApi prop
* @prop {boolean} shareApi: controls, whether Share Dialog should include an option if embedding with APIs
* @prop {object} [shareOptions] options to pass to the SharePanel
* @prop {function} [getLocationObject] method to retrieve window.location. If not passed, window.location will be used.  (Overridable by unit tests)
*/
export default compose(
    withState('showShareModal', 'onShowShareModal', false),
    withState('shareModalSettings', 'setShareModalSettings'),
    withState('editedResource', 'setEditedResource'),
    addSharePanel
);
