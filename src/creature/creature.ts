// src/creature/creature.ts

import { CreatureConfig } from "@/contexts/CreatureConfigProvider";
import {
    debugSpineSegments,
    drawSpineSegmentsOutline,
    getInitialSpineArray,
    SpineSegment,
    updateSpineSegmentPositions
} from "@/creature/spine";
import {
    debugLimbBaseSegments,
    drawLimbSegmentsOutline,
    getInitialLimbSegments,
    LimbSegment,
    updateLimbSegmentPositions
} from "@/creature/limb";
import {
    getInitialTentacleSegments,
    TentacleSegment,
    updateTentacleSegmentPositions,
    drawTentacleSegmentsOutline, debugTentacleBaseSegments
} from "@/creature/tentacle";

export type CreatureSegments = {
    spineSegment: SpineSegment[];
    limbSegments: LimbSegment[][];
    tentacleSegments: TentacleSegment[][];
};

export const getInitialCreatureSegments = (creatureConfig: CreatureConfig, width: number, height: number) => {
    const creatureSegments: CreatureSegments = {
        spineSegment: getInitialSpineArray(creatureConfig, width, height),
        limbSegments: getInitialLimbSegments(creatureConfig, width, height),
        tentacleSegments: getInitialTentacleSegments(creatureConfig, width, height),
    };
    return creatureSegments;
};

export const updateCreatureOnCanvas = (
    ctx: CanvasRenderingContext2D,
    creatureConfig: CreatureConfig,
    mouseX: number,
    mouseY: number,
    width: number,
    height: number,
    creatureSegments: CreatureSegments,
    debugMode: boolean
) => {
    updateSpineSegmentPositions(creatureSegments.spineSegment, creatureConfig, mouseX, mouseY);
    updateLimbSegmentPositions(creatureSegments.limbSegments, creatureSegments.spineSegment, creatureConfig);
    updateTentacleSegmentPositions(creatureSegments.tentacleSegments, creatureSegments.spineSegment, creatureConfig);

    if (debugMode) {
        debugSpineSegments(ctx, creatureSegments.spineSegment);
        debugLimbBaseSegments(ctx, creatureSegments.limbSegments);
        debugTentacleBaseSegments(ctx, creatureSegments.tentacleSegments);
        // Add debug drawing for tentacles if needed
    } else {
        drawLimbSegmentsOutline(creatureSegments.limbSegments, ctx);
        drawTentacleSegmentsOutline(creatureSegments.tentacleSegments, ctx);
        drawSpineSegmentsOutline(creatureSegments.spineSegment, ctx);
    }
};
