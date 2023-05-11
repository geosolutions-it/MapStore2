import React, {isValidElement} from 'react';
import PropTypes from 'prop-types';
const FALLBACK_LOCALE = 'en-US';
/**
 * Extracts the localized string from the given value. If the value is an object, it will return the value for the current locale or the default string, otherwise it will return the value itself.
 * @param {string|object} value the value to extract the localized string from.
 * @param {string} locale the current locale code (e.g. 'en-US')
 * @returns {string} the localized string
 */
export const extractLocalizedString = (value, locale) => {
    if (value && typeof value === 'object' && !isValidElement(value)) {
        return value?.[locale] || value.default || value?.[FALLBACK_LOCALE] || '';
    }
    return value;
};

/**
 * This function applies the default value to the localized text object, if default value is not already set (or if it is an empty string).
 * This is useful to avoid an empty string when the default is not defined.
 * for instance:
 * ```javascript
 * var localized = {default: ""};
 * var defaultValue = "default";
 * const WrongCMP = () => <LocalizedString value={localized ? localized : defaultValue} />; // this will use {default: ""}, showing an empty string
 * const CorrectCMP = () => <LocalizedString value={applyDefaultToLocalizedString(localized, defaultValue)} />; // this will use {default: "default"}, showing the default value.
 * @param {string|object} value the value to apply the default value to
 * @param {string} defaultValue the default value to apply
 * @returns {string|object} the value with the default value applied.
 */
export const applyDefaultToLocalizedString = (value, defaultValue) => {
    if (!defaultValue) {
        return value;
    }
    if (value && typeof value === 'object' && !isValidElement(value)) {
        return {
            ...value,
            "default": value.default || defaultValue
        };
    }
    // is a string or null;
    return value || defaultValue;
};

/**
 * Component that extracts the localized string from the given value and returns it.
 * @param {string|object} props.value the value to extract the localized string from
 */
class LocalizedString extends React.Component {
    static propTypes = {
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node])
    };

    static contextTypes = {
        intl: PropTypes.object
    };
    static defaultProps = {
        value: ''
    };

    render() {
        return extractLocalizedString(this.props.value, this.context?.intl?.locale);
    }
}

export default LocalizedString;
