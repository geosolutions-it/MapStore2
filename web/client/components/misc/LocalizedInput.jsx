import React, {useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import {find} from 'lodash';


import { FormControl, Glyphicon, InputGroup, Button, Image } from 'react-bootstrap';
import { getSupportedLocales } from '../../utils/LocaleUtils';
import withTooltip from '../data/featuregrid/enhancers/withTooltip';
import localizedProps from './enhancers/localizedProps';
import Message from '../I18N/Message';


const getLocaleFlag = (code) => {
    try {
        return require('../I18N/images/flags/' + code + '.png');
    } catch (e) {
        return false;
    }
};

/**
 * Component that shows a flag for the given locale.
 * If the flag is not found, the locale description is shown.
 * @prop {object} locale the locale object with the following structure:
 * ```json
 * {
 *   "code": "en-US",
 *  "description": "English"
 * }
 * ```
 */
const FlagAddon = (withTooltip(({locale = {}, ref, tooltip}) => {
    const flagImgSrc = getLocaleFlag(locale.code);
    return (<InputGroup.Addon>
        {flagImgSrc ? <Image ref={ref} src={flagImgSrc} alt={locale.description} tooltip={tooltip}/> : <span>{locale.description ?? locale.code }</span>}
    </InputGroup.Addon>);
}));

const DefaultFormControl = localizedProps('placeholder')(FormControl);

const AddonIcon = localizedProps('tooltip')(withTooltip(Glyphicon));

/**
 * Component that allows to edit a localized string.
 * The component is an input with a flag button. When the button is clicked, a modal opens and allows to edit the localized string.
 * This component automatically turns the localized string into an object with the "default" key, when the localized string is changed.
 * The localized string is an object with the following structure:
 * ```json
 * {
 *    "default": "the default string",
 *    "it-IT": "the italian string",
 *    "en-US": "the english string"
 *  }
 * ```
 * Usage: `<LocalizedInput value={value} onChange={onChange}/>`
 * Usage with current locale: `<LocalizedInput value={value} onChange={onChange} currentLocale={currentLocale}/>`.
 * Note: the rest of the props are passed directly to the input component.
 * @prop {string|object} value the localized string. It can be a string or an object with the localized strings. If it is a string, it will be converted to an object with the "default" key.
 * @prop {function} onChange callback to be called when the localized string is changed. It will be called with the new localized string as argument, in the same format of the value prop.
 * @prop {array} [locales] the list of supported locales, by default it constains the list returned by `LocaleUtils.getSupportedLocales()` It is an array of objects with the following structure:
 * ```json
 * {
 *  "code": "en-US",
 * "description": "English"
 * }
 * ```
 * @prop {string} currentLocale the current locale. If not present, the default locale is used.
 * @prop {boolean} [disabled=false] if true, the input is disabled.
 * @prop {boolean} [showTranslateTool=true] if false, hides the locale flag and the localization tool, allowing to edit only the default translation (or the string itself, if it is not an object)
 * @prop {boolean} [showCurrent=false] if true, when `currentLocale` is present, shows the current locale flag and the current locale translation in main input, instead of the default. If false, shows the default translation.
 *
 *
 */
const LocalizedInput = ({
    locales = getSupportedLocales() ?? [],
    showTranslateTool = true,
    showCurrent = false,
    currentLocale,
    value,
    onChange = () => {},
    disabled,
    ...props
}) => {
    const [showModal, setShowModal] = useState(false);
    const translations = value && typeof value === 'object' ? value ?? {} : {};
    const defaultTranslation = value && typeof value === 'object' ? value.default : value;
    // if showCurrent is true, check if the current locale is present in the translations
    const currentLocaleEntry = find(Object.values(locales), {code: currentLocale});
    const hasCurrentLocale = currentLocaleEntry && translations[currentLocale];
    // if showCurrent is true and the current locale is present, use it, otherwise use the default translation
    const useCurrent = currentLocale && showCurrent && hasCurrentLocale;
    const updateTranslation = useCallback((newValue, locale = "default") => {

        if (locale !== "default" || value && (typeof value === 'object')) {
            const newTranslations = {"default": defaultTranslation, ...translations, [locale]: newValue};
            onChange(newTranslations);
        } else if (locale === "default" && (value && (typeof value === 'string') || !value && locale === "default")) {
            onChange(newValue);
        }
    }, [translations, defaultTranslation, onChange, value]);
    // if the current translation is present, use it, otherwise use the default translation

    return (<InputGroup>
        <FormControl
            disabled={disabled}
            {...props}
            value={useCurrent ? translations[currentLocale] : defaultTranslation }
            onChange={({target}) => {
                useCurrent
                    ? updateTranslation(target.value, currentLocale)
                    : updateTranslation(target.value);

            }}/>
        { useCurrent && <FlagAddon locale={currentLocaleEntry} />}
        { showTranslateTool && <InputGroup.Addon
            disabled={disabled}>
            <a style={{cursor: 'pointer'}}
                onClick={(e) => {e.preventDefault(); setShowModal(true); }}>
                <AddonIcon glyph="flag" tooltip="localizedInput.localize"/>
            </a>
        </InputGroup.Addon>}
        {showModal && <Modal show bsSize="large">
            <Modal.Header>
                <Modal.Title><Message msgId="localizedInput.title" /></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InputGroup key="default">
                    <InputGroup.Addon>
                        <AddonIcon glyph="flag" tooltip="localizedInput.default"/>
                    </InputGroup.Addon>
                    <DefaultFormControl
                        placeholder={"localizedInput.default"}
                        defaultValue={defaultTranslation}
                        type="text"
                        onChange={({target}) => updateTranslation(target.value)} />
                </InputGroup>
                <hr />
                {Object.values(locales).map((locale) => {

                    return (<InputGroup key={locale.code}>
                        <FlagAddon tooltip={locale.description} locale={locale} />
                        <FormControl
                            placeholder={locale.description}
                            defaultValue={translations[locale.code] || ''}
                            type="text"
                            onChange={({target}) => updateTranslation(target.value, locale.code)} />
                    </InputGroup>);
                }
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button style={{"float": "right"}} onClick={() => setShowModal(false)}>Close</Button>
            </Modal.Footer>
        </Modal>}
    </InputGroup>);
};

LocalizedInput.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onChange: PropTypes.func,
    locales: PropTypes.array,
    currentLocale: PropTypes.string,
    disabled: PropTypes.bool,
    showTranslateTool: PropTypes.bool,
    showCurrent: PropTypes.bool
};


export default LocalizedInput;

