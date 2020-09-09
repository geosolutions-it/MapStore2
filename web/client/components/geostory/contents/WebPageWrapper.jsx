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
import { isValidURL } from '../../../utils/URLUtils';
import { getConfigProp } from '../../../utils/ConfigUtils';
import VisibilityContainer from '../common/VisibilityContainer';
import Loader from '../../misc/Loader';

const LoaderComponent = () => <div className="ms-media-loader"><Loader size={52}/></div>;

export class WebPageWrapper extends React.PureComponent {
    static propTypes = {
        editURL: PropTypes.bool,
        onClose: PropTypes.func,
        onChange: PropTypes.func,
        src: PropTypes.string,
        id: PropTypes.string,
        debounceTime: PropTypes.number,
        lazy: PropTypes.bool
    }

    static defaultProps = {
        lazy: true
    };

    state = {
        url: this.props.src || '',
        error: false,
        loading: true
    }

    render() {
        const { onClose, editURL } = this.props;
        const { url, error } = this.state;
        return (
            <React.Fragment>
                <Portal>
                    <Dialog
                        modal
                        show={editURL}
                        onClickOut={(e) => e.preventDefault() && e.stopPropagation()}
                        title={<Message msgId="geostory.webPageCreator.title" />}
                        onClose={onClose}
                        id="web-page-creator"
                        footer={(
                            <Button bsSize="small" onClick={this.save} >
                                <Message msgId="geostory.webPageCreator.saveButton" />
                            </Button>
                        )}
                    >
                        { error && (
                            <div className="dropzone-errorBox alert-danger">
                                <Message msgId="geostory.webPageCreator.error"/>
                            </div>
                        )}
                        <FormGroup controlId="WEBPAGE_URL" validationState={error && 'error'}>
                            <ControlLabel>
                                <Message msgId="geostory.webPageCreator.url.label" />
                            </ControlLabel>
                            <FormControl
                                label="URL"
                                type="text"
                                value={url}
                                onChange={this.updateURL}
                                required
                            />
                        </FormGroup>
                    </Dialog>
                </Portal>
                {this.props.lazy
                    ? <VisibilityContainer
                        key={this.props.id}
                        id={this.props.id}
                        debounceTime={this.props.debounceTime}
                        loading={this.state.loading}
                        onLoad={() => this.setState({ loading: false })}
                        loaderComponent={LoaderComponent}>
                        <WebPage {...this.props} />
                    </VisibilityContainer>
                    : <WebPage {...this.props} />}
            </React.Fragment>
        );
    }

    updateURL = ({ target: { value: url }}) => {
        this.setState({ url });
    }

    save = () => {
        const { url } = this.state;
        const error = !isValidURL(url, getConfigProp("GeoStoryValidIframeURLRegex"));
        this.setState({ error });
        if (!error) {
            this.props.onChange(url);
        }
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
