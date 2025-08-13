const VERTICAL_GAP = 10;
const HORIZONTAL_OFFSET = 5;

export function setFloatingElemPosition(
  targetRect,
  floatingElem,
  anchorElem,
  verticalGap = VERTICAL_GAP,
  horizontalOffset = HORIZONTAL_OFFSET,
) {
  if (!targetRect || !floatingElem) {
    if (floatingElem) {
      floatingElem.style.opacity = '0';
      floatingElem.style.transform = 'translate(-10000px, -10000px)';
    }
    return;
  }

  try {
    const floatingElemRect = floatingElem.getBoundingClientRect();
    
    let top = targetRect.top - floatingElemRect.height - verticalGap;
    let left = targetRect.left - horizontalOffset;

    // Simple positioning - above the selection
    if (top < 0) {
      top = targetRect.bottom + verticalGap;
    }

    // Keep within viewport
    if (left < 0) {
      left = horizontalOffset;
    }
    
    const maxLeft = window.innerWidth - floatingElemRect.width - horizontalOffset;
    if (left > maxLeft) {
      left = maxLeft;
    }

    floatingElem.style.opacity = '1';
    floatingElem.style.position = 'fixed';
    floatingElem.style.top = `${top}px`;
    floatingElem.style.left = `${left}px`;
    floatingElem.style.transform = 'none';
  } catch (error) {
    console.warn('Error positioning floating element:', error);
    floatingElem.style.opacity = '0';
  }
}