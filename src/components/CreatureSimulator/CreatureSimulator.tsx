import React, { MutableRefObject, useEffect } from 'react';
import { useCreatureConfig } from "@/contexts/CreatureConfigProvider";
import {initializeMovementState, setupEventListeners} from "@/utils/movement";
import {getInitialCreatureSegments, updateCreatureOnCanvas} from "@/creature/creature";

interface CreatureSimulatorProps {
    canvasRef: MutableRefObject<HTMLCanvasElement | null>;
}

const CreatureSimulator: React.FC<CreatureSimulatorProps> = ({ canvasRef }) => {
    const { creatureConfig } = useCreatureConfig();

    useEffect(() => {
        const canvas = canvasRef!.current;
        const ctx = canvas!.getContext('2d');
        if (!canvas || !ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        const { moveToX, moveToY, isMouseDown , isTouchActive} = initializeMovementState(width, height);

        const cleanupListeners = setupEventListeners(canvas, moveToX, moveToY, isMouseDown, isTouchActive);

        const creatureSegments = getInitialCreatureSegments(creatureConfig, width, height);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            updateCreatureOnCanvas(ctx, creatureConfig, moveToX.current, moveToY.current, width, height, creatureSegments, false    );
            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cleanupListeners();
        };
    }, [canvasRef, creatureConfig]);

    return null;
};

export default CreatureSimulator;
