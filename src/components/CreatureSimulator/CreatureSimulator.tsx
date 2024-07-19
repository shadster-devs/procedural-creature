import React, { MutableRefObject, useEffect } from 'react';
import { getInitialCreatureSegments, updateCreatureOnCanvas} from "@/canvasUtils/creature";
import {useCreatureConfig} from "@/contexts/CreatureConfigProvider";

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

        let mouseX = width / 2;
        let mouseY = height / 2;
        let isMouseDown = false;

        const handleMouseDown = () => { isMouseDown = true; };
        const handleMouseUp = () => { isMouseDown = false; };
        const handleMouseMove = (event: MouseEvent) => {
            if (!isMouseDown) return;
            mouseX = event.clientX - canvas.getBoundingClientRect().left;
            mouseY = event.clientY - canvas.getBoundingClientRect().top;
        };


        const creatureSegments = getInitialCreatureSegments(creatureConfig, width, height);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            updateCreatureOnCanvas(ctx, creatureConfig, mouseX, mouseY, width, height,creatureSegments, false);
            requestAnimationFrame(animate);
        };

        animate();

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [canvasRef, creatureConfig]);

    return null;
};

export default CreatureSimulator;
