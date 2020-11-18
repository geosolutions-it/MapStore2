import React from 'react';
import Editor from './AttributeEditor';
import NumberEditor from './NumberEditor';
import AutocompleteEditor from './AutocompleteEditor';
import DropDownEditor from './DropDownEditor';

const types = {
    "defaultEditor": (props) => <Editor {...props}/>,
    "int": (props) => <NumberEditor dataType="int" inputProps={{step: 1, type: "number"}} {...props}/>,
    "number": (props) => <NumberEditor dataType="number" inputProps={{step: 1, type: "number"}} {...props}/>,
    "string": (props) => props.autocompleteEnabled ?
        <AutocompleteEditor dataType="string" {...props}/> :
        <Editor dataType="string" {...props}/>,
    "boolean": (props) => <DropDownEditor dataType="string" {...props} value={props.value && props.value.toString()} filter={false} values={["true", "false"]}/>
};
export default (type, props) => types[type] ? types[type](props) : types.defaultEditor(props);
