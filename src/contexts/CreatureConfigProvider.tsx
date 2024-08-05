import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";

export type Spine = {
    numOfSegments: number;
    segmentsRadius: number[];
    linkSize: number;
    angleConstraint: number;
};


export type Tentacle = {
    numOfSegments: number;
    segmentsRadius: number[];
    linkSize: number;
    angleConstraint: number;
    spawnSpineSegment: number;
    spawnDirection: 'left' | 'right';
    creepingSpeed: number;  // Speed at which the tentacle creeps
    curlingFactor: number;  // Factor that controls how much the tentacle curls
};

export type Limb = {
    numOfSegments: number;
    segmentsRadius: number[];
    linkSize: number;
    angleConstraint: number;
    spawnSpineSegment: number;
    spawnDirection: 'left' | 'right';
};

export type CreatureConfig = {
    spine: Spine;
    limbs: Limb[];
    tentacles?: Tentacle[];
};

interface CreatureConfigContextProps {
    creatureConfig: CreatureConfig;
    updateCreatureConfig: (newState: Partial<CreatureConfig>) => void;
    setCreaturePreset: (newState: CreatureConfig) => void;
}

const CreatureConfigContext = createContext<CreatureConfigContextProps | undefined>(undefined);

export const useCreatureConfig = (): CreatureConfigContextProps => {
    const context = useContext(CreatureConfigContext);
    if (!context) {
        throw new Error('useCreatureConfig must be used within a CreatureConfigProvider');
    }
    return context;
};



const CreatureConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [creatureConfig, setCreatureConfig] = useState<CreatureConfig>({
        spine: {
            numOfSegments: 50,
            segmentsRadius: Array.from({ length: 50 }, (_, i) => 50 - (i / 2)),
            linkSize: 5,
            angleConstraint: Math.PI / 4,
        },
        limbs: [],
        tentacles : []
        // tentacles: [
        //     {
        //         numOfSegments: 30,
        //         segmentsRadius: Array.from({ length: 30 }, (_, i) => 30 - (i / 2)),
        //         linkSize: 10,
        //         angleConstraint: Math.PI / 4,
        //         spawnSpineSegment: 25,
        //         spawnDirection: 'left',
        //         creepingSpeed: 0.1,
        //         curlingFactor: 0.5,
        //     },
        //     {
        //         numOfSegments: 30,
        //         segmentsRadius: Array.from({ length: 30 }, (_, i) => 30 - (i / 2)),
        //         linkSize: 10,
        //         angleConstraint: Math.PI / 4,
        //         spawnSpineSegment: 25,
        //         spawnDirection: 'right',
        //         creepingSpeed: 0.1,
        //         curlingFactor: 0.5,
        //     },
        // ],
    });



    useEffect(() => {
        setCreatureConfig(prevState => ({
            ...prevState,
            spine: {
                ...prevState.spine,
                segmentsRadius: Array.from({ length: prevState.spine.numOfSegments }, (_, i) => prevState.spine.numOfSegments - (i / 5)),
            },
        }));
    }, [creatureConfig.spine.numOfSegments]);


    const updateCreatureConfig = (newState: Partial<CreatureConfig>) => {
        setCreatureConfig(prevState => ({
            ...prevState,
            ...newState,
        }));
    };

    const setCreaturePreset = (newState: CreatureConfig) => {
        setCreatureConfig(newState);
    }

    return (
        <CreatureConfigContext.Provider value={{ creatureConfig, updateCreatureConfig, setCreaturePreset }}>
            {children}
        </CreatureConfigContext.Provider>
    );
};

export default CreatureConfigProvider;
