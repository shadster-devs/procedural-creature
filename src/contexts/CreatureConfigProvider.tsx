import React from "react";

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
    spawnDirection : 'left' | 'right';
}

export type Fin = {
    type : 'dorsal' | 'pectoral' | 'pelvic' | 'anal';
    height : number;
    startSegment : number;
    endSegment? : number;
}

export type CreatureConfig = {
    spine: Spine;
    limbs: Limb[];
};

interface CreatureConfigContextProps {
    creatureConfig: CreatureConfig;
    updateCreatureConfig: (newState: Partial<CreatureConfig>) => void;
}

const CreatureConfigContext = React.createContext<CreatureConfigContextProps | undefined>(undefined);

export const useCreatureConfig = () => {
    const context = React.useContext(CreatureConfigContext);
    if (!context) {
        throw new Error('useCreatureConfig must be used within a CreatureConfigProvider');
    }
    return context;
};

export const CreatureConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [creatureConfig, setCreatureConfig] = React.useState<CreatureConfig>({
        spine: {
            numOfSegments: 30,
            segmentsRadius: Array.from({ length: 50 }, (_, i) => 50 - (i / 2)),
            linkSize: 12,
            angleConstraint: Math.PI / 12,
        },
        limbs : [],
    });

    const initializeLimbs = (numOfSegments: number) => {
        const limbSpawnPoints = [30, 80]; // Example spawn points, these can be adjusted
        return limbSpawnPoints.flatMap(spawnPoint => [
            {
                numOfSegments: 5,
                segmentsRadius: Array.from({ length: 5 }, (_, i) => 20 - (i / 2)),
                linkSize: 20,
                angleConstraint: Math.PI / 12,
                spawnSpineSegment: Math.floor(numOfSegments * spawnPoint / 100),
                spawnDirection: 'left' as 'left' | 'right',
            },
            {
                numOfSegments: 5,
                segmentsRadius: Array.from({ length: 5 }, (_, i) => 20 - (i / 2)),
                linkSize: 20,
                angleConstraint: Math.PI / 12,
                spawnSpineSegment: Math.floor(numOfSegments * spawnPoint / 100),
                spawnDirection: 'right' as 'right' | 'left',
            }
        ]);
    };

    React.useEffect(() => {
        setCreatureConfig((prevState) => ({
            ...prevState,
            spine: {
                ...prevState.spine,
                angleConstraint: Math.PI / 12 / (30 / prevState.spine.linkSize),
            },
        }));
    }, [creatureConfig.spine.linkSize]);

    React.useEffect(() => {
        setCreatureConfig((prevState) => ({
            ...prevState,
            spine: {
                ...prevState.spine,
                segmentsRadius: Array.from({ length: prevState.spine.numOfSegments }, (_, i) => 50 - (i / 2)),
            },
            limbs: initializeLimbs(prevState.spine.numOfSegments),
        }));
    }, [creatureConfig.spine.numOfSegments]);

    const updateCreatureConfig = (newState: Partial<CreatureConfig>) => {
        setCreatureConfig((prevState) => ({
            ...prevState,
            ...newState,
        }));
    };

    return (
        <CreatureConfigContext.Provider value={{ creatureConfig, updateCreatureConfig }}>
            {children}
        </CreatureConfigContext.Provider>
    );
};

export default CreatureConfigProvider;
