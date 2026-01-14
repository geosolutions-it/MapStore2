import React, { useState, useMemo, useEffect } from 'react';
import {connect} from 'react-redux';
import { DATATYPES, getTargetsByWidgetType, TARGET_TYPES } from '../../../../../utils/InteractionUtils';
import InteractionEditor from '../common/interactions/InteractionsEditor';
import { DropdownButton, Glyphicon, MenuItem } from 'react-bootstrap';
import withTooltip from '../../../../data/featuregrid/enhancers/withTooltip';
import FlexBox from '../../../../layout/FlexBox';
import { getEditingWidget, getWidgetInteractionTreeGenerated } from '../../../../../selectors/widgets';

const TDropdownButton = withTooltip(DropdownButton);
const FilterActionsTab = ({
    data = {},
    sourceWidgetId,
    onEditorChange = () => {}
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

    console.log(memoizedTargets, "memoizedTargets");

    const [targets, setTargets] = useState(memoizedTargets);

    useEffect(() => {
        const isStyle = data?.data?.dataSource === "userDefined" && data.data.userDefinedType === "styleList";
        console.log(data, isStyle ? memoizedTargets.find(t => t.targetType === TARGET_TYPES.APPLY_STYLE) : memoizedTargets.find(t => t.targetType === TARGET_TYPES.APPLY_FILTER), "Active Targets");
        setTargets(isStyle ? memoizedTargets.filter(t => t.targetType === TARGET_TYPES.APPLY_STYLE) : memoizedTargets.filter(t => t.targetType === TARGET_TYPES.APPLY_FILTER));
    }, [memoizedTargets, data]);

    const onAddEvent = e => {
        setOptTargets(trgts => trgts.filter(ee => ee.type !== e.type));
        setTargets(trgts => [...trgts, e]);
    };
    return (
        <div className="ms-filter-wizard-actions-tab">
            <FlexBox
                inline
                wrap
                style={{width: "100%", marginBottom: "10px"}}
                centerChildrenVertically
            >
                <div style={{flex: 1}}>
                    On selection change:
                </div>
                <div className="add-event-button">
                    <TDropdownButton  disabled={optTargets.length === 0} tooltip="Add interaction" pullRight title={<Glyphicon glyph="plus" />}>
                        {
                            optTargets.map(e => {
                                return (<MenuItem eventKey={e.id} onClick={() => onAddEvent(e)}>
                                    {e.glyph && <Glyphicon glyph={e.glyph}/>}
                                    {e.title}
                                </MenuItem>);
                            })
                        }
                    </TDropdownButton>
                </div>
            </FlexBox>
            <InteractionEditor targets={targets} sourceWidgetId={sourceWidgetId} filterId={data?.id} onEditorChange={onEditorChange} />
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


