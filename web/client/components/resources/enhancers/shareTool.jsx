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

export default compose(
    withState('showShareModal', 'onShowShareModal', false),
    withState('shareModalSettings', 'setShareModalSettings'),
    withState('editedResource', 'setEditedResource'),
    Component => props => {
        const {showShareModal, onShowShareModal, shareModalSettings, setShareModalSettings, editedResource, setEditedResource, ...other} = props;
        const {shareUrl = () => {}, shareApi = false} = other;

        const shareUrlResult = editedResource ? shareUrl(editedResource) : '';
        const resourceUrl = isString(shareUrlResult) ? shareUrlResult : shareUrlResult.url;
        const showAPI = isString(shareUrlResult) ? shareApi : shareUrlResult.shareApi;
        const fullUrl = editedResource ? window.origin + '/#/' + resourceUrl : '';

        return (<>
            <Component onShare={resource => {
                setEditedResource(resource);
                onShowShareModal(true);
            }} {...other}/>
            <SharePanel
                modal
                hideAdvancedSettings
                draggable={false}
                isVisible={showShareModal}
                settings={shareModalSettings}
                shareUrl={fullUrl}
                showAPI={showAPI}
                shareApiUrl={shareApi ? ShareUtils.getApiUrl(fullUrl) : ''}
                shareConfigUrl={ShareUtils.getConfigUrl(fullUrl, ConfigUtils.getConfigProp('geoStoreUrl'))}
                onClose={() => onShowShareModal(false)}
                onUpdateSettings={setShareModalSettings}/>
        </>);
    }
);
