import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";

export type Spine = {
    numOfSegments: number;
    segmentsRadius: number[];
    linkSize: number;
    angleConstraint: number;
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

const initializeLimbs = (numOfSegments: number): Limb[] => {
    const limbSpawnPoints = [0, 95];
    return limbSpawnPoints.flatMap(spawnPoint => [
        {
            numOfSegments: 3,
            segmentsRadius: Array.from({ length: 3 }, (_, i) => 10 - (i / 2)),
            linkSize: 15,
            angleConstraint: Math.PI / 12,
            spawnSpineSegment: Math.floor(numOfSegments * spawnPoint / 100),
            spawnDirection: 'left',
        },
        {
            numOfSegments: 3,
            segmentsRadius: Array.from({ length: 3 }, (_, i) => 10 - (i / 2)),
            linkSize: 15,
            angleConstraint: Math.PI / 12,
            spawnSpineSegment: Math.floor(numOfSegments * spawnPoint / 100),
            spawnDirection: 'right',
        }
    ]);
};

const CreatureConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [creatureConfig, setCreatureConfig] = useState<CreatureConfig>({
        spine: {
            numOfSegments: 50,
            segmentsRadius: Array.from({ length: 50 }, (_, i) => 50 - (i / 2)),
            linkSize: 5,
            angleConstraint: Math.PI / 12,
        },
        limbs: [],
    });

    useEffect(() => {
        setCreatureConfig(prevState => ({
            ...prevState,
            spine: {
                ...prevState.spine,
                angleConstraint: Math.PI / 12 / (30 / prevState.spine.linkSize),
            },
        }));
    }, [creatureConfig.spine.linkSize]);

    useEffect(() => {
        setCreatureConfig(prevState => ({
            ...prevState,
            spine: {
                ...prevState.spine,
                segmentsRadius: Array.from({ length: prevState.spine.numOfSegments }, (_, i) => 50 - (i / 5)),
            },
            limbs: initializeLimbs(prevState.spine.numOfSegments),
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
