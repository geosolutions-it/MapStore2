import ContainerDimensions from "react-container-dimensions";
import React from "react";

/**
 * HOC to get dimensions of the Component's container
 * @param Component
 * @returns {function(*)}
 */
export const withContainerDimensions = (Component) => props =>
    <ContainerDimensions handleWidth >{({ width, height } = {}) =>
        <Component {...props} width={width} height={height} />}
    </ContainerDimensions>;
