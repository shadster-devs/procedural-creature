import React from "react";
import { useCreatureConfig } from "@/contexts/CreatureConfigProvider";
import styles from './ControlSideMenu.module.scss';

interface ControlSideMenuProps {}

const ControlSideMenu: React.FC<ControlSideMenuProps> = () => {
    const { creatureConfig, updateCreatureConfig } = useCreatureConfig();

    const handleNumOfSegmentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const numOfSegments = parseInt(event.target.value);
        updateCreatureConfig({
            spine: {
                ...creatureConfig.spine,
                numOfSegments
            }
        });
    };

    const handleSegmentsRadiusChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const newRadius = parseInt(event.target.value);
        const newSegmentsRadius = [
            ...creatureConfig.spine.segmentsRadius.slice(0, index),
            newRadius,
            ...creatureConfig.spine.segmentsRadius.slice(index + 1)
        ];
        updateCreatureConfig({
            spine: {
                ...creatureConfig.spine,
                segmentsRadius: newSegmentsRadius
            }
        });
    };

    const handleLinkSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const linkSize = parseInt(event.target.value);
        updateCreatureConfig({
            spine: {
                ...creatureConfig.spine,
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
                    value={creatureConfig.spine.numOfSegments}
                />
            </label>
            <label>
                Link size
                <input
                    type="range"
                    min="10"
                    max="50"
                    value={creatureConfig.spine.linkSize}
                    onChange={handleLinkSizeChange}
                />
            </label>
            {creatureConfig.spine.segmentsRadius.map((radius, index) => (
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
