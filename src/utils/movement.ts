// movementUtils.ts

// Function to initialize movement state
export const initializeMovementState = (width: number, height: number) => {
    return {
        moveToX: { current: width / 2 },
        moveToY: { current: height / 2 },
        isMouseDown: { current: false },
        isTouchActive: { current: false },
    };
};

// Function to handle movement based on event type
export const handleMovement = (
    event: MouseEvent | KeyboardEvent | TouchEvent,
    isMouseDown: boolean,
    moveToX: { current: number },
    moveToY: { current: number },
    step = 20
) => {
    if (event instanceof MouseEvent) {
        if (isMouseDown) {
            moveToX.current = event.clientX - (event.target as HTMLElement).getBoundingClientRect().left/10;
            moveToY.current = event.clientY - (event.target as HTMLElement).getBoundingClientRect().top/10;
        }
    } else if (event instanceof KeyboardEvent) {
        switch (event.key) {
            case 'ArrowUp':
                moveToY.current -= step;
                break;
            case 'ArrowDown':
                moveToY.current += step;
                break;
            case 'ArrowLeft':
                moveToX.current -= step;
                break;
            case 'ArrowRight':
                moveToX.current += step;
                break;
            default:
                break;
        }
    } else if (event instanceof TouchEvent) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            moveToX.current = touch.clientX - (event.target as HTMLElement).getBoundingClientRect().left/10;
            moveToY.current = touch.clientY - (event.target as HTMLElement).getBoundingClientRect().top/10;
        }
    }
};

// Function to set up event listeners for canvas and window
export const setupEventListeners = (
    canvas: HTMLCanvasElement,
    moveToX: { current: number },
    moveToY: { current: number },
    isMouseDown: { current: boolean },
    isTouchActive: { current: boolean }
) => {
    const handleMouseDown = () => { isMouseDown.current = true; };
    const handleMouseUp = () => { isMouseDown.current = false; };
    const handleMouseMove = (event: MouseEvent) => handleMovement(event, isMouseDown.current, moveToX, moveToY);
    const handleKeyDown = (event: KeyboardEvent) => handleMovement(event, isMouseDown.current, moveToX, moveToY);

    const handleTouchStart = () => { isTouchActive.current = true; };
    const handleTouchEnd = () => { isTouchActive.current = false; };
    const handleTouchMove = (event: TouchEvent) => handleMovement(event, isTouchActive.current, moveToX, moveToY);

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Return a cleanup function to remove listeners
    return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('keydown', handleKeyDown);

        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
    };
};
