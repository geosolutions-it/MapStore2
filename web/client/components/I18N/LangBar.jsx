/*
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import { DropdownButton, MenuItem, ButtonGroup } from 'react-bootstrap';
import { head } from 'lodash';
import { getSupportedLocales } from '../../utils/LocaleUtils';
import FlagButton from './FlagButton';

class LangBar extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        className: PropTypes.string,
        locales: PropTypes.object,
        currentLocale: PropTypes.string,
        onLanguageChange: PropTypes.func,
        dropdown: PropTypes.bool
    };

    static defaultProps = {
        id: 'mapstore-langselector',
        className: 'mapstore-langselector',
        locales: {},
        currentLocale: 'en-US',
        onLanguageChange: function() {},
        dropdown: true
    };

    render() {
        const locales = getSupportedLocales();
        const currentLanguage = head(Object.keys(locales).filter(lang => locales[lang].code === this.props.currentLocale));
        return this.props.dropdown ? (
            <div
                className={this.props.className}>
                <DropdownButton
                    pullRight
                    noCaret
                    id={this.props.id}
                    className="square-button-md _border-transparent"
                    title={
                        <FlagButton
                            componentAsButton={false}
                            key={currentLanguage}
                            code={this.props.currentLocale}
                            label={locales[currentLanguage] && locales[currentLanguage].description}
                            lang={currentLanguage}/>
                    }>
                    {Object.keys(locales).filter(lang => locales[lang].code !== this.props.currentLocale).map(lang =>
                        <MenuItem key={lang} eventKey={lang} onClick={() => this.props.onLanguageChange(locales[lang].code)}>
                            <FlagButton
                                componentAsButton={false}
                                key={lang}
                                code={locales[lang].code}
                                label={locales[lang].description}
                                lang={lang}
                                active={locales[lang].code === this.props.currentLocale}
                            />{' ' + locales[lang].description}</MenuItem>)
                    }
                </DropdownButton>
            </div>
        ) : (
            <ButtonGroup id={this.props.id} type="select" bsSize="small">
                {Object.keys(locales).map(lang => (
                    <FlagButton
                        key={lang}
                        code={locales[lang].code}
                        label={locales[lang].description}
                        lang={lang}
                        active={locales[lang].code === this.props.currentLocale}
                        onFlagSelected={this.props.onLanguageChange}
                    />
                ))}
            </ButtonGroup>
        );
    }
}

export default LangBar;
