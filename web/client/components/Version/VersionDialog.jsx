/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Dialog from '../misc/Dialog';
import { Glyphicon } from 'react-bootstrap';
import Message from '../I18N/Message';
import Button from '../misc/Button';
import PropTypes from 'prop-types';
import './Version.css';

class  VersionDialog extends React.Component {

    static propTypes = {
        closeGlyph: PropTypes.string,
        show: PropTypes.bool,
        onClose: PropTypes.func,
        version: PropTypes.string
    }
    static defaultProps = {
        toggleControl: () => {},
        closeGlyph: "1-close",
        onClose: () => {}
    };
    onClose = () => {
        this.props.onClose(false);
    };

    render() {
        const githubUrl = "https://github.com/geosolutions-it/MapStore/tree/" + __COMMITHASH__;
        const splitData = __COMMIT_DATA__.split('\n');
        const commit = splitData.find((x)=> x.toLowerCase().includes('commit:')).split(':')[1];
        const message = splitData.find((x)=> x.toLowerCase().includes('message:')).split(':')[1];
        const date = splitData.find((x)=> x.toLowerCase().includes('date:')).split(':')[1];
        const author = splitData.find((x)=> x.toLowerCase().includes('author:')).split(':')[1];

        return (
            <div  style={{ background: 'gba(0, 0, 0, 0.5)'}}>
                {this.props.show && <Dialog id="mapstore-about" style={{position: 'absolute', top: '90px'}}>
                    <div key="header" role="header">
                        <Message key="title" msgId="version.label"/>
                        <button key="close" onClick={this.onClose} className="close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
                    </div>
                    <div key="body" role="body">
                        <ul style={{listStyleType: 'none'}}>
                            <li>
                                <span className="version-info"><span className="application-version-label"><Message msgId="version.label"/></span>:{this.props.version}</span>
                            </li>
                            <li>
                                <div className="version-info">
                                    <div className="info-label">
                                        Message

                                    </div>
                                    <div>
                                        {message}

                                    </div>
                                </div>
                                <div className="version-info">
                                    <div className="info-label">
                                    Commit

                                    </div>
                                    <div>
                                        {commit}

                                    </div>
                                </div>
                                <div className="version-info">
                                    <div className="info-label">
                                     Date

                                    </div>
                                    <div>
                                        {date}

                                    </div>
                                </div>
                                <div className="version-info">
                                    <div className="info-label">
                                    Author

                                    </div>
                                    <div>
                                        {author}

                                    </div>
                                </div>

                            </li>
                            <li style={{marginTop: '22px', marginLeft: '86px'}}>
                                <span><a href={githubUrl} target="_blank" ><Button className="btn"> Open github tree in a new tab </Button></a></span>
                            </li>
                        </ul>
                    </div>
                </Dialog>}
            </div>
        );

    }

}

export default VersionDialog;
