/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

import InfoButton from '../../../../components/buttons/InfoButton';
import Dialog from '../../../../components/misc/Dialog';
import { Message } from '../../../../components/I18N/I18N';
import AboutContent from './AboutContent';
import aboutImg from '../../../assets/img/Blank.gif';
import VersionInfo from './VersionInfo';


class About extends React.Component {
    static propTypes = {
        style: PropTypes.object,
        modalConfig: PropTypes.object,
        withButton: PropTypes.bool,
        enabled: PropTypes.bool,
        version: PropTypes.string,
        githubUrl: PropTypes.string,
        commit: PropTypes.string,
        message: PropTypes.string,
        date: PropTypes.string,
        onClose: PropTypes.func,
        showAboutContent: PropTypes.bool,
        showVersionInfo: PropTypes.bool
    };

    static defaultProps = {
        style: {
            position: "absolute",
            zIndex: 1000,
            bottom: "-8px",
            right: "0px",
            margin: "8px"
        },
        modalConfig: {
            closeGlyph: "1-close"
        },
        withButton: true,
        enabled: false,
        onClose: () => {},
        showAboutContent: true,
        showVersionInfo: true
    };

    render() {
        if (this.props.enabled) {

            if (this.props.withButton) {
                return (
                    <InfoButton
                        {...this.props.modalConfig}
                        image={aboutImg}
                        title={<Message msgId="about_title"/>}
                        btnType="image"
                        className="map-logo"
                        body={<>
                            {this.props.showVersionInfo && <VersionInfo
                                version={this.props.version}
                                message={this.props.message}
                                commit={this.props.commit}
                                date={this.props.date}
                                githubUrl={this.props.githubUrl}
                            />}
                            {this.props.showAboutContent && <AboutContent/>}
                        </>
                        }
                    />
                );
            }
            return (
                <Dialog
                    id="mapstore-about"
                    style={{zIndex: 1992, paddingTop: 0}}
                    modal
                    draggable
                >
                    <span role="header">
                        <span className="modal-title about-panel-title">
                            <Message msgId="about_title"/>
                        </span>
                        <button onClick={this.props.onClose} className="about-panel-close close">
                            {this.props.modalConfig.closeGlyph ? <Glyphicon glyph={this.props.modalConfig.closeGlyph}/> : <span>×</span>}
                        </button>
                    </span>
                    <div role="body">
                        {this.props.showVersionInfo && <VersionInfo
                            version={this.props.version}
                            message={this.props.message}
                            commit={this.props.commit}
                            date={this.props.date}
                            githubUrl={this.props.githubUrl}
                        />}
                        {this.props.showAboutContent && <AboutContent/>}
                    </div>
                </Dialog>
            );
        }
        return null;
    }
}

export default About;
