import React, { useState } from 'react';
import { DATATYPES } from '../../../../../utils/InteractionUtils';
import InteractionEditor from '../common/interactions/InteractionsEditor';
import { DropdownButton, Glyphicon, MenuItem } from 'react-bootstrap';
import withTooltip from '../../../../data/featuregrid/enhancers/withTooltip';
import FlexBox from '../../../../layout/FlexBox';

const TDropdownButton = withTooltip(DropdownButton);
const FilterActionsTab = ({

}) => {
    const [optEvents, setOptEvents] = useState([{
        glyph: 'dropper',
        type: 'styleChange',
        title: "Change Style", // TODO: localized title
        // HERE DEPENDS, can be a feature or a record (depending on Data source).
        // The attributes of the selected items are needed, can be multiple or not (depending on selection mode)
        dataType: DATATYPES.FEATURE // here we emit a single feature selected (or multiple, let's see, and need a transformation)
    }]);
    const [events, setEvents] = useState([{
        type: 'filterChange',
        glyph: 'filter',
        title: 'Change filter', // TODO: localized title
        dataType: DATATYPES.LAYER_FILTER,
        constraints: {
            layer: {
                name: 'gs:us_states__15',
                id: 'gs:us_states__15'
            }
        }
    }]);
    const onAddEvent = e => {
        setOptEvents(evts => evts.filter(ee => ee.type !== e.type));
        setEvents(evts => [...evts, e]);
    };
    return (
        <div className="ms-filter-wizard-actions-tab">
            <FlexBox
                inline
                wrap
                style={{width: "100%"}}
            >
                <div style={{flex: 1}}>
                    On selection change:
                </div>
                <TDropdownButton disabled={optEvents.length === 0} tooltip="Add interaction" pullRight title={<Glyphicon glyph="plus" />}>
                    {
                        optEvents.map(e => {
                            return (<MenuItem eventKey={e.id} onClick={() => onAddEvent(e)}>
                                {e.glyph && <Glyphicon glyph={e.glyph}/>}
                                {e.title}
                            </MenuItem>);
                        })
                    }
                </TDropdownButton>
            </FlexBox>
            <InteractionEditor events={events} />
        </div>
    );
};

export default FilterActionsTab;


