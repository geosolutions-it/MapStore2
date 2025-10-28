import React from 'react';
import Editor from './AttributeEditor';
import NumberEditor from './NumberEditor';
import AutocompleteEditor from './AutocompleteEditor';
import DropDownEditor from './DropDownEditor';
import DateTimeEditor from "./DateTimeEditor";
import EnumerateEditor from './EnumerateEditor';

const shouldUseEnumeratorComponent = (props) => {
    return !!props?.schema?.enum?.length;
};

const types = {
    "defaultEditor": (props) => <Editor {...props}/>,
    "int": (props) => shouldUseEnumeratorComponent(props)
        ? <EnumerateEditor dataType="int" {...props}/>
        : <NumberEditor dataType="int" inputProps={{step: 1, type: "number"}} {...props}/>,
    "number": (props) => shouldUseEnumeratorComponent(props)
        ? <EnumerateEditor dataType="number" {...props}/>
        : <NumberEditor dataType="number" inputProps={{step: 1, type: "number"}} {...props}/>,
    "string": (props) => shouldUseEnumeratorComponent(props)
        ? <EnumerateEditor dataType="string" {...props}/>
        : props.autocompleteEnabled
            ? <AutocompleteEditor dataType="string" {...props}/>
            : <Editor dataType="string" {...props}/>,
    "boolean": (props) => <DropDownEditor dataType="string" {...props} value={props.value && props.value.toString()} emptyValue={null} filter={false} values={["true", "false"]}/>,
    "date-time": (props) => <DateTimeEditor dataType="date-time" calendar time popupPosition="top" {...props} />,
    "date": (props) => <DateTimeEditor dataType="date"time={false} calendar popupPosition="top" {...props} />,
    "time": (props) => <DateTimeEditor dataType="time" calendar={false} time popupPosition="top" {...props} />
};
export default (type, props) => types[type] ? types[type](props) : types.defaultEditor(props);
