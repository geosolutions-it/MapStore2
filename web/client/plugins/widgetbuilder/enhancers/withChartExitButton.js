/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { withProps } from 'recompose';

export default (visible = ({step}) => step === 0) => withProps(({ stepButtons = [], exitButton, onChange, editorData, dashBoardEditing, ...props}) => ({
    stepButtons: [{
        ...exitButton,
        visible: visible({stepButtons, exitButton, ...props}),
        ...(dashBoardEditing && {onClick: () => onChange('chart-layers', undefined)})
    }, ...stepButtons]
}));
