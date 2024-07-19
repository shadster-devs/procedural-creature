import {CreatureState} from "@/contexts/CreatureStateProvider";
import {
    getInitialSpineArray,
    SpineSegment, updateSpineOnCanvas,
} from "@/canvasUtils/spine";

export type CreatureSegments = {
    spineSegment: SpineSegment[];
}

export const getInitialCreatureSegments = (creatureState : CreatureState, width : number, height :number) => {
    const creatureSegments: CreatureSegments = {
        spineSegment: getInitialSpineArray(creatureState, width, height),
    }
    return creatureSegments;

}

export const updateCreatureOnCanvas = (ctx: CanvasRenderingContext2D, creatureState : CreatureState, mouseX : number, mouseY : number, width : number, height: number, creatureSegments:CreatureSegments ) => {
    updateSpineOnCanvas(ctx,creatureState, creatureSegments.spineSegment,mouseX, mouseY);


}