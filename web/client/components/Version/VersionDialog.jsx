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
import '../../themes/default/less/version.less';

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
                {this.props.show && <Dialog id="mapstore-about" style={{position: 'absolute', top: '90px'}} draggable={false} modal>
                    <div key="header" role="header">
                        <Message key="title" msgId="version.label"/>
                        <button key="close" onClick={this.onClose} className="close">{this.props.closeGlyph ? <Glyphicon glyph={this.props.closeGlyph}/> : <span>×</span>}</button>
                    </div>
                    <div key="body" role="body" className="version-panel">
                        <ul style={{listStyleType: 'none'}}>
                            <li>
                                <span className="version-info">
                                    <span className="application-version-label"><Message msgId="version.label"/>
                                    </span>:{this.props.version}
                                </span>
                            </li>
                            <li>
                                <div className="version-info">
                                    <div className="info-label">
                                        <Message msgId="version.message"/>
                                    </div>
                                    <div>
                                        {message}

                                    </div>
                                </div>
                                <div className="version-info">
                                    <div className="info-label">
                                        <Message msgId="version.commit"/>

                                    </div>
                                    <div id="commit">
                                        {commit}

                                    </div>
                                </div>
                                <div className="version-info">
                                    <div className="info-label">
                                        <Message msgId="version.date"/>

                                    </div>
                                    <div id="date">
                                        {date}

                                    </div>
                                </div>
                                <div className="version-info">
                                    <div className="info-label">
                                        <Message msgId="version.author"/>

                                    </div>
                                    <div id="author">
                                        {author}

                                    </div>
                                </div>

                            </li>
                            <li style={{marginTop: '22px', marginLeft: '86px'}}>
                                <span><a href={githubUrl} target="_blank" ><Button className="btn"><Message msgId="version.githuburl"/></Button></a></span>
                            </li>
                        </ul>
                    </div>
                </Dialog>}
            </div>
        );

    }

}

export default VersionDialog;
