import React, { MutableRefObject, useEffect } from 'react';
import { useCreatureState } from '@/contexts/CreatureStateProvider';
import {getInitialCreatureSegments, updateCreatureOnCanvas} from "@/canvasUtils/creature";

interface CreatureSimulatorProps {
    canvasRef: MutableRefObject<HTMLCanvasElement | null>;
}

const CreatureSimulator: React.FC<CreatureSimulatorProps> = ({ canvasRef }) => {
    const { creatureState } = useCreatureState();

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


        const creatureSegments = getInitialCreatureSegments(creatureState, width, height);

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            updateCreatureOnCanvas(ctx, creatureState, mouseX, mouseY, width, height,creatureSegments);
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
    }, [canvasRef, creatureState]);

    return null;
};

export default CreatureSimulator;
