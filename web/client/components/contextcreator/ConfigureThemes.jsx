/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import React, {useRef} from 'react';
import ReactSelect from 'react-select';
import {ControlLabel, Glyphicon} from 'react-bootstrap';
import tinycolor from 'tinycolor2';
import find from 'lodash/find';

import Message from '../I18N/Message';
import HTML from '../I18N/HTML';
import Button from '../misc/Button';
import ColorSelector from '../style/ColorSelector';
import ToolbarPopover from '../geostory/common/ToolbarPopover';
import InfoPopover from '../widgets/widget/InfoPopover';


import localizedProps from '../misc/enhancers/localizedProps';
import { getMessageById } from '../../utils/LocaleUtils';
import SwitchButton from '../misc/switch/SwitchButton';

const Select = localizedProps("noResultsText")(ReactSelect);
const MAIN_COLOR = "ms-main-color";
const MAIN_BG_COLOR = "ms-main-bg";
const PRIMARY_CONTRAST = "ms-primary-contrast";
const PRIMARY = "ms-primary";
const SUCCESS_CONTRAST = "ms-success-contrast";
const SUCCESS = "ms-success";

/**
 *
 * @param {object} vars variables currently selected in the theme
 * @param {object} defaultVars variables of the theme used to initialize the pickers
 * @param {object} basic variables to use if a theme is not selected
 * @param {string} varName variable name to be use for comparison
 */
const hasColorChanged = (vars, defaultVars, basic, varName) => {
    return !tinycolor.equals(vars?.[varName], defaultVars?.[varName] || basic[varName]);
};


/**
 *
 * @param {object} basicVariables the variables used as default values if a theme is not selected
 * @param {object[]} themes the list of themes to show in the selector field
 * @param {boolean} customVariablesEnabled flag to enabled/disable the custom variables section
 */
function ConfigureThemes({
    themes = [],
    setSelectedTheme = () => {},
    onToggleCustomVariables = () => {},
    selectedTheme = {},
    customVariablesEnabled = false,
    context = {},
    basicVariables = {
        [MAIN_COLOR]: "#000000",
        [MAIN_BG_COLOR]: "#FFFFFF",
        [PRIMARY_CONTRAST]: "#FFFFFF",
        [PRIMARY]: "#0D7185",
        [SUCCESS_CONTRAST]: "#FFFFFF",
        [SUCCESS]: "#398439"
    }
}) {
    const triggerMain = useRef();
    const triggerPrimary = useRef();
    const triggerSuccess = useRef();
    const defaultVariables = (find(themes, {id: selectedTheme.id}) || {}).defaultVariables;
    const variables = {
        ...basicVariables,
        ...(defaultVariables),
        ...(selectedTheme?.variables)
    };

    const mostReadableTextColor = variables[MAIN_COLOR] && variables[MAIN_BG_COLOR]
        && !tinycolor.isReadable(variables[MAIN_COLOR], variables[MAIN_BG_COLOR])
        ? tinycolor.mostReadable(variables[MAIN_BG_COLOR], [variables[MAIN_COLOR], '#ffffff', '#000000'], { includeFallbackColors: true }).toHexString()
        : null;

    const mostReadablePrimaryContrastColor = variables[PRIMARY] && variables[PRIMARY_CONTRAST]
    && !tinycolor.isReadable(variables[PRIMARY], variables[PRIMARY_CONTRAST])
        ? tinycolor.mostReadable(variables[PRIMARY_CONTRAST], [variables[PRIMARY], '#ffffff', '#000000'], { includeFallbackColors: true }).toHexString()
        : null;

    const mostReadableSuccessContrastColor = variables[SUCCESS] && variables[SUCCESS_CONTRAST]
    && !tinycolor.isReadable(variables[SUCCESS], variables[SUCCESS_CONTRAST])
        ? tinycolor.mostReadable(variables[SUCCESS_CONTRAST], [variables[SUCCESS], '#ffffff', '#000000'], { includeFallbackColors: true }).toHexString()
        : null;

    const mostReadableSuccessPrimaryColor = variables[SUCCESS] && variables[PRIMARY]
    && !tinycolor.isReadable(variables[SUCCESS], variables[PRIMARY])
        ? tinycolor.mostReadable(variables[PRIMARY], [variables[SUCCESS], '#ffffff', '#000000'], { includeFallbackColors: true }).toHexString()
        : null;

    const hasMainColorChanged = hasColorChanged(variables, defaultVariables, basicVariables, MAIN_COLOR);
    const hasMainBgColorChanged = hasColorChanged(variables, defaultVariables, basicVariables, MAIN_BG_COLOR);
    const hasPrimaryContrastColorChanged = hasColorChanged(variables, defaultVariables, basicVariables, PRIMARY_CONTRAST);
    const hasPrimaryColorChanged = hasColorChanged(variables, defaultVariables, basicVariables, PRIMARY);
    const hasSuccessContrastColorChanged = hasColorChanged(variables, defaultVariables, basicVariables, SUCCESS_CONTRAST);
    const hasSuccessColorChanged = hasColorChanged(variables, defaultVariables, basicVariables, SUCCESS);

    return (
        <div className="configure-themes-step">
            <div className="choose-theme">
                <div className="text-center">
                    <Glyphicon glyph="dropper" style={{ fontSize: 128 }}/>
                </div>
                <h1 className="text-center"><Message msgId="contextCreator.configureThemes.title"/></h1>
                <ControlLabel className="label-theme"><Message msgId="contextCreator.configureThemes.themes"/></ControlLabel>
                <Select
                    clearable
                    onChange={(option)  => {
                        const themeSelected = option?.theme;
                        if (customVariablesEnabled) {
                            if (!themeSelected) {
                                // clicking on X to clear selection, restore basic variables
                                setSelectedTheme({
                                    variables: basicVariables
                                });
                            } else {
                                setSelectedTheme({
                                    ...themeSelected,
                                    variables: {...basicVariables, ...themeSelected.defaultVariables}
                                });
                            }
                        } else {
                            setSelectedTheme(themeSelected);
                        }
                    }}
                    value={selectedTheme?.id}
                    options={themes.map(theme => ({ value: theme.id, label: theme?.label && getMessageById(context, theme?.label) || theme?.id, theme }))}
                    noResultsText="contextCreator.configureThemes.noThemes"
                />
                <div className="custom-variables">
                    <ControlLabel><Message msgId="contextCreator.configureThemes.customVariables"/></ControlLabel>
                    <InfoPopover bsStyle="link" text={<Message msgId="contextCreator.configureThemes.tooltips.customColorsDescription" />}/>
                    <Button
                        key="clear-all"
                        onClick={() => {
                            setSelectedTheme({
                                ...selectedTheme,
                                variables: {...basicVariables, ...defaultVariables}
                            });
                        }}
                        className="clear-all no-border"
                    >clear all</Button>
                    <SwitchButton
                        onChange={(value) => {
                            onToggleCustomVariables();
                            if (value) {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables
                                });
                            }
                        }}
                        className="ms-geostory-settings-switch"
                        checked={customVariablesEnabled}/>
                </div>
                <div className="color-item">
                    <ControlLabel className="label-theme">
                        <Message msgId="contextCreator.configureThemes.main"/>
                        <InfoPopover bsStyle="link" text={<Message msgId="contextCreator.configureThemes.tooltips.main" />}/>
                        {mostReadableTextColor ? (<ToolbarPopover
                            useBody
                            className="ms-custom-theme-picker-popover"
                            ref={(popover) => {
                                if (popover) {
                                    triggerMain.current = popover.trigger;
                                }
                            }}
                            placement="top"
                            content={
                                <div>
                                    <HTML
                                        msgId="geostory.customizeTheme.alternativeTextColorPopover"
                                        msgParams={{
                                            color: mostReadableTextColor
                                        }}/>
                                    <Button
                                        bsSize="xs"
                                        bsStyle="primary"
                                        style={{
                                            margin: 'auto',
                                            display: 'block'
                                        }}
                                        onClick={() =>  {
                                            setSelectedTheme({
                                                ...selectedTheme,
                                                variables: {
                                                    ...variables,
                                                    [MAIN_COLOR]: mostReadableTextColor
                                                }
                                            });
                                            triggerMain.current?.hide?.();
                                        }}>
                                        <Message msgId="geostory.customizeTheme.useAlternativeTextColor"/>
                                    </Button>
                                </div>
                            }><Button
                                disabled={!customVariablesEnabled}
                                className="square-button-md no-border"
                                style={{ display: mostReadableTextColor ? 'block' : 'none' }}>
                                <Glyphicon glyph="exclamation-mark"/>
                            </Button>
                        </ToolbarPopover>) : null}
                    </ControlLabel>
                    <div className="color-choice">
                        <ColorSelector
                            disabled={!customVariablesEnabled}
                            onOpen={() => ({})}
                            color={variables[MAIN_COLOR]}
                            line={false}
                            disableAlpha={false}
                            onChangeColor={(color) => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables: {
                                        ...variables,
                                        [MAIN_COLOR]: tinycolor(color).toHexString()
                                    }
                                });
                            }}/>
                        <Button
                            disabled={!hasMainColorChanged || !customVariablesEnabled}
                            key={MAIN_COLOR}
                            onClick={() => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables: {
                                        ...variables,
                                        [MAIN_COLOR]: defaultVariables?.[MAIN_COLOR] || basicVariables[MAIN_COLOR]
                                    }
                                });
                            }}
                            className="no-border"
                        ><Glyphicon glyph="repeat" /></Button>
                    </div>
                </div>
                <div className="color-item">
                    <ControlLabel className="label-theme">
                        <Message msgId="contextCreator.configureThemes.background"/>
                        <InfoPopover bsStyle="link" text={<Message msgId="contextCreator.configureThemes.tooltips.background" />}/>
                    </ControlLabel>
                    <div className="color-choice">
                        <ColorSelector
                            disabled={!customVariablesEnabled}
                            onOpen={() => ({})}
                            color={variables[MAIN_BG_COLOR]}
                            line={false}
                            disableAlpha={false}
                            onChangeColor={(color) => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables: {
                                        ...variables,
                                        [MAIN_BG_COLOR]: tinycolor(color).toHexString()
                                    }
                                });
                            }}/>
                        <Button
                            disabled={!hasMainBgColorChanged || !customVariablesEnabled}
                            key={MAIN_BG_COLOR}
                            onClick={() => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables: {
                                        ...variables,
                                        [MAIN_BG_COLOR]: defaultVariables?.[MAIN_BG_COLOR] || basicVariables[MAIN_BG_COLOR]
                                    }
                                });
                            }}
                            className="no-border"
                        ><Glyphicon glyph="repeat" /></Button>
                    </div>
                </div>
                <div className="color-item">
                    <ControlLabel className="label-theme">
                        <Message msgId="contextCreator.configureThemes.primaryContrast"/>
                        <InfoPopover bsStyle="link" text={<Message msgId="contextCreator.configureThemes.tooltips.primaryContrast" />}/>
                        {mostReadablePrimaryContrastColor ? (<ToolbarPopover
                            useBody
                            className="ms-custom-theme-picker-popover"
                            ref={(popoverPrimary) => {
                                if (popoverPrimary) {
                                    triggerPrimary.current = popoverPrimary.trigger;
                                }
                            }}
                            placement="top"
                            content={
                                <div>
                                    <HTML
                                        msgId="geostory.customizeTheme.alternativeTextColorPopover"
                                        msgParams={{
                                            color: mostReadablePrimaryContrastColor
                                        }}/>
                                    <Button
                                        bsSize="xs"
                                        bsStyle="primary"
                                        style={{
                                            margin: 'auto',
                                            display: 'block'
                                        }}
                                        onClick={() =>  {
                                            setSelectedTheme({
                                                ...selectedTheme,
                                                variables: {
                                                    ...variables,
                                                    [PRIMARY_CONTRAST]: mostReadablePrimaryContrastColor
                                                }
                                            });
                                            triggerPrimary.current?.hide?.();
                                        }}>
                                        <Message msgId="geostory.customizeTheme.useAlternativeTextColor"/>
                                    </Button>
                                </div>
                            }><Button
                                disabled={!customVariablesEnabled}
                                className="square-button-md no-border"
                                style={{ display: mostReadablePrimaryContrastColor ? 'block' : 'none' }}>
                                <Glyphicon glyph="exclamation-mark"/>
                            </Button>
                        </ToolbarPopover>) : null }
                    </ControlLabel>
                    <div className="color-choice">
                        <ColorSelector
                            disabled={!customVariablesEnabled}
                            onOpen={() => ({})}
                            color={variables[PRIMARY_CONTRAST]}
                            line={false}
                            disableAlpha={false}
                            onChangeColor={(color) => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables: {
                                        ...variables,
                                        [PRIMARY_CONTRAST]: tinycolor(color).toHexString()
                                    }
                                });
                            }}/>
                        <Button
                            disabled={!hasPrimaryContrastColorChanged  || !customVariablesEnabled}
                            key={PRIMARY_CONTRAST}
                            onClick={() => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables: {
                                        ...variables,
                                        [PRIMARY_CONTRAST]: defaultVariables?.[PRIMARY_CONTRAST] || basicVariables[PRIMARY_CONTRAST]
                                    }
                                });
                            }}
                            className="no-border"
                        ><Glyphicon glyph="repeat" /></Button>
                    </div>
                </div>
                <div className="color-item">
                    <ControlLabel className="label-theme">
                        <Message msgId="contextCreator.configureThemes.primary"/>
                        <InfoPopover bsStyle="link" text={<Message msgId="contextCreator.configureThemes.tooltips.primary" />}/>
                    </ControlLabel>
                    <div className="color-choice">
                        <ColorSelector
                            disabled={!customVariablesEnabled}
                            onOpen={() => ({})}
                            color={variables[PRIMARY]}
                            line={false}
                            disableAlpha={false}
                            onChangeColor={(color) => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables: {
                                        ...variables,
                                        [PRIMARY]: tinycolor(color).toHexString()
                                    }
                                });
                            }}/>
                        <Button
                            disabled={!hasPrimaryColorChanged || !customVariablesEnabled}
                            key={PRIMARY}
                            onClick={() => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables: {
                                        ...variables,
                                        [PRIMARY]: defaultVariables?.[PRIMARY] || basicVariables[PRIMARY]
                                    }
                                });
                            }}
                            className="no-border"
                        ><Glyphicon glyph="repeat" /></Button>
                    </div>
                </div>
                <div className="color-item">
                    <ControlLabel className="label-theme">
                        <Message msgId="contextCreator.configureThemes.successContrast"/>
                        <InfoPopover bsStyle="link" text={<Message msgId="contextCreator.configureThemes.tooltips.successContrast" />}/>
                        {mostReadableSuccessContrastColor ? (<ToolbarPopover
                            useBody
                            className="ms-custom-theme-picker-popover"
                            ref={(popoverSuccess) => {
                                if (popoverSuccess) {
                                    triggerSuccess.current = popoverSuccess.trigger;
                                }
                            }}
                            placement="top"
                            content={
                                <div>
                                    <HTML
                                        msgId="geostory.customizeTheme.alternativeTextColorPopover"
                                        msgParams={{
                                            color: mostReadableSuccessContrastColor
                                        }}/>
                                    <Button
                                        bsSize="xs"
                                        bsStyle="primary"
                                        style={{
                                            margin: 'auto',
                                            display: 'block'
                                        }}
                                        onClick={() =>  {
                                            setSelectedTheme({
                                                ...selectedTheme,
                                                variables: {
                                                    ...variables,
                                                    [SUCCESS_CONTRAST]: mostReadableSuccessContrastColor
                                                }
                                            });
                                            triggerSuccess.current?.hide?.();
                                        }}>
                                        <Message msgId="geostory.customizeTheme.useAlternativeTextColor"/>
                                    </Button>
                                </div>
                            }><Button
                                disabled={!customVariablesEnabled}
                                className="square-button-md no-border"
                                style={{ display: mostReadableSuccessContrastColor ? 'block' : 'none' }}>
                                <Glyphicon glyph="exclamation-mark"/>
                            </Button>
                        </ToolbarPopover>) : null }
                    </ControlLabel>
                    <div className="color-choice">
                        <ColorSelector
                            disabled={!customVariablesEnabled}
                            onOpen={() => ({})}
                            color={variables[SUCCESS_CONTRAST]}
                            line={false}
                            disableAlpha={false}
                            onChangeColor={(color) => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables: {
                                        ...variables,
                                        [SUCCESS_CONTRAST]: tinycolor(color).toHexString()
                                    }
                                });
                            }}/>
                        <Button
                            disabled={!hasSuccessContrastColorChanged  || !customVariablesEnabled}
                            key={SUCCESS_CONTRAST}
                            onClick={() => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables: {
                                        ...variables,
                                        [SUCCESS_CONTRAST]: defaultVariables?.[SUCCESS_CONTRAST] || basicVariables[SUCCESS_CONTRAST]
                                    }
                                });
                            }}
                            className="no-border"
                        ><Glyphicon glyph="repeat" /></Button>
                    </div>
                </div>
                <div className="color-item">
                    <ControlLabel className="label-theme">
                        <Message msgId="contextCreator.configureThemes.success"/>
                        <InfoPopover bsStyle="link" text={<Message msgId="contextCreator.configureThemes.tooltips.success" />}/>
                        {mostReadableSuccessPrimaryColor ? (<ToolbarPopover
                            useBody
                            className="ms-custom-theme-picker-popover"
                            ref={(popoverSuccess) => {
                                if (popoverSuccess) {
                                    triggerSuccess.current = popoverSuccess.trigger;
                                }
                            }}
                            placement="top"
                            content={
                                <div>
                                    <HTML
                                        msgId="contextCreator.configureThemes.alternativeTextPrimarySecondary"
                                        msgParams={{
                                            color: mostReadableSuccessPrimaryColor
                                        }}/>
                                    <Button
                                        bsSize="xs"
                                        bsStyle="primary"
                                        style={{
                                            margin: 'auto',
                                            display: 'block'
                                        }}
                                        onClick={() =>  {
                                            setSelectedTheme({
                                                ...selectedTheme,
                                                variables: {
                                                    ...variables,
                                                    [SUCCESS]: mostReadableSuccessPrimaryColor
                                                }
                                            });
                                            triggerSuccess.current?.hide?.();
                                        }}>
                                        <Message msgId="geostory.customizeTheme.useAlternativeTextColor"/>
                                    </Button>
                                </div>
                            }><Button
                                disabled={!customVariablesEnabled}
                                className="square-button-md no-border"
                                style={{ display: mostReadableSuccessPrimaryColor ? 'block' : 'none' }}>
                                <Glyphicon glyph="exclamation-mark"/>
                            </Button>
                        </ToolbarPopover>) : null }
                    </ControlLabel>
                    <div className="color-choice">
                        <ColorSelector
                            disabled={!customVariablesEnabled}
                            onOpen={() => ({})}
                            color={variables[SUCCESS]}
                            line={false}
                            disableAlpha={false}
                            onChangeColor={(color) => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables: {
                                        ...variables,
                                        [SUCCESS]: tinycolor(color).toHexString()
                                    }
                                });
                            }}/>
                        <Button
                            disabled={!hasSuccessColorChanged || !customVariablesEnabled}
                            key={SUCCESS}
                            onClick={() => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    variables: {
                                        ...variables,
                                        [SUCCESS]: defaultVariables?.[SUCCESS] || basicVariables[SUCCESS]
                                    }
                                });
                            }}
                            className="no-border"
                        ><Glyphicon glyph="repeat" /></Button>
                    </div>
                </div>
                <p>
                    <Message msgId="contextCreator.configureThemes.guidelines" />
                </p>
            </div>
        </div>);
}
export default ConfigureThemes;
