/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col } from 'react-bootstrap';
import src from "./attribution/geosolutions-brand.png";
import HTML from '../../components/I18N/HTML';

/**
 * Footer plugin, section of the homepage.
 * descripition of footer can be overrided by
 * `home.footerDescription` message id in the translations
 * @prop {object} cfg.logo logo data to change image and href, set to null to hide the logo
 * @prop {object} cfg.logo.src source of the logo
 * @prop {object} cfg.logo.width width of the logo image
 * @prop {object} cfg.logo.height height of the logo image
 * @prop {object} cfg.logo.title title of the logo image
 * @prop {object} cfg.logo.alt alternative text of the logo image
 * @memberof plugins
 * @class
 */

class Footer extends React.Component {

    static propTypes = {
        logo: PropTypes.object
    };

    static defaultProps = {
        logo: {
            src,
            width: 140,
            height: 'auto',
            href: 'http://www.geo-solutions.it/',
            title: 'GeoSolutions',
            alt: 'GeoSolutions'
        }
    };

    render() {
        const { href, ...logo } = this.props.logo || {};
        const image = (
            <img
                src={logo.src}
                width={logo.width || 'auto'}
                height={logo.height || 'auto'}
                title={logo.title || ''}
                alt={logo.alt || ''} />
        );
        return (
            <Grid>
                {logo && logo.src && <Row>
                    <Col xs={12} className="text-center">
                        <div>
                            {href ? <a target="_blank" href={href}>
                                {image}
                            </a> : image}
                        </div>
                    </Col>
                </Row>}
                <Row>
                    <Col xs={12} className="text-center">
                        <HTML msgId="home.footerDescription"/>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

export const FooterPlugin = Footer;
