import React from "react";

const Extension = ({ value = 0, onIncrease }) => {
    return <div style={{ position: "absolute" }}><span>{value}</span><button onClick={onIncrease}>+</button></div>;
};

export default Extension;
