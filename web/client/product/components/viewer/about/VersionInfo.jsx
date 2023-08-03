/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';

import Message from '../../../../components/I18N/Message';

class VersionInfo extends React.Component {

    static propTypes = {
        githubUrl: PropTypes.string,
        commit: PropTypes.string,
        message: PropTypes.string,
        date: PropTypes.string,
        version: PropTypes.string
    }
    static defaultProps = {
        githubUrl: "",
        commit: "",
        message: "",
        date: "",
        version: ""
    };

    render() {
        return (
            <div key="body" role="body" className="version-panel">
                <h1><Message msgId="version.title"/></h1>

                <div>
                    <div className="version-info">
                        <div className="info-label">
                            <Message msgId="version.label"/>
                        </div>
                        <div className="v_version">
                            {this.props.version}
                        </div>
                    </div>
                </div>
                <div>
                    <div className="version-info">
                        <div className="info-label">
                            <Message msgId="version.message"/>
                        </div>
                        <div className="v_message">
                            {this.props.message}
                        </div>
                    </div>
                    <div className="version-info">
                        <div className="info-label">
                            <Message msgId="version.commit"/>
                        </div>
                        <div className="v_commit">
                            {
                                this.props.githubUrl ?
                                    <a href={this.props.githubUrl + this.props.commit} target="_blank" className="v_githubUrl">
                                        {this.props.commit}
                                    </a> :
                                    this.props.commit
                            }
                        </div>
                    </div>
                    <div className="version-info">
                        <div className="info-label">
                            <Message msgId="version.date"/>
                        </div>
                        <div className="v_date">
                            {this.props.date}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default VersionInfo;
