import React, { useState, useMemo, useEffect } from 'react';
import {connect} from 'react-redux';
import {
    getPossibleTargetsEditingWidget,
    TARGET_TYPES,
    TARGET_TYPE_LABELS,
    FILTER_WIDGET_OPTIONAL_TARGET_TYPES,
    findNodeById
} from '../../../../../utils/InteractionUtils';
import InteractionEditor from '../common/interactions/InteractionsEditor';
import FlexBox from '../../../../layout/FlexBox';
import { DropdownButton, Glyphicon, MenuItem } from 'react-bootstrap';
import { getEditingWidget, getWidgetInteractionTreeGenerated, getAllInteractionsWhileEditingSelector } from '../../../../../selectors/widgets';
import Message from '../../../../I18N/Message';

/** msgIds for target-type labels (accordion headers + optional-target "+" menu). */
const FILTER_INTERACTION_TARGET_MSG_IDS = {
    [TARGET_TYPES.APPLY_FILTER]: 'widgets.filterWidget.applyFilter',
    [TARGET_TYPES.APPLY_STYLE]: 'widgets.filterWidget.applyStyle',
    [TARGET_TYPES.APPLY_DIMENSION]: 'widgets.filterWidget.applyDimension'
};

/** Keep first occurrence per targetType */
function dedupeTargetsByType(targets) {
    return targets.filter((target, index, arr) =>
        arr.findIndex(t => t.targetType === target.targetType) === index
    );
}

/**
 * Mandatory target descriptors plus optional ones (when visible in UI or persisted for this source).
 */
function mergeFilterActionTargets({
    defaultTargets,
    allDescriptors,
    optionalTargetTypes,
    persistedOptionalTargetTypes,
    previousTargets
}) {
    const descriptorByType = new Map(allDescriptors.map(d => [d.targetType, d]));
    const persisted = new Set(persistedOptionalTargetTypes);

    const optionalTargets = optionalTargetTypes
        .map(type => {
            const descriptor = descriptorByType.get(type);
            if (!descriptor) {
                return null;
            }
            const keep =
                previousTargets.some(t => t.targetType === type) || persisted.has(type);
            return keep ? descriptor : null;
        })
        .filter(Boolean);

    return dedupeTargetsByType([...optionalTargets, ...defaultTargets]);
}

const FilterActionsTab = ({
    data = {},
    sourceWidgetId,
    onEditorChange = () => {},
    widgetInteractionTree,
    allInteractionsWhileEditing = []
}) => {
    // Style-list widgets only expose "apply style"; otherwise default is "apply filter".
    const isStyle = data?.data?.dataSource === "userDefined" && data?.data?.userDefinedType === "styleList";
    const valueAttributeType = data?.data?.valueAttributeType;

    const allTargetDescriptors = useMemo(
        () => getPossibleTargetsEditingWidget("filter", data?.data?.layer),
        [data?.data?.layer]
    );
    const defaultTargets = useMemo(
        () =>
            isStyle
                ? allTargetDescriptors.filter(t => t.targetType === TARGET_TYPES.APPLY_STYLE)
                : allTargetDescriptors.filter(t => t.targetType === TARGET_TYPES.APPLY_FILTER),
        [allTargetDescriptors, isStyle]
    );

    // Style mode: no user-added targets
    const optionalTargetTypes = useMemo(
        () => (isStyle ? [] : FILTER_WIDGET_OPTIONAL_TARGET_TYPES),
        [isStyle]
    );

    const currentSourceNodePath = useMemo(
        () => findNodeById(widgetInteractionTree, data?.id)?.nodePath,
        [widgetInteractionTree, data?.id]
    );

    const optionalTargetTypeSet = useMemo(() => new Set(optionalTargetTypes), [optionalTargetTypes]);
    const persistedOptionalTargetTypes = useMemo(() => {
        if (!currentSourceNodePath) {
            return [];
        }
        const matched = new Set();
        for (const interaction of allInteractionsWhileEditing) {
            const type = interaction?.targetType;
            if (
                type &&
                optionalTargetTypeSet.has(type) &&
                interaction?.source?.nodePath === currentSourceNodePath
            ) {
                matched.add(type);
            }
        }
        return [...matched].sort();
    }, [allInteractionsWhileEditing, currentSourceNodePath, optionalTargetTypeSet]);

    const [targets, setTargets] = useState(defaultTargets);

    // Re-sync when descriptors/mode change; keep optional rows if user added them or draft already references them.
    useEffect(() => {
        setTargets(prevTargets =>
            mergeFilterActionTargets({
                defaultTargets,
                allDescriptors: allTargetDescriptors,
                optionalTargetTypes,
                persistedOptionalTargetTypes,
                previousTargets: prevTargets
            })
        );
    }, [
        defaultTargets,
        allTargetDescriptors,
        optionalTargetTypes,
        persistedOptionalTargetTypes
    ]);

    const handleAddOptionalTarget = targetType => {
        const descriptor = allTargetDescriptors.find(t => t.targetType === targetType);
        if (!descriptor) {
            return;
        }
        setTargets(prevTargets =>
            prevTargets.some(t => t.targetType === targetType)
                ? prevTargets
                : [descriptor, ...prevTargets]
        );
    };

    const addableOptionalTargetTypes = optionalTargetTypes.filter(
        type => !targets.some(t => t.targetType === type)
    );

    return (
        <div className="ms-filter-wizard-actions-tab">
            <FlexBox
                inline
                gap="sm"
                centerChildrenVertically
                style={{width: "100%", marginBottom: "10px"}}
            >
                <div style={{flex: 1, minWidth: 0}}>
                    <Message msgId="widgets.filterWidget.onSelectionChange" />
                </div>
                {addableOptionalTargetTypes.length > 0 && (
                    <DropdownButton
                        id="ms-interaction-add-target"
                        noCaret
                        pullRight
                        title={<Glyphicon glyph="plus" />}
                        className="square-button ms-interaction-add-target"
                    >
                        {addableOptionalTargetTypes.map(type => (
                            <MenuItem key={type} onClick={() => handleAddOptionalTarget(type)}>
                                {FILTER_INTERACTION_TARGET_MSG_IDS[type] ? (
                                    <Message msgId={FILTER_INTERACTION_TARGET_MSG_IDS[type]} />
                                ) : (
                                    TARGET_TYPE_LABELS[type] ?? type
                                )}
                            </MenuItem>
                        ))}
                    </DropdownButton>
                )}
            </FlexBox>
            <InteractionEditor
                targets={targets}
                sourceWidgetId={sourceWidgetId}
                currentSourceId={data?.id}
                onEditorChange={onEditorChange}
                isStyleOnly={isStyle}
                valueAttributeType={valueAttributeType}
                targetTitleMsgIds={FILTER_INTERACTION_TARGET_MSG_IDS}
            />
        </div>
    );
};

export default connect((state) => {
    const editingWidget = getEditingWidget(state);
    return {
        widgetInteractionTree: getWidgetInteractionTreeGenerated(state),
        sourceWidgetId: editingWidget?.id,
        allInteractionsWhileEditing: getAllInteractionsWhileEditingSelector(state)
    };
}, null)(FilterActionsTab);
