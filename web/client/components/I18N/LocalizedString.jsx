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
