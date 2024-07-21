//spine.ts

import {constrainAngle} from "@/utils/math";
import {CreatureConfig} from "@/contexts/CreatureConfigProvider";


export type SpineSegment = {
    x: number;
    y: number;
    radius: number;
    angle: number;
};

export const getInitialSpineArray = (creatureConfig : CreatureConfig, width : number, height :number) => {

    const {numOfSegments, segmentsRadius, linkSize} = creatureConfig.spine;
    const spineSegments: SpineSegment[] = [];
    const initialX = width / 2;
    const initialY = height / 2;

    for (let i = 0; i < numOfSegments; i++) {
        spineSegments.push({
            x: initialX,
            y: initialY + i * linkSize,
            radius: segmentsRadius[i],
            angle: Math.PI / 2,
        });
    }

    return spineSegments;
}

export const updateSpineSegmentPositions = (segments : SpineSegment[], creatureConfig: CreatureConfig, mouseX: number, mouseY : number) => {
    const head = segments[0];
    const target = {
        x: head.x + (mouseX - head.x) * 0.1,
        y: head.y + (mouseY - head.y) * 0.1,
    };

    head.angle = Math.atan2(target.y - head.y, target.x - head.x);
    head.x = target.x;
    head.y = target.y;

    for (let i = 1; i < segments.length; i++) {
        const prevSegment = segments[i - 1];
        const currSegment = segments[i];
        const currAngle = Math.atan2(prevSegment.y - currSegment.y, prevSegment.x - currSegment.x);
        currSegment.angle = constrainAngle(currAngle, prevSegment.angle, creatureConfig.spine.angleConstraint);
        currSegment.x = prevSegment.x - Math.cos(currSegment.angle) * creatureConfig.spine.linkSize;
        currSegment.y = prevSegment.y - Math.sin(currSegment.angle) * creatureConfig.spine.linkSize;
    }
};

export const drawSpineSegmentsOutline = (segments: SpineSegment[], ctx : CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'black';
    ctx.fillStyle = '#AC3931';
    ctx.lineWidth = 4;

    const controlPoints = segments.map((segment, i) => {
        const { x, y, radius } = segment;
        const nextSegment = segments[i + 1] || segments[i - 1];
        const direction = {
            x: i < segments.length - 1 ? nextSegment.x - x : x - nextSegment.x,
            y: i < segments.length - 1 ? nextSegment.y - y : y - nextSegment.y,
        };
        const length = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        const norm = {
            x: direction.x / length,
            y: direction.y / length,
        };

        return {
            controlX1: x + norm.y * radius,
            controlY1: y - norm.x * radius,
            controlX2: x - norm.y * radius,
            controlY2: y + norm.x * radius,
        };
    });

    ctx.beginPath();
    ctx.lineCap = 'round';

    // Draw right side of the snake
    ctx.moveTo(controlPoints[0].controlX1, controlPoints[0].controlY1);
    controlPoints.forEach(point => ctx.quadraticCurveTo(point.controlX1, point.controlY1, point.controlX1, point.controlY1));

    // Draw tail arc
    const tail = segments[segments.length - 1];
    const tailPoint = controlPoints[controlPoints.length - 1];
    let tailSlope = (tailPoint.controlY2 - tailPoint.controlY1) / (tailPoint.controlX2 - tailPoint.controlX1);
    let tailStartAngle = Math.atan(tailSlope);
    if (tailPoint.controlX1 < tailPoint.controlX2) tailStartAngle += Math.PI;
    ctx.arc(tail.x, tail.y, tail.radius, tailStartAngle, tailStartAngle + Math.PI);

    // Draw left side of the snake in reverse
    ctx.moveTo(tailPoint.controlX2, tailPoint.controlY2);
    for (let i = controlPoints.length - 2; i >= 0; i--) {
        const point = controlPoints[i];
        ctx.quadraticCurveTo(point.controlX2, point.controlY2, point.controlX2, point.controlY2);
    }

    // Draw head arc
    const head = segments[0];
    const headPoint = controlPoints[0];
    let headSlope = (headPoint.controlY2 - headPoint.controlY1) / (headPoint.controlX2 - headPoint.controlX1);
    let headStartAngle = Math.atan(headSlope);
    if (headPoint.controlX2 < headPoint.controlX1) headStartAngle += Math.PI;
    ctx.arc(head.x, head.y, head.radius, headStartAngle, headStartAngle + Math.PI);

    ctx.fill();
    ctx.stroke();

};

export const debugSpineSegments = (ctx: CanvasRenderingContext2D, segments: SpineSegment[]) => {
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;

    segments.forEach((segment) => {
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, segment.radius, 0, Math.PI * 2);
        ctx.stroke();
    });
}