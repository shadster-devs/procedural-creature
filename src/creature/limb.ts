//limb.ts
import { CreatureConfig } from "@/contexts/CreatureConfigProvider";
import {getInitialSpineArray, SpineSegment} from "@/creature/spine";

export type LimbSegment = {
    x: number;
    y: number;
    radius: number;
    angle: number;
};

export const getInitialLimbSegments = (creatureConfig: CreatureConfig, width: number, height: number): LimbSegment[][] => {
    const limbsConfig = creatureConfig.limbs;
    if (!limbsConfig) return [];
    const limbSegments: LimbSegment[][] = [];

    const spineSegments = getInitialSpineArray(creatureConfig, width, height);

    for (let i = 0; i < limbsConfig.length; i++) {
        const spawnSegment = spineSegments[limbsConfig[i].spawnSpineSegment];
        const baseX = limbsConfig[i].spawnDirection === 'left'
            ? spawnSegment.x - (spawnSegment.radius + limbsConfig[i].segmentsRadius[0])
            : spawnSegment.x + (spawnSegment.radius + limbsConfig[i].segmentsRadius[0]);
        const baseY = spawnSegment.y;

        const limbSegment: LimbSegment[] = [];
        for (let j = 0; j < limbsConfig[i].numOfSegments; j++) {
            const limb: LimbSegment = {
                x: baseX,
                y: baseY,
                radius: limbsConfig[i].segmentsRadius[j],
                angle: Math.PI / 2,
            };
            limbSegment.push(limb);
        }

        limbSegments.push(limbSegment);
    }

    return limbSegments;
};

export const updateLimbSegmentPositions = (limbSegments: LimbSegment[][], spineSegments: SpineSegment[], creatureConfig: CreatureConfig) => {
    const limbsConfig = creatureConfig.limbs;
    if (!limbsConfig) return;

    for (let i = 0; i < limbSegments.length; i++) {
        const limb = limbSegments[i];
        const limbConfig = limbsConfig[i];
        const spineSegment = spineSegments[limbConfig.spawnSpineSegment];

        // Calculate base position offset based on the spine segment's angle
        const angleOffset = limbConfig.spawnDirection === 'left' ? -Math.PI / 4 : Math.PI / 4;
        const baseAngle = spineSegment.angle + angleOffset;

        // Determine the base position of the limb relative to the spine segment
        const baseX = spineSegment.x + Math.cos(baseAngle) * (spineSegment.radius - limb[0].radius);
        const baseY = spineSegment.y + Math.sin(baseAngle) * (spineSegment.radius - limb[0].radius);

        // Calculate the maximum distance the limb can extend
        const maxDistance = limbConfig.linkSize * (limb.length - 1);

        // Determine the distance from the base to the last segment of the limb
        const lastSegment = limb[limb.length - 1];
        const distanceToLastSegment = Math.sqrt((lastSegment.x - baseX) ** 2 + (lastSegment.y - baseY) ** 2);

        let targetX, targetY;

        // If the last segment is out of reach, adjust its position to be within the maximum distance
        if (distanceToLastSegment > maxDistance || distanceToLastSegment < maxDistance*0.5) {
            targetX = baseX + Math.cos(baseAngle) * maxDistance;
            targetY = baseY + Math.sin(baseAngle) * maxDistance;
        } else {
            // Otherwise, keep the last segment at its current position
            targetX = lastSegment.x;
            targetY = lastSegment.y;
        }

        // Update the last segment's position
        lastSegment.x = targetX;
        lastSegment.y = targetY;

        // Calculate the angle from the base segment to the last segment
        const angleToLastSegment = Math.atan2(targetY - baseY, targetX - baseX);

        // Update positions of the middle segments along the straight line between base and last segment
        for (let j = limb.length - 2; j > 0; j--) {
            const nextSegment = limb[j + 1];
            const currSegment = limb[j];

            // Position each middle segment based on the next segment
            currSegment.x = nextSegment.x - Math.cos(angleToLastSegment) * limbConfig.linkSize;
            currSegment.y = nextSegment.y - Math.sin(angleToLastSegment) * limbConfig.linkSize;

            // Set the angle of the current segment
            currSegment.angle = angleToLastSegment;
        }

        // Update the first segment position to attach it to the spine
        limb[0].x = baseX;
        limb[0].y = baseY;
        limb[0].angle = baseAngle;
    }
};

export const drawLimbSegmentsOutline = (limbSegments: LimbSegment[][], ctx: CanvasRenderingContext2D) => {

    ctx.strokeStyle = 'black';
    ctx.fillStyle = '#AC3931';
    ctx.lineWidth = 4;


    limbSegments.forEach((segments) => {
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
    })
}

export const debugLimbBaseSegments = (ctx: CanvasRenderingContext2D, limbSegments: LimbSegment[][]) => {
    ctx.beginPath();
    ctx.lineWidth = 4;

    const colorArray = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'white'];

    limbSegments.forEach((limbSegment) => {
        limbSegment.forEach((segment, index) => {
            const currentSeg =segment;
            ctx.beginPath();
            ctx.strokeStyle = colorArray[index];
            ctx.arc(currentSeg.x, currentSeg.y, currentSeg.radius, 0, Math.PI * 2);
            ctx.stroke();
        })

    });
};
