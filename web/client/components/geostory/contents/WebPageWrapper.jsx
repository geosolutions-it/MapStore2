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
import { setWebPageUrl } from '../../../actions/geostory';
import Message from '../../I18N/Message';
import Portal from '../../misc/Portal';
import PropTypes from 'prop-types';
import WebPage from './WebPage';
import { compose, withHandlers } from 'recompose';

export class WebPageWrapper extends React.PureComponent {
    static propTypes = {
        editURL: PropTypes.bool,
        onClose: PropTypes.func,
        onChange: PropTypes.func,
        src: PropTypes.string
    }

    state = {
        url: this.props.src || ''
    }

    render() {
        const { onChange, onClose, editURL } = this.props;
        const { url } = this.state;

        return (
            <React.Fragment>
                <Portal>
                    <Dialog
                        modal
                        show={editURL}
                        title={<Message msgId="geostory.webPageCreator.title" />}
                        onClose={onClose}
                        id="web-page-creator"
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
                </Portal>
                <WebPage {...this.props} />
            </React.Fragment>
        );
    }

    updateURL = ({ target: { value: url }}) => {
        this.setState({ url });
    }
}

const wrappedComponent = compose(
    withHandlers({
        onClose: ({update = () => {}}) => () => update('editURL', false, 'merge')
    })
)(WebPageWrapper);

export default connect(
    null,
    { onChange: setWebPageUrl }
)(wrappedComponent);
