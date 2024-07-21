//creature.ts
import {CreatureConfig} from "@/contexts/CreatureConfigProvider";
import {
    debugSpineSegments,
    drawSpineSegmentsOutline,
    getInitialSpineArray,
    SpineSegment,
    updateSpineSegmentPositions
} from "@/creature/spine";
import {
    debugLimbBaseSegments,
    drawLimeSegmentsOutline,
    getInitialLimbSegments,
    LimbSegment,
    updateLimbSegmentPositions
} from "@/creature/limb";

export type CreatureSegments = {
    spineSegment: SpineSegment[];
    limbSegments: LimbSegment[][];
}

export const getInitialCreatureSegments = (creatureConfig : CreatureConfig, width : number, height :number) => {
    const creatureSegments: CreatureSegments = {
        spineSegment: getInitialSpineArray(creatureConfig, width, height),
        limbSegments: getInitialLimbSegments(creatureConfig, width, height),
    }
    return creatureSegments;

}

export const updateCreatureOnCanvas = (ctx: CanvasRenderingContext2D, creatureConfig : CreatureConfig, mouseX : number, mouseY : number, width : number, height: number, creatureSegments:CreatureSegments, debugMode: boolean ) => {
    updateSpineSegmentPositions(creatureSegments.spineSegment, creatureConfig, mouseX, mouseY);
    updateLimbSegmentPositions(creatureSegments.limbSegments, creatureSegments.spineSegment, creatureConfig);


    if(debugMode) {
        debugSpineSegments(ctx, creatureSegments.spineSegment);
        debugLimbBaseSegments(ctx, creatureSegments.limbSegments);
    } else {
        drawLimeSegmentsOutline(creatureSegments.limbSegments, ctx);
        drawSpineSegmentsOutline(creatureSegments.spineSegment, ctx);
    }
}