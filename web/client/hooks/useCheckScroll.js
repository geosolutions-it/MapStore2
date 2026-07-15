import { useEffect, useRef, useState } from 'react';

/**
 * Provides native horizontal scroll controls for an overflowing element.
 * @param {object} options hook options
 * @param {any} options.data data that changes the scrollable content
 * @return {array} scroll element ref, control visibility, disabled states and scroll action
 */
export default function useCheckScroll({ data }) {
    const scrollRef = useRef(null);
    const [isLeftDisabled, setIsLeftDisabled] = useState(true);
    const [isRightDisabled, setIsRightDisabled] = useState(true);
    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const element = scrollRef.current;
            if (!element) {
                return;
            }

            const { scrollLeft, scrollWidth, clientWidth } = element;
            const canScroll = scrollWidth > clientWidth + 1;
            setShowButtons(canScroll);
            setIsLeftDisabled(scrollLeft <= 0);
            setIsRightDisabled(scrollLeft + clientWidth >= scrollWidth - 1);
        };

        const element = scrollRef.current;
        if (element) {
            handleScroll();
            element.addEventListener('scroll', handleScroll);
            window.addEventListener('resize', handleScroll);
        }

        return () => {
            element?.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [data, showButtons]);

    const scroll = (direction) => {
        const element = scrollRef.current;
        if (!element) {
            return;
        }
        const scrollAmount = element.clientWidth * 0.8;
        element.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    return [scrollRef, showButtons, isLeftDisabled, isRightDisabled, scroll];
}
