/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Dialog from '../../misc/StandardDialog';
import { FormControl, ControlLabel, FormGroup, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toggleWebPageCreator, setWebPageUrl } from '../../../actions/geostory';
import Message from '../../../components/I18N/Message';
import get from 'lodash/get';
import PropTypes from 'prop-types';

export class WebPageCreator extends React.PureComponent {
    static propTypes = {
        show: PropTypes.bool,
        onClose: PropTypes.func,
        onChange: PropTypes.func
    }

    state = {
        url: ''
    }

    render() {
        const { show, onClose, onChange } = this.props;
        const { url } = this.state;

        return (
            <Dialog
                modal
                show={show}
                title={<Message msgId="geostory.webPageCreator.title" />}
                onClose={onClose}
                footer={(
                    <Button bsSize="small" onClick={() => onChange(url)} >
                        <Message msgId="geostory.webPageCreator.saveButton" />
                    </Button>
                )}
            >
                <FormGroup controlId="WEBPAGE_URL">
                    <ControlLabel>
                        <Message msgId="geostory.webPageCreator.url.label" />
                    </ControlLabel>
                    <FormControl
                        label="URL"
                        type="text"
                        value={url}
                        onChange={this.updateURL}
                    />
                </FormGroup>
            </Dialog>
        );
    }

    updateURL = ({ target: { value: url }}) => {
        this.setState({ url });
    }
}

export default connect(
    (state) => ({
        show: get(state, 'geostory.showWebPageCreator')
    }),
    {
        onClose: toggleWebPageCreator.bind(null, false),
        onChange: setWebPageUrl
    }
)(WebPageCreator);
