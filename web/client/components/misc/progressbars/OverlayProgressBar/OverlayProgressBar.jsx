/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';

import PropTypes from 'prop-types';
import { ProgressBar, Col, Row } from 'react-bootstrap';
import Spinner from 'react-spinkit';
import Message from '../../../../components/I18N/Message';
import './css/overlayprogressbar.css';

class OverlayProgressBar extends React.Component {
    static propTypes = {
        loading: PropTypes.bool,
        count: PropTypes.number,
        length: PropTypes.number,
        label: PropTypes.string,
        unit: PropTypes.string,
        spinner: PropTypes.string
    };

    static defaultProps = {
        loading: false,
        count: 0,
        length: 0,
        label: 'autorefresh.updating',
        unit: 'autorefresh.layers'
    };

    render() {
        return this.props.loading ? (
            <div className="overlay-spinner-container">
                <div>
                    <Row>
                        <Col xs={12} className="text-center overlay-spinner-label"><h3><Message msgId={this.props.label}/></h3></Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            {
                                this.props.spinner ?
                                    <Spinner noFadeIn overrideSpinnerClassName="spinner" spinnerName={this.props.spinner}/>
                                    :
                                    <ProgressBar active now={100 * this.props.count / this.props.length} />
                            }
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} className="text-center overlay-spinner-label"><h3>{this.props.count + ' '} <Message msgId="autorefresh.of"/>{ ' ' + this.props.length + ' '}<Message msgId={this.props.unit}/></h3></Col>
                    </Row>
                </div>
            </div>
        ) : null;
    }
}

export default OverlayProgressBar;
