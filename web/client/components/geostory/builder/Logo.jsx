/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import Thumbnail from '../../maps/forms/Thumbnail';
import Message from '../../I18N/Message';

/**
 * Show the preview for the image
 */
export default class Logo extends React.Component {
    static propTypes = {
        thumbnail: PropTypes.object,
        onUpdateThumbnail: PropTypes.func,
        onThumbnailErrors: PropTypes.func
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        onUpdateThumbnail: () => {},
        onThumbnailErrors: () => {}
    }

    render() {
        const {
            onUpdateThumbnail,
            onThumbnailErrors
        } = this.props;

        return (<Thumbnail
            withLabel={false}
            onUpdate={(data, url) => onUpdateThumbnail({data, url})}
            onError={(errors) => onThumbnailErrors(errors)}
            message={<Message msgId="backgroundDialog.thumbnailMessage"/>}
            suggestion=""
            map={{
                newThumbnail: get(this.props.thumbnail, 'url') || "NODATA"
            }}
        />);
    }
}
