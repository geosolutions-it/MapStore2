import Button from "../../../misc/Button";
import {Glyphicon} from "react-bootstrap";
import React from "react";

export default ({currentIndex, contents = [], onTraverseCard = () => {}}) => {
    return (
        <>
            <Button
                className="ms-carousel-slider left-arrow"
                disabled={currentIndex === 0}
                onClick={() => onTraverseCard()}>
                < Glyphicon style={{fontSize: 22}} glyph={'chevron-left'}/>
            </Button>
            <Button
                className="ms-carousel-slider right-arrow"
                onClick={() => onTraverseCard('right')}
                disabled={currentIndex === contents.length - 1}>
                < Glyphicon style={{fontSize: 22}} glyph={'chevron-right'}/>
            </Button>
        </>
    );
};
