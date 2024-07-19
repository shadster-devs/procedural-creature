import React, { MutableRefObject } from 'react';
import {useCreatureState} from "@/contexts/CreatureStateProvider";
import {constrainAngle} from "@/components/CreatureSimulator/utils";

interface CreatureSimulatorProps {
    canvasRef: MutableRefObject<HTMLCanvasElement | null>;
}

const CreatureSimulator: React.FC<CreatureSimulatorProps> = ({ canvasRef }) => {

    const {creatureState} = useCreatureState();

    React.useEffect(() => {

        //canvas part//
        const canvas = canvasRef!.current;
        const ctx = canvas!.getContext('2d');
        if (!canvas || !ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        //canvas part//


        // mouse handling part //
        let mouseX = width / 2;
        let mouseY = height / 2;


        let isMouseDown = false;

        const handleMouseDown = () => {
            isMouseDown = true;
        };

        const handleMouseUp = () => {
            isMouseDown = false;
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!isMouseDown) return
            mouseX = event.clientX - canvas.getBoundingClientRect().left;
            mouseY = event.clientY - canvas.getBoundingClientRect().top;
        };
        // mouse handling part //


        // rendering the creature //
        const circles = Array.from({ length: creatureState.numOfSegments }, (_, i) => ({
            x: width / 2 ,
            y: height / 2,
            radius: creatureState.segmentsRadius[i],
            angle : 0,
        }));

        const updateSegmentPositions = () => {
            const headPos = circles[0];
            const targetPos = {
                x : headPos.x + (mouseX - headPos.x) * 0.1,
                y : headPos.y + (mouseY - headPos.y) * 0.1
            }

            circles[0].angle = Math.atan2(targetPos.y - headPos.y, targetPos.x - headPos.x);
            circles[0].x = targetPos.x;
            circles[0].y = targetPos.y;

            for (let i = 1; i < circles.length; i++){
                let currAngle = Math.atan2(circles[i-1].y - circles[i].y, circles[i-1].x - circles[i].x);
                circles[i].angle = constrainAngle(currAngle, circles[i - 1].angle, creatureState.angleConstraint);
                circles[i].x = circles[i - 1].x - Math.cos(circles[i].angle) * creatureState.linkSize;
                circles[i].y = circles[i - 1].y - Math.sin(circles[i].angle) * creatureState.linkSize;
            }
        }

        const drawCircles = () => {
            circles.forEach((circle, index) => {
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
                ctx.strokeStyle = 'black';
                ctx.stroke();
            });
        };

        const drawCreature = () => {
            ctx.strokeStyle = 'black';
            ctx.fillStyle = '#AC3931';
            ctx.lineWidth = 4;


            // Array to hold control points
            const points = [];

            // Calculate control points for each segment
            for (let i = 0; i < circles.length; i++) {
                const { x, y } = circles[i];

                // Calculate the direction to the next joint
                let nextX, nextY;
                if (i < circles.length - 1) {
                    nextX = circles[i + 1].x - x;
                    nextY = circles[i + 1].y - y;
                } else {
                    nextX = - circles[i - 1].x + x;
                    nextY = - circles[i - 1].y + y;
                }

                // Normalize the direction
                const length = Math.sqrt(nextX * nextX + nextY * nextY);
                const normX = nextX / length;
                const normY = nextY / length;

                // Calculate control points
                let controlX1, controlY1, controlX2, controlY2;
                    controlX1 = x + normY * circles[i].radius;
                    controlY1 = y - normX * circles[i].radius;
                    controlX2 = x - normY * circles[i].radius;
                    controlY2 = y + normX * circles[i].radius;

                points.push({ controlX1, controlY1, controlX2, controlY2 });
            }


            // Draw the outline of the snake
            ctx.beginPath();
            ctx.lineCap = 'round';

            // Move to the first control point
            ctx.moveTo(points[0].controlX1, points[0].controlY1);
            let prevPoint = points[0];

            // Draw the right side of the snake
            for (let i = 0; i < points.length; i++) {
                // ctx.lineTo(points[i].controlX1, points[i].controlY1);
                ctx.quadraticCurveTo(prevPoint.controlX1, prevPoint.controlY1, points[i].controlX1, points[i].controlY1);
                prevPoint = points[i];
            }

            {
                let slope = (points[points.length-1].controlY2 - points[points.length-1].controlY1)/(points[points.length-1].controlX2 - points[points.length-1].controlX1)

                let startAngle = Math.atan(slope)
                if (points[points.length-1].controlX1 < points[points.length-1].controlX2) {
                    startAngle += Math.PI;
                }
                ctx.arc(circles[points.length-1].x, circles[points.length-1].y, creatureState.segmentsRadius[points.length-1], startAngle, startAngle + Math.PI)
            }

            ctx.moveTo(points[points.length-1].controlX2, points[points.length-1].controlY2);
            prevPoint = points[points.length-1];

            // Draw the left side of the snake in reverse
            for (let i = points.length - 2; i >= 0; i--) {
                // ctx.lineTo(points[i].controlX2, points[i].controlY2);
                ctx.quadraticCurveTo(prevPoint.controlX2, prevPoint.controlY2, points[i].controlX2, points[i].controlY2);
                prevPoint = points[i];

            }

            {
                let slope = (points[0].controlY2 - points[0].controlY1)/(points[0].controlX2 - points[0].controlX1)
                let startAngle = Math.atan(slope)
                if (points[0].controlX2 < points[0].controlX1) {
                    startAngle += Math.PI;
                }
                ctx.arc(circles[0].x, circles[0].y, creatureState.segmentsRadius[0], startAngle, startAngle + Math.PI)
            }



            ctx.fill();
            ctx.stroke();


            // === START EYES ===
            ctx.fillStyle = 'black';
            const head = circles[0];

            ctx.beginPath();
            ctx.arc(head.x + 12, head.y - 12, 5, 0, Math.PI * 2);
            ctx.arc(head.x - 12, head.y - 12, 5, 0, Math.PI * 2);
            ctx.fill();
            // === END EYES ===
        }




        const display = () => {
            ctx.clearRect(0, 0, width, height);
            updateSegmentPositions();
            // drawCircles();
            drawCreature();
            requestAnimationFrame(display);
        };


        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        display();

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);

        };
    }, [canvasRef, creatureState]);

    return null;
};

export default CreatureSimulator;
