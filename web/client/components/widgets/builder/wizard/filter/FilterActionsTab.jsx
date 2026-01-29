import React, { useState, useMemo, useEffect } from 'react';
import {connect} from 'react-redux';
import { getPossibleTargetsEditingWidget, TARGET_TYPES } from '../../../../../utils/InteractionUtils';
import InteractionEditor from '../common/interactions/InteractionsEditor';
import FlexBox from '../../../../layout/FlexBox';
import { getEditingWidget, getWidgetInteractionTreeGenerated } from '../../../../../selectors/widgets';
import Message from '../../../../I18N/Message';


const FilterActionsTab = ({
    data = {},
    sourceWidgetId,
    onEditorChange = () => {}
}) => {


    const memoizedTargets = useMemo(() => {
        return getPossibleTargetsEditingWidget("filter", data?.data?.layer);
    }, [data?.data?.layer]);


    const [targets, setTargets] = useState(memoizedTargets);

    useEffect(() => {
        const isStyle = data?.data?.dataSource === "userDefined" && data.data.userDefinedType === "styleList";
        setTargets(isStyle ? memoizedTargets.filter(t => t.targetType === TARGET_TYPES.APPLY_STYLE) : memoizedTargets.filter(t => t.targetType === TARGET_TYPES.APPLY_FILTER));
    }, [memoizedTargets, data]);

    return (
        <div className="ms-filter-wizard-actions-tab">
            <FlexBox
                inline
                wrap
                style={{width: "100%", marginBottom: "10px"}}
                centerChildrenVertically
            >
                <div style={{flex: 1}}>
                    <Message msgId="widgets.filterWidget.onSelectionChange" />
                </div>
            </FlexBox>
            <InteractionEditor targets={targets} sourceWidgetId={sourceWidgetId} currentSourceId={data?.id} onEditorChange={onEditorChange} isStyleOnly={data?.data?.dataSource === "userDefined" && data.data.userDefinedType === "styleList"} />
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


