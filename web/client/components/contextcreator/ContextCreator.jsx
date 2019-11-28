/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import * as PropTypes from 'prop-types';

import Stepper from '../misc/Stepper';
import GeneralSettings from './GeneralSettingsStep';


export default class ContextCreator extends React.Component {
    static propTypes = {
        curStepId: PropTypes.string,
        newContext: PropTypes.object,
        resource: PropTypes.object,
        onChangeAttribute: PropTypes.func,
        onSave: PropTypes.func,
        saveDestLocation: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object,
        router: PropTypes.object
    };

    static defaultProps = {
        newContext: {},
        resource: {},
        curStepId: 'general-settings',
        saveDestLocation: '/context-manager',
        onChangeAttribute: () => {}
    };

    render() {
        return (
            <Stepper
                currentStepId={this.props.curStepId}
                onSetStep={(stepId) => this.context.router.history.push(
                    `/context-creator/${stepId}/`)}
                onSave={() => this.props.onSave(this.props.saveDestLocation)}
                steps={[{
                    id: 'general-settings',
                    label: 'contextCreator.generalSettings.label',
                    component:
                        <GeneralSettings
                            contextName={this.props.resource.name}
                            windowTitle={this.props.newContext.windowTitle}
                            context={this.context}
                            onChange={this.props.onChangeAttribute}/>
                }]}/>
        );
    }
}
