import React from "react";
import { useCreatureState } from "@/contexts/CreatureStateProvider";
import styles from './ControlSideMenu.module.scss';

interface ControlSideMenuProps {}

const ControlSideMenu: React.FC<ControlSideMenuProps> = () => {
    const { creatureState, updateState } = useCreatureState();

    const handleNumOfSegmentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const numOfSegments = parseInt(event.target.value);
        updateState({
            spine: {
                ...creatureState.spine,
                numOfSegments
            }
        });
    };

    const handleSegmentsRadiusChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const newRadius = parseInt(event.target.value);
        const newSegmentsRadius = [
            ...creatureState.spine.segmentsRadius.slice(0, index),
            newRadius,
            ...creatureState.spine.segmentsRadius.slice(index + 1)
        ];
        updateState({
            spine: {
                ...creatureState.spine,
                segmentsRadius: newSegmentsRadius
            }
        });
    };

    const handleLinkSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const linkSize = parseInt(event.target.value);
        updateState({
            spine: {
                ...creatureState.spine,
                linkSize
            }
        });
    };

    return (
        <div className={styles['control-side-menu']}>
            <label>
                Number of segments
                <input
                    type="number"
                    onChange={handleNumOfSegmentsChange}
                    value={creatureState.spine.numOfSegments}
                />
            </label>
            <label>
                Link size
                <input
                    type="range"
                    min="10"
                    max="50"
                    value={creatureState.spine.linkSize}
                    onChange={handleLinkSizeChange}
                />
            </label>
            {creatureState.spine.segmentsRadius.map((radius, index) => (
                <label key={index}>
                    Segment {index + 1} radius
                    <input
                        type="range"
                        min="10"
                        max="50"
                        value={radius}
                        onChange={event => handleSegmentsRadiusChange(index, event)}
                    />
                </label>
            ))}
        </div>
    );
};

export default ControlSideMenu;
