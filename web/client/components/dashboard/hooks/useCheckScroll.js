import { useEffect, useRef, useState } from "react";

export default function useCheckScroll({ data }) {
    const scrollRef = useRef(null);
    const [isLeftDisabled, setIsLeftDisabled] = useState(true);
    const [isRightDisabled, setIsRightDisabled] = useState(true);
    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const el = scrollRef.current;
            if (!el) return;

            const { scrollLeft, scrollWidth, clientWidth } = el;

            // Show buttons only if scrolling is possible
            const canScroll = scrollWidth > clientWidth + 1;
            setShowButtons(canScroll);

            // Disable states for buttons
            setIsLeftDisabled(scrollLeft <= 0);
            setIsRightDisabled(scrollLeft + clientWidth >= scrollWidth - 1);
        };

        const el = scrollRef.current;
        if (el) {
            handleScroll(); // initial
            el.addEventListener("scroll", handleScroll);
            window.addEventListener("resize", handleScroll);
        }

        return () => {
            el?.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [data]);

    const scroll = (direction) => {
        const el = scrollRef.current;
        if (!el) return;
        const scrollAmount = el.clientWidth * 0.8;
        el.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    };

    return [scrollRef, showButtons, isLeftDisabled, isRightDisabled, scroll];
}
