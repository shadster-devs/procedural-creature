import { CreatureConfig } from "@/contexts/CreatureConfigProvider";
import {getInitialSpineArray, SpineSegment} from "@/canvasUtils/spine";

export type LimbSegment = {
    x: number;
    y: number;
    radius: number;
    angle: number;
    stepPosition?: { x: number; y: number };
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
        const spawnSegment = spineSegments[limbConfig.spawnSpineSegment];

        // Calculate base position offset based on the spine segment's angle
        const angleOffset = limbConfig.spawnDirection === 'left' ?  - Math.PI / 2 : +Math.PI / 2;
        const baseAngle = spawnSegment.angle + angleOffset;

        // Update base segment position
        const baseX = spawnSegment.x + Math.cos(baseAngle) * (spawnSegment.radius - limb[0].radius);
        const baseY = spawnSegment.y + Math.sin(baseAngle) * (spawnSegment.radius - limb[0].radius);

        limb[0].x = baseX;
        limb[0].y = baseY;
        limb[0].angle =  limbConfig.spawnDirection === 'left' ? baseAngle +  Math.PI / 4 : baseAngle - Math.PI / 4;

        // Update following segments positions
        for (let j = 1; j < limb.length; j++) {
            const prevSegment = limb[j - 1];
            const currSegment = limb[j];
            const angle = prevSegment.angle;
            currSegment.x = prevSegment.x + Math.cos(angle) * limbConfig.linkSize;
            currSegment.y = prevSegment.y + Math.sin(angle) * limbConfig.linkSize;
            currSegment.angle =   angle;
        }
    }
};

export const drawLimeSegmentsOutline = (limbSegments: LimbSegment[][], ctx: CanvasRenderingContext2D) => {

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
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;

    limbSegments.forEach((limbSegment) => {
        limbSegment.forEach((segment) => {
            const currentSeg =segment;
            ctx.beginPath();
            ctx.arc(currentSeg.x, currentSeg.y, currentSeg.radius, 0, Math.PI * 2);
            ctx.stroke();
        })

    });
};
