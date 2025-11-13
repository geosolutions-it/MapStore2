import React from 'react';
import Editor from './AttributeEditor';
import NumberEditor from './NumberEditor';
import AutocompleteEditor from './AutocompleteEditor';
import DropDownEditor from './DropDownEditor';
import DateTimeEditor from "./DateTimeEditor";
import EnumerateEditor from './EnumerateEditor';

const NUMBER_INPUT_PROPS = { step: 1, type: "number" };
const BOOLEAN_VALUES = ["true", "false"];

const shouldUseEnumeratorComponent = (props) => {
    return !!props?.schema?.enum?.length;
};

// Create number editor (int or number type)
const createNumberEditor = (dataType) => (props) => {
    return shouldUseEnumeratorComponent(props)
        ? <EnumerateEditor dataType={dataType} {...props} />
        : <NumberEditor dataType={dataType} inputProps={NUMBER_INPUT_PROPS} {...props} />;
};

// Create string editor
const createStringEditor = (props) => {
    if (shouldUseEnumeratorComponent(props)) {
        return <EnumerateEditor dataType="string" {...props} />;
    }
    if (props.autocompleteEnabled) {
        return <AutocompleteEditor dataType="string" {...props} />;
    }
    return <Editor dataType="string" {...props} />;
};

const types = {
    "defaultEditor": (props) => <Editor {...props} />,
    "int": createNumberEditor("int"),
    "number": createNumberEditor("number"),
    "string": createStringEditor,
    "boolean": (props) => (
        <DropDownEditor
            dataType="string"
            {...props}
            value={props.value ? props.value.toString() : null}
            emptyValue={null}
            filter={false}
            values={BOOLEAN_VALUES}
        />
    ),
    "date-time": (props) => <DateTimeEditor dataType="date-time" calendar time popupPosition="top" {...props} />,
    "date": (props) => <DateTimeEditor dataType="date" time={false} calendar popupPosition="top" {...props} />,
    "time": (props) => <DateTimeEditor dataType="time" calendar={false} time popupPosition="top" {...props} />
};

export default (type, props) => types[type] ? types[type](props) : types.defaultEditor(props);
