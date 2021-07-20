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

import Message from '../I18N/Message';
import HTML from '../I18N/HTML';
import Button from '../misc/Button';
import ColorSelector from '../style/ColorSelector';
import ToolbarPopover from '../geostory/common/ToolbarPopover';
import InfoPopover from '../widgets/widget/InfoPopover';


import localizedProps from '../misc/enhancers/localizedProps';
import { getMessageById } from '../../utils/LocaleUtils';

const Select = localizedProps("noResultsText")(ReactSelect);
const MAIN_COLOR = "ms-main-color";
const MAIN_BG_COLOR = "ms-main-bg";
const PRIMARY = "ms-primary";
const PRIMARY_CONTRAST = "ms-primary-contrast";


function ConfigureThemes ({
    themes = [],
    setSelectedTheme = () => {},
    selectedTheme = {},
    disabled = false,
    context = {},
    defaultColors = {
        [MAIN_COLOR]: "#000000",
        [MAIN_BG_COLOR] : "#FFFFFF",
        [PRIMARY] : "#078aa3",
        [PRIMARY_CONTRAST] : "#FFFFFF"
    }
}) {
    const triggerMain = useRef();
    const triggerPrimary = useRef();
    const colors = {
        ...defaultColors,
        ...(selectedTheme.variables),
        ...(selectedTheme.colors)
    };

    const mostReadableTextColor = colors[MAIN_COLOR] && colors[MAIN_BG_COLOR]
        && !tinycolor.isReadable(colors[MAIN_COLOR], colors[MAIN_BG_COLOR])
        ? tinycolor.mostReadable(colors[MAIN_BG_COLOR], [colors[MAIN_COLOR], '#ffffff', '#000000'], { includeFallbackColors: true }).toHexString()
        : null;

    const mostReadablePrimaryColor = colors[PRIMARY] && colors[PRIMARY_CONTRAST]
    && !tinycolor.isReadable(colors[PRIMARY], colors[PRIMARY_CONTRAST])
    ? tinycolor.mostReadable(colors[PRIMARY_CONTRAST], [colors[PRIMARY], '#ffffff', '#000000'], { includeFallbackColors: true }).toHexString()
    : null;

    const hasMainColorChanged = !tinycolor.equals(colors?.[MAIN_COLOR], selectedTheme?.variables?.[MAIN_COLOR] || defaultColors[MAIN_COLOR]);
    const hasMainBgColorChanged = !tinycolor.equals(colors?.[MAIN_BG_COLOR], selectedTheme?.variables?.[MAIN_BG_COLOR] || defaultColors[MAIN_BG_COLOR]);
    const hasPrimaryColorChanged = !tinycolor.equals(colors?.[PRIMARY], selectedTheme?.variables?.[PRIMARY] || defaultColors[PRIMARY]);
    const hasPrimaryContrastColorChanged = !tinycolor.equals(colors?.[PRIMARY_CONTRAST], selectedTheme?.variables?.[PRIMARY_CONTRAST] || defaultColors[PRIMARY_CONTRAST]);

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
                    onChange={(option)  => setSelectedTheme(option?.theme)}
                    value={selectedTheme?.id}
                    options={themes.map(theme => ({ value: theme.id, label: theme?.label && getMessageById(context, theme?.label) || theme?.id, theme }))}
                    disabled={disabled}
                    noResultsText="contextCreator.configureThemes.noThemes"
                />
                <div className="custom-variables">
                    <h3 className="text-center"><Message msgId="contextCreator.configureThemes.customColors"/></h3>
                    <InfoPopover bsStyle="link" text={<Message msgId="contextCreator.configureThemes.customColorsDescription" />}/>
                    <Button
                        key="clear-all"
                        onClick={() => {
                            setSelectedTheme({
                                ...selectedTheme,
                                colors: {...defaultColors, ...(selectedTheme.variables) }
                            })
                        }}
                        className="clear-all no-border"
                    >clear all</Button>
                </div>
                <div className="color-item">
                    <ControlLabel className="label-theme">
                        <Message msgId="contextCreator.configureThemes.main"/>
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
                                                colors: {
                                                    ...colors,
                                                    [MAIN_COLOR]: mostReadableTextColor
                                                }
                                            });
                                            triggerMain.current?.hide?.();
                                        }}>
                                        <Message msgId="geostory.customizeTheme.useAlternativeTextColor"/>
                                    </Button>
                                </div>
                            }><Button
                                className="square-button-md no-border"
                                style={{ display: mostReadableTextColor ? 'block' : 'none' }}>
                                <Glyphicon glyph="exclamation-mark"/>
                            </Button>
                        </ToolbarPopover>) : null}
                    </ControlLabel>
                    <div className="color-choice">
                        <ColorSelector
                            onOpen={() => ({})}
                            color={colors[MAIN_COLOR]}
                            line={false}
                            disableAlpha={false}
                            onChangeColor={(color) => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    colors: {
                                        ...colors,
                                        [MAIN_COLOR]: tinycolor(color).toHexString()
                                    }
                                })
                            }}/>
                        <Button
                            disabled={!hasMainColorChanged}
                            key={MAIN_COLOR}
                            onClick={() => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    colors: {
                                        ...colors,
                                        [MAIN_COLOR]: selectedTheme?.variables?.[MAIN_COLOR] || defaultColors[MAIN_COLOR]
                                    }
                                })
                            }}
                            className="no-border"
                        ><Glyphicon glyph="remove" /></Button>
                    </div>
                </div>
                <div className="color-item">
                    <ControlLabel className="label-theme">
                        <Message msgId="contextCreator.configureThemes.background"/>
                    </ControlLabel>
                    <div className="color-choice">
                        <ColorSelector
                            onOpen={() => ({})}
                            color={colors[MAIN_BG_COLOR]}
                            line={false}
                            disableAlpha={false}
                            onChangeColor={(color) => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    colors: {
                                        ...colors,
                                        [MAIN_BG_COLOR]: tinycolor(color).toHexString()
                                    }
                                })
                            }}/>
                        <Button
                            disabled={!hasMainBgColorChanged}
                            key={MAIN_BG_COLOR}
                            onClick={() => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    colors: {
                                        ...colors,
                                        [MAIN_BG_COLOR]: selectedTheme?.variables?.[MAIN_BG_COLOR] || defaultColors[MAIN_COLOR]
                                    }
                                })
                            }}
                            className="no-border"
                        ><Glyphicon glyph="remove" /></Button>
                    </div>
                </div>
                <div className="color-item">
                    <ControlLabel className="label-theme">
                        <Message msgId="contextCreator.configureThemes.primary"/>
                        {mostReadablePrimaryColor ? (<ToolbarPopover
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
                                            color: mostReadablePrimaryColor
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
                                                colors: {
                                                    ...colors,
                                                    [PRIMARY]: mostReadablePrimaryColor
                                                }
                                            });
                                            triggerPrimary.current?.hide?.();
                                        }}>
                                        <Message msgId="geostory.customizeTheme.useAlternativeTextColor"/>
                                    </Button>
                                </div>
                            }><Button
                                className="square-button-md no-border"
                                style={{ display: mostReadablePrimaryColor ? 'block' : 'none' }}>
                                <Glyphicon glyph="exclamation-mark"/>
                            </Button>
                        </ToolbarPopover>) : null }
                    </ControlLabel>
                    <div className="color-choice">
                        <ColorSelector
                            onOpen={() => ({})}
                            color={colors[PRIMARY]}
                            line={false}
                            disableAlpha={false}
                            onChangeColor={(color) => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    colors: {
                                        ...colors,
                                        [PRIMARY]: tinycolor(color).toHexString()
                                    }
                                })
                            }}/>
                        <Button
                            disabled={!hasPrimaryColorChanged}
                            key={PRIMARY}
                            onClick={() => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    colors: {
                                        ...colors,
                                        [PRIMARY]: selectedTheme?.variables?.[PRIMARY] || defaultColors[MAIN_COLOR]
                                    }
                                })
                            }}
                            className="no-border"
                        ><Glyphicon glyph="remove" /></Button>
                    </div>
                </div>
                <div className="color-item">
                    <ControlLabel className="label-theme">
                        <Message msgId="contextCreator.configureThemes.primaryContrast"/>
                    </ControlLabel>
                    <div className="color-choice">
                        <ColorSelector
                            onOpen={() => ({})}
                            color={colors[PRIMARY_CONTRAST]}
                            line={false}
                            disableAlpha={false}
                            onChangeColor={(color) => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    colors: {
                                        ...colors,
                                        [PRIMARY_CONTRAST]: tinycolor(color).toHexString()
                                    }
                                })
                            }}/>
                        <Button
                            disabled={!hasPrimaryContrastColorChanged}
                            key={PRIMARY_CONTRAST}
                            onClick={() => {
                                setSelectedTheme({
                                    ...selectedTheme,
                                    colors: {
                                        ...colors,
                                        [PRIMARY_CONTRAST]: selectedTheme?.variables?.[PRIMARY_CONTRAST] || defaultColors[MAIN_COLOR]
                                    }
                                })
                            }}
                            className="no-border"
                        ><Glyphicon glyph="remove" /></Button>
                    </div>
                </div>
            </div>
        </div>);
};
export default ConfigureThemes;
