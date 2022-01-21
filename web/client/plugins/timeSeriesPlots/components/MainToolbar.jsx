import React from 'react';
import Select from 'react-select';

import Message from '../../../components/I18N/Message';
import SelectionTools from './SelectionTools';

export default function MainToolbar(props) {
    return (
    <div className="time-series-plots-toolbar">
        <div>
            <SelectionTools {...props}/>
        </div>
        <div>
            <Message msgId={"Operation"} />
            <Select
                value={props.aggregationOptions[2]}
                options={props.aggregationOptions}
                placeholder={'placeHolder'}
                onChange={(val) => {
                    // onChange("options.aggregationAttribute", val && val.value);
                }}
            />
        </div>
    </div>
    );
}