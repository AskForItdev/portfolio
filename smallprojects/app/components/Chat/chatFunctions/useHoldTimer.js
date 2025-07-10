import { useCallback, useRef, useState } from 'react';

export const useHoldTimer = (
  setMenuVisible = null,
  handleLongPress,
  handleShortPress,

  holdDuration = 500
) => {
  const [menuData, setMenuData] = useState(null);
  const [pressType, setPressType] = useState(null);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimeout = useRef(null);
  const touchStartY = useRef(0);
  const touchMoved = useRef(false);

  const startHoldTimer = useCallback(
    (e, data) => {
      e.persist();

      console.log('startHoldTimer called with data:', data);
      setMenuData(data); // Set data in state
      setIsHolding(false);
      setPressType(null);

      holdTimeout.current = setTimeout(() => {
        console.log(
          'Hold duration reached, setting menu visible with data:',
          data
        );
        setIsHolding(true); // Mark as holding
        setPressType('long');
        handleLongPress(data); // Trigger long press logic with menuData
        if (setMenuVisible !== null)
          setMenuVisible(true, data); // Trigger menu visibility
      }, holdDuration);
    },
    [setMenuVisible, holdDuration, handleLongPress]
  );

  const clearHoldTimer = useCallback(() => {
    console.log('clearHoldTimer called');
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current); // Clear the timeout
      holdTimeout.current = null; // Reset timeout ref
    }
    if (!isHolding) {
      setPressType('short'); // Set press type to 'short'
    }
    setIsHolding(false); // Reset holding state
  }, [isHolding]);

  const handleMouseDown = useCallback(
    (e, data) => {
      console.log('Mouse down', data);
      if (e.button === 2) e.preventDefault();
      startHoldTimer(e, data);
    },
    [startHoldTimer]
  );

  const handleMouseUp = useCallback(() => {
    console.log('Mouse up, clearing timer');
    clearHoldTimer();
    if (isHolding) {
      console.log(
        'Long press detected with data:',
        menuData
      );
    } else {
      console.log(
        'Short press detected with data:',
        menuData
      );
      handleShortPress(menuData); // Trigger short press logic with menuData
    }
  }, [
    clearHoldTimer,
    handleShortPress,
    isHolding,
    menuData,
  ]);

  const handleTouchStart = useCallback(
    (e, data) => {
      console.log('Touch start', data);
      touchStartY.current = e.touches[0].clientY;
      touchMoved.current = false;
      startHoldTimer(e, data);
    },
    [startHoldTimer]
  );

  const handleTouchMove = useCallback(
    (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = Math.abs(
        currentY - touchStartY.current
      );

      // Only consider it a scroll if moved more than 10px
      if (deltaY > 10) {
        touchMoved.current = true;
        clearHoldTimer();
        // Prevent the click event from firing
        e.preventDefault();
      }
    },
    [clearHoldTimer]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      console.log('Touch end');
      if (touchMoved.current) {
        // If we scrolled, prevent the click
        e.preventDefault();
        return;
      }

      clearHoldTimer();
      if (isHolding) {
        console.log(
          'Long press detected with data:',
          menuData
        );
      } else {
        console.log(
          'Short press detected with data:',
          menuData
        );
        handleShortPress(menuData);
      }
    },
    [clearHoldTimer, handleShortPress, isHolding, menuData]
  );

  const handleTouchCancel = useCallback(() => {
    console.log('Touch cancel');
    clearHoldTimer();
  }, [clearHoldTimer]);

  return {
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
    handleTouchMove,
    pressType,
    menuData, // Expose menuData to the outside world
  };
};
