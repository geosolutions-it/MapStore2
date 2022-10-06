import React, { useMemo } from 'react';
import Select from 'react-select';
import { Glyphicon } from 'react-bootstrap';
import classnames from 'classnames';

import Button from "../../../components/misc/Button";

const SingleWidgetControls = ({ options }) => {
    const maxIndex = options.dropdownWidgets.length - 1;
    const activeIndex = options.dropdownWidgets.findIndex(el => el.id === options.activeWidget.id);
    const nextIndex = activeIndex === maxIndex ? 0 : activeIndex + 1;
    const prevIndex = activeIndex === 0 ? maxIndex : activeIndex - 1;
    return (
        <div className="widget-selector">
            <Button
                className="previous-widget btn-sm no-border"
                onPointerDown={() => options.setActiveWidget(options.dropdownWidgets[prevIndex])}
            >
                <Glyphicon
                    glyph="arrow-left"/>
            </Button>
            <Select
                openOnFocus
                clearable={false}
                searchable={false}
                value={{ id: options.activeWidget.id, label: options.activeWidget.title}}
                onChange={(w) => options.setActiveWidget(options.dropdownWidgets.find(el => el.id === w.value))}
                options={useMemo(() =>
                    options.dropdownWidgets.map(w => ({value: w.id, label: w.title, active: w.id === options.activeWidget.id})),
                [options.dropdownWidgets])}
                optionComponent={({option, onSelect}) => <div
                    className={classnames({
                        "Select-option": true,
                        "is-focused": option.active
                    })}
                    onPointerDown={(e) => onSelect(option, e)}
                >
                    {option.label}
                </div>}
            />
            <Button
                className="next-widget btn-sm no-border"
                onPointerDown={() => options.setActiveWidget(options.dropdownWidgets[nextIndex])}
            >
                <Glyphicon
                    glyph="arrow-right"/>
            </Button>
        </div>
    );
};

export default SingleWidgetControls;
