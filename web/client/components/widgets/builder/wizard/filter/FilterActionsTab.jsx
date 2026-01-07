import React, { useState, useMemo, useEffect } from 'react';
import {connect} from 'react-redux';
import { DATATYPES, getTargetsByWidgetType } from '../../../../../utils/InteractionUtils';
import InteractionEditor from '../common/interactions/InteractionsEditor';
import { DropdownButton, Glyphicon, MenuItem } from 'react-bootstrap';
import withTooltip from '../../../../data/featuregrid/enhancers/withTooltip';
import FlexBox from '../../../../layout/FlexBox';
import { getWidgetInteractionTree, getEditingWidget, getWidgetInteractionTreeGenerated } from '../../../../../selectors/widgets';

const TDropdownButton = withTooltip(DropdownButton);
const FilterActionsTab = ({
    widgetInteractionTree,
    data = {},
    sourceWidgetId
}) => {
    // eslint-disable-next-line no-console
    // console.log(widgetInteractionTree, data, "widgetInteractionTree", getTargetsByWidgetType("filter"));
    const [optTargets, setOptTargets] = useState([{
        glyph: 'dropper',
        type: 'styleChange',
        title: "Change Style", // TODO: localized title
        // HERE DEPENDS, can be a feature or a record (depending on Data source).
        // The attributes of the selected items are needed, can be multiple or not (depending on selection mode)
        dataType: DATATYPES.FEATURE // here we emit a single feature selected (or multiple, let's see, and need a transformation)
    }]);

    const memoizedTargets = useMemo(() => {
        return getTargetsByWidgetType("filter", data?.data?.layer);
    }, [data?.data?.layer]);

    const [targets, setTargets] = useState(memoizedTargets);

    useEffect(() => {
        setTargets(memoizedTargets);
    }, [memoizedTargets]);

    const onAddEvent = e => {
        setOptTargets(trgts => trgts.filter(ee => ee.type !== e.type));
        setTargets(trgts => [...trgts, e]);
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
                <TDropdownButton disabled={optTargets.length === 0} tooltip="Add interaction" pullRight title={<Glyphicon glyph="plus" />}>
                    {
                        optTargets.map(e => {
                            return (<MenuItem eventKey={e.id} onClick={() => onAddEvent(e)}>
                                {e.glyph && <Glyphicon glyph={e.glyph}/>}
                                {e.title}
                            </MenuItem>);
                        })
                    }
                </TDropdownButton>
            </FlexBox>
            <InteractionEditor targets={targets} sourceWidgetId={sourceWidgetId} filterId={data?.id} />
        </div>
    );
};

export default connect((state) => {
    const editingWidget = getEditingWidget(state);
    return {
        widgetInteractionTree: getWidgetInteractionTreeGenerated(state),
        sourceWidgetId: editingWidget?.id
    };
}, null)(FilterActionsTab);


