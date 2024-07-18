import React from "react";
import {useCreatureState} from "@/contexts/CreatureStateProvider";
import styles from './ControlSideMenu.module.scss';

interface ControlSideMenuProps {}

const ControlSideMenu: React.FC<ControlSideMenuProps> = () => {

    const {creatureState,updateState} = useCreatureState();


    const handleNumOfSegmentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const numOfSegments = parseInt(event.target.value);
        updateState({numOfSegments});
    }

    const handleSegmentsRadiusChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const newRadius = parseInt(event.target.value);
        updateState({segmentsRadius: [...creatureState.segmentsRadius.slice(0, index), newRadius, ...creatureState.segmentsRadius.slice(index + 1)]})
    }

    const handleLinkSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const linkSize = parseInt(event.target.value);
        updateState({linkSize});
    }


    return (
        <div className={styles['control-side-menu']}>
            <label>
                Number of segments
                <input type="number" onChange={handleNumOfSegmentsChange} value={creatureState.numOfSegments}/>
            </label>
            <label>
                Link size
                <input type="range"
                       min="10"
                       max="50"
                       value={creatureState.linkSize}
                       onChange={handleLinkSizeChange}
                />
            </label>
            {
                creatureState.segmentsRadius.map((radius, index) => (
                    <label key={index}>
                        Segment {index + 1} radius
                        <input type="range"
                               min="10"
                               max="50"
                               value={radius}
                               onChange={handleSegmentsRadiusChange.bind(null, index)}
                        />
                    </label>
                ))
            }
        </div>
  );
};

export default ControlSideMenu;