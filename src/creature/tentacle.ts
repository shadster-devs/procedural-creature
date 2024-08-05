// src/creature/tentacle.ts

import { CreatureConfig } from "@/contexts/CreatureConfigProvider";
import {getInitialSpineArray, SpineSegment} from "@/creature/spine";
import {LimbSegment} from "@/creature/limb";

export type TentacleSegment = {
    x: number;
    y: number;
    radius: number;
    angle: number;
};

export const getInitialTentacleSegments = (creatureConfig: CreatureConfig, width: number, height: number): TentacleSegment[][] => {
    const tentaclesConfig = creatureConfig.tentacles;
    if (!tentaclesConfig) return [];
    const tentacleSegments: TentacleSegment[][] = [];

    const spineSegments = getInitialSpineArray(creatureConfig, width, height);

    for (let i = 0; i < tentaclesConfig.length; i++) {
        const spawnSegment = spineSegments[tentaclesConfig[i].spawnSpineSegment];
        const baseX = tentaclesConfig[i].spawnDirection === 'left'
            ? spawnSegment.x - (spawnSegment.radius + tentaclesConfig[i].segmentsRadius[0])
            : spawnSegment.x + (spawnSegment.radius + tentaclesConfig[i].segmentsRadius[0]);
        const baseY = spawnSegment.y;

        const tentacleSegment: TentacleSegment[] = [];
        for (let j = 0; j < tentaclesConfig[i].numOfSegments; j++) {
            const segment: TentacleSegment = {
                x: baseX + j * tentaclesConfig[i].linkSize,
                y: baseY,
                radius: tentaclesConfig[i].segmentsRadius[j],
                angle: 0,
            };
            tentacleSegment.push(segment);
        }

        tentacleSegments.push(tentacleSegment);
    }

    return tentacleSegments;
};

export const applyInverseKinematics = (
    segments: TentacleSegment[],
    targetX: number,
    targetY: number,
    linkSize: number
) => {
    const epsilon = 0.001; // Small value to prevent division by zero

    // Move the last segment towards the target
    segments[segments.length - 1].x = targetX;
    segments[segments.length - 1].y = targetY;

    // Backward reach
    for (let i = segments.length - 2; i >= 0; i--) {
        const dx = segments[i + 1].x - segments[i].x;
        const dy = segments[i + 1].y - segments[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy) || epsilon;
        const scale = linkSize / distance;

        segments[i].x = segments[i + 1].x - dx * scale;
        segments[i].y = segments[i + 1].y - dy * scale;
    }

    // Forward reach
    for (let i = 1; i < segments.length; i++) {
        const dx = segments[i].x - segments[i - 1].x;
        const dy = segments[i].y - segments[i - 1].y;
        const distance = Math.sqrt(dx * dx + dy * dy) || epsilon;
        const scale = linkSize / distance;

        segments[i].x = segments[i - 1].x + dx * scale;
        segments[i].y = segments[i - 1].y + dy * scale;
    }
};

export const updateTentacleSegmentPositions = (tentacleSegments: TentacleSegment[][], spineSegments: SpineSegment[], creatureConfig: CreatureConfig) => {
    const tentaclesConfig = creatureConfig.tentacles;
    if (!tentaclesConfig) return;

    const waveFrequency = 0.005; // Frequency of the wave motion
    const waveAmplitude = 5;   // Amplitude of the wave motion

    for (let i = 0; i < tentacleSegments.length; i++) {
        const tentacle = tentacleSegments[i];
        const tentacleConfig = tentaclesConfig[i];
        const spineSegment = spineSegments[tentacleConfig.spawnSpineSegment];

        // Calculate base position offset based on the spine segment's angle
        const angleOffset = tentacleConfig.spawnDirection === 'left' ? -Math.PI / 4 : Math.PI / 4;
        const baseAngle = spineSegment.angle + angleOffset;

        // Determine the base position of the tentacle relative to the spine segment
        const baseX = spineSegment.x + Math.cos(baseAngle) * (spineSegment.radius - tentacle[0].radius);
        const baseY = spineSegment.y + Math.sin(baseAngle) * (spineSegment.radius - tentacle[0].radius);

        // Calculate the target position based on the direction of movement and the tentacle's length
        const maxDistance = tentacleConfig.linkSize * (tentacle.length - 1);

        // Update the last segment's position
        const lastSegment = tentacle[tentacle.length - 1];
        const distanceToLastSegment = Math.sqrt((lastSegment.x - baseX) ** 2 + (lastSegment.y - baseY) ** 2);

        let targetX, targetY;

        // If the last segment is out of reach, adjust its position to be within the maximum distance
        if (distanceToLastSegment > maxDistance || distanceToLastSegment < maxDistance * 0.5) {
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
        for (let j = tentacle.length - 2; j > 0; j--) {
            const nextSegment = tentacle[j + 1];
            const currSegment = tentacle[j];

            // Position each middle segment based on the next segment
            currSegment.x = nextSegment.x - Math.cos(angleToLastSegment) * tentacleConfig.linkSize;
            currSegment.y = nextSegment.y - Math.sin(angleToLastSegment) * tentacleConfig.linkSize;

            // Set the angle of the current segment
            currSegment.angle = angleToLastSegment;

            // Ensure proper attachment to the previous segment
            const dx = currSegment.x - nextSegment.x;
            const dy = currSegment.y - nextSegment.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > tentacleConfig.linkSize) {
                const scale = tentacleConfig.linkSize / dist;
                currSegment.x = nextSegment.x + dx * scale;
                currSegment.y = nextSegment.y + dy * scale;
            }
        }

        // Fix for the segment just after the base segment being placed incorrectly
        if (tentacle.length > 1) {
            const firstSegment = tentacle[0];
            const secondSegment = tentacle[1];

            secondSegment.x = firstSegment.x + Math.cos(baseAngle) * tentacleConfig.linkSize;
            secondSegment.y = firstSegment.y + Math.sin(baseAngle) * tentacleConfig.linkSize;
            secondSegment.angle = baseAngle;
        }

        // Apply wave motion to the tentacle segments
        const time = Date.now() * waveFrequency;
        for (let j = 1; j < tentacle.length; j++) {
            const currSegment = tentacle[j];
            const waveOffset = Math.sin(time + j * 5 * Math.PI / tentacle.length) * waveAmplitude;
            const waveAngle = angleToLastSegment + Math.PI / 2;

            currSegment.x += Math.cos(waveAngle) * waveOffset;
            currSegment.y += Math.sin(waveAngle) * waveOffset;
        }

        // Ensure the first segment is connected to the spine
        tentacle[0].x = baseX;
        tentacle[0].y = baseY;
        tentacle[0].angle = baseAngle;
    }
};



export const drawTentacleSegmentsOutline = (tentacleSegments: TentacleSegment[][], ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'black';
    ctx.fillStyle = '#AC3931';
    ctx.lineWidth = 4;

    tentacleSegments.forEach((segments) => {
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

        // Draw right side of the tentacle
        ctx.moveTo(controlPoints[0].controlX1, controlPoints[0].controlY1);
        controlPoints.forEach(point => ctx.quadraticCurveTo(point.controlX1, point.controlY1, point.controlX1, point.controlY1));

        // Draw tail arc
        const tail = segments[segments.length - 1];
        const tailPoint = controlPoints[controlPoints.length - 1];
        let tailSlope = (tailPoint.controlY2 - tailPoint.controlY1) / (tailPoint.controlX2 - tailPoint.controlX1);
        let tailStartAngle = Math.atan(tailSlope);
        if (tailPoint.controlX1 < tailPoint.controlX2) tailStartAngle += Math.PI;
        ctx.arc(tail.x, tail.y, tail.radius, tailStartAngle, tailStartAngle + Math.PI);

        // Draw left side of the tentacle in reverse
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
    });
};

export const debugTentacleBaseSegments = (ctx: CanvasRenderingContext2D, tentacleSegments: TentacleSegment[][]) => {
    ctx.beginPath();
    ctx.lineWidth = 4;

    const colorArray = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'black', 'red'];

    tentacleSegments.forEach((tentacleSegment) => {
        tentacleSegment.forEach((segment, index) => {
            const currentSeg =segment;
            ctx.beginPath();
            ctx.strokeStyle = colorArray[index%10];
            ctx.arc(currentSeg.x, currentSeg.y, currentSeg.radius, 0, Math.PI * 2);
            ctx.stroke();
        })

    });
};