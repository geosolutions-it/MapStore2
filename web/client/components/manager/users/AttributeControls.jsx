import React, {useState, useEffect} from 'react';
import axios from '../../../libs/ajax';
import { get, castArray, isArray, isNil } from 'lodash';
import Select from 'react-select';
import { FormControl } from 'react-bootstrap';
import { DateTimePicker } from 'react-widgets';

import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
momentLocalizer(moment);


// new accessory selector for attribute editor

export const CONTROL_TYPES = { // note: from server can be "optional", anc can have a description, that doesn't seems to be used on the client
    // types present in original portal
    STRING: "string", // text line
    TEXT: "text", // text area
    // new type to implement our tools
    SELECT: "select",
    DATE: "date"

};

export const MultiValueSelect = ({onChange, options = [], value: currentValue, multiAttribute, separator = ",", isMulti, ...props}) => {
    let wrapValue = [ ];
    if (multiAttribute) {
        wrapValue = castArray(currentValue);
    } else {
        wrapValue = currentValue.split?.(separator) ?? [];
    }
    const values = options.filter(({value: optValue}) => wrapValue.includes(optValue));
    // multi and isMulti is for forward compatibility.
    return (<Select
        options={options}
        isMulti={isMulti}
        multi={isMulti}
        value={isMulti ? values : values?.[0]}
        onChange={onChange ? (rawValues = []) => {
            const newValues = castArray(rawValues ?? []).map(({value: newVal}) => newVal);
            if (multiAttribute) {
                return onChange(!!newValues ? newValues : []);
            }
            const newValue = newValues.join(separator);
            return onChange(!!newValue ? newValue : []);
        } : undefined}
        {...props}
    />);
};

export const RemoteSelect = ({source, ...props}) => {
    const {url, path, valueAttribute = "value", labelAttribute = "label"} = source;
    const [options, setOptions] = useState();
    const loadOptions = () => axios.get(url).then(({data}) => {
        return (path ? get(data, path) : data).map((entry = {}) => ({
            value: entry?.[valueAttribute],
            label: entry?.[labelAttribute]
        }));
    });
    useEffect(() => {
        loadOptions().then(setOptions);
    }, []);
    return <MultiValueSelect  {...props} options={options}/>;
};

const MultiValueControl = ({name, value, onChange = () => {}, disabled, multiAttribute, separator, ...props}) => {

    return (<FormControl
        disabled={disabled}
        type="input"
        value={multiAttribute && isArray(value) ? value.join(separator) : value}
        onChange={(e) => {
            if (multiAttribute) {
                const newValues = e.target.value && e.target.value.split(separator);
                return onChange( newValues.length > 0 ? newValues : []);
            }
            // single value (empty strings are saved) TODO: opt empty string to remove attribute)
            return onChange(e.target.value);
        }}
        name={name}
        {...props} />);
};

export const DateControl = ({ name, value, onChange = () => { }, format, ...props}) => {
    const handleChange = (date) => {
        const newValue = moment(date).isValid() ? moment(date).format(format) : undefined;
        onChange(newValue);
    };
    const date = !isNil(value) && !isNil(moment(value, format).toDate()) && moment(value, format).isValid() ? moment(value, format).toDate() : undefined;
    return (<DateTimePicker
        format={format}
        time={false}
        calendar
        value={date}
        onChange={handleChange}
        name={name}
        {...props} />);
};


export default {
    [CONTROL_TYPES.SELECT]: ({name, value, options, source, controlAttributes = {}, onChange = () => {}}) =>
        source
            ? <RemoteSelect name={name} value={value} onChange={onChange} {...controlAttributes} source={source}  />
            : <MultiValueSelect  name={name} value={value} onChange={onChange}  {...controlAttributes} options={options ?? [{ value: value, label: value }]}/>,
    [CONTROL_TYPES.TEXT]: ({name, value, onChange = () => {}, disabled, controlAttributes = {} }) => <MultiValueControl componentClass="textarea" disabled={disabled} onChange={onChange} value={value} name={name}  {...controlAttributes} />,
    [CONTROL_TYPES.STRING]: ({name, value, onChange = () => {}, disabled, controlAttributes = {} }) => <MultiValueControl type="text" disabled={disabled} onChange={onChange} value={value} name={name}  {...controlAttributes} />,
    [CONTROL_TYPES.DATE]: ({ name, value, onChange = () => { }, disabled, controlAttributes = {} }) => <DateControl disabled={disabled} onChange={onChange} value={value} name={name} {...controlAttributes} />
};


