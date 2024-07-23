import React, { useState } from "react";
import {CreatureConfig, useCreatureConfig} from "@/contexts/CreatureConfigProvider";
import styles from './ControlSideMenu.module.scss';
import Tabs from "@/components/ControlSideMenu/Tabs";

interface ControlSideMenuProps {
    isCollapsed: boolean;
}

const presets: Record<string, CreatureConfig> = {
    "snake": {
        spine: {
            numOfSegments: 30,
            segmentsRadius: Array.from({ length: 30 }, (_, i) => 20 - (i / 2)),
            linkSize: 10,
            angleConstraint: Math.PI / 12,
        },
        limbs: [] // No limbs for snake
    },
    "lizard": {
        spine: {
            numOfSegments: 20,
            segmentsRadius: Array.from({ length: 20 }, (_, i) => 30 - (i / 2)),
            linkSize: 8,
            angleConstraint: Math.PI / 10,
        },
        limbs: [
            {
                numOfSegments: 3,
                segmentsRadius: [10, 8, 6],
                linkSize: 20,
                angleConstraint: Math.PI / 8,
                spawnSpineSegment: 5,
                spawnDirection: 'left',
            },
            {
                numOfSegments: 3,
                segmentsRadius: [10, 8, 6],
                linkSize: 20,
                angleConstraint: Math.PI / 8,
                spawnSpineSegment: 5,
                spawnDirection: 'right',
            },
            {
                numOfSegments: 3,
                segmentsRadius: [10, 8, 6],
                linkSize: 20,
                angleConstraint: Math.PI / 8,
                spawnSpineSegment: 15,
                spawnDirection: 'left',
            },
            {
                numOfSegments: 3,
                segmentsRadius: [10, 8, 6],
                linkSize: 20,
                angleConstraint: Math.PI / 8,
                spawnSpineSegment: 15,
                spawnDirection: 'right',
            }
        ]
    },
    "spider": {
        "spine": {
            "numOfSegments": 20,
            "segmentsRadius": [
                6,  6,  6,  // Head (small and consistent)
                8, 10, 12,  // Thorax (gradually increasing)
                14, 16, 18, // Abdomen (widest in the middle)
                20, 22, 24, // Abdomen expanding further
                26, 28, 30, // Abdomen with even more width
                28, 26, 24, // Abdomen tapering
                22, 20      // Tail (more pronounced)
            ],
            "linkSize": 6,
            "angleConstraint": Math.PI / 8
        },
        "limbs": [
            {
                "numOfSegments": 6,
                "segmentsRadius": [8, 6, 5, 4, 3, 2],
                "linkSize": 10,
                "angleConstraint": Math.PI / 6,
                "spawnSpineSegment": 4,
                "spawnDirection": 'left',
            },
            {
                "numOfSegments": 6,
                "segmentsRadius": [8, 6, 5, 4, 3, 2],
                "linkSize": 10,
                "angleConstraint": Math.PI / 6,
                "spawnSpineSegment": 4,
                "spawnDirection": 'right',
            },
            {
                "numOfSegments": 6,
                "segmentsRadius": [8, 6, 5, 4, 3, 2],
                "linkSize": 10,
                "angleConstraint": Math.PI / 6,
                "spawnSpineSegment": 8,
                "spawnDirection": 'left',
            },
            {
                "numOfSegments": 6,
                "segmentsRadius": [8, 6, 5, 4, 3, 2],
                "linkSize": 10,
                "angleConstraint": Math.PI / 6,
                "spawnSpineSegment": 8,
                "spawnDirection": 'right',
            },
            {
                "numOfSegments": 6,
                "segmentsRadius": [8, 6, 5, 4, 3, 2],
                "linkSize": 10,
                "angleConstraint": Math.PI / 6,
                "spawnSpineSegment": 12,
                "spawnDirection": 'left',
            },
            {
                "numOfSegments": 6,
                "segmentsRadius": [8, 6, 5, 4, 3, 2],
                "linkSize": 10,
                "angleConstraint": Math.PI / 6,
                "spawnSpineSegment": 12,
                "spawnDirection": 'right',
            }
        ]
    },
    "centipede": {
        spine: {
            numOfSegments: 32, // Twice the number of legs for flexibility
            segmentsRadius: Array.from({ length: 40 }, (_, i) => 15 ), // Adjusted radius per segment
            linkSize: 5,
            angleConstraint: Math.PI / 12,
        },
        limbs: [
            // Generating 16 pairs of limbs (32 limbs in total)
            ...Array.from({ length: 16 }, (_, index) => ({
                numOfSegments: 3,
                segmentsRadius: [8, 6, 4], // Example radius values for the segments
                linkSize: 10,
                angleConstraint: Math.PI / 10,
                // Spawning points adjusted for each pair of limbs
                spawnSpineSegment: index*2,
                spawnDirection: index % 2 === 0 ? 'left' : 'right',
            })),
        ]
    }

};


const ControlSideMenu: React.FC<ControlSideMenuProps> = (props) => {
    const { isCollapsed } = props;
    const { creatureConfig, updateCreatureConfig, setCreaturePreset } = useCreatureConfig();
    const [activeTab, setActiveTab] = useState('Spine');

    const handlePresetChange = (presetName: string) => {
        const preset = presets[presetName];
        if (preset) {
            setCreaturePreset(preset);
            setTempConfig(preset);
        }
    };

    // Temporary state for changes
    const [tempConfig, setTempConfig] = useState(creatureConfig);


    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    };

    const handleSaveChanges = () => {
        updateCreatureConfig(tempConfig);
    };

    const renderPresetSettings = () => (
        <div className={styles.presets}>
            <h3>Select a Preset</h3>
            {Object.keys(presets).map(presetName => (
                <div key={presetName} className={styles.presetButtonContainer}>
                    <span className={styles.presetName}>{presetName}</span>
                    <button
                        onClick={() => handlePresetChange(presetName)}
                        className={styles.presetButton}
                    >
                        Apply
                    </button>
                </div>
            ))}
        </div>
    );

    const renderSpineSettings = () => (
        <>
            <label>
                Number of segments
                <input
                    type="number"
                    onChange={event => {
                        setTempConfig(prev => ({
                            ...prev,
                            spine: {
                                ...prev.spine,
                                numOfSegments: parseInt(event.target.value)
                            }
                        }));
                    }}
                    value={tempConfig.spine.numOfSegments}
                />
            </label>
            <label>
                Link size
                <input
                    type="range"
                    min="10"
                    max="50"
                    value={tempConfig.spine.linkSize}
                    onChange={event => {
                        setTempConfig(prev => ({
                            ...prev,
                            spine: {
                                ...prev.spine,
                                linkSize: parseInt(event.target.value)
                            }
                        }));
                    }}
                />
            </label>
            <label>
                Angle Constraint
                <input
                    type="number"
                    min="0"
                    max="90"
                    value={tempConfig.spine.angleConstraint * (180 / Math.PI)}
                    onChange={event => {
                        console.log(parseFloat(event.target.value));
                        setTempConfig(prev => (
                            {
                            ...prev,
                            spine: {
                                ...prev.spine,
                                angleConstraint: parseFloat(event.target.value) * (Math.PI / 180)
                            }
                        }));
                    }}
                />
            </label>
            {tempConfig.spine.segmentsRadius.map((radius, index) => (
                <label key={index}>
                    Segment {index + 1} radius
                    <input
                        type="range"
                        min="10"
                        max="50"
                        value={radius}
                        onChange={event => {
                            setTempConfig(prev => ({
                                ...prev,
                                spine: {
                                    ...prev.spine,
                                    segmentsRadius: [
                                        ...prev.spine.segmentsRadius.slice(0, index),
                                        parseInt(event.target.value),
                                        ...prev.spine.segmentsRadius.slice(index + 1)
                                    ]
                                }
                            }));
                        }}
                    />
                </label>
            ))}
        </>
    );

    const renderLimbSettings = () => (
        <table className={styles.table}>
            <thead>
            <tr>
                <th>Segment</th>
                <th>Number of Segments</th>
                <th>Segment Radius</th>
                <th>Link Size</th>
                <th>Angle Constraint</th>
                <th>Spawn Direction</th>
            </tr>
            </thead>
            <tbody>
            {tempConfig.limbs.map((limb, index) => (
                <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                        <input
                            type="number"
                            value={limb.numOfSegments}
                            onChange={e => {
                                const numOfSegments = parseInt(e.target.value);
                                const updatedLimbs = [...tempConfig.limbs];
                                updatedLimbs[index] = { ...updatedLimbs[index], numOfSegments };
                                setTempConfig({ ...tempConfig, limbs: updatedLimbs });
                            }}
                        />
                    </td>
                    <td>
                        {limb.segmentsRadius.map((radius, i) => (
                            <input
                                key={i}
                                type="number"
                                value={radius}
                                onChange={e => {
                                    const newRadius = parseInt(e.target.value);
                                    const updatedLimbs = [...tempConfig.limbs];
                                    updatedLimbs[index].segmentsRadius[i] = newRadius;
                                    setTempConfig({ ...tempConfig, limbs: updatedLimbs });
                                }}
                            />
                        ))}
                    </td>
                    <td>
                        <input
                            type="number"
                            value={limb.linkSize}
                            onChange={e => {
                                const linkSize = parseInt(e.target.value);
                                const updatedLimbs = [...tempConfig.limbs];
                                updatedLimbs[index] = { ...updatedLimbs[index], linkSize };
                                setTempConfig({ ...tempConfig, limbs: updatedLimbs });
                            }}
                        />
                    </td>
                    <td>
                        <input
                            type="number"
                            value={limb.angleConstraint}
                            onChange={e => {
                                const angleConstraint = parseFloat(e.target.value);
                                const updatedLimbs = [...tempConfig.limbs];
                                updatedLimbs[index] = { ...updatedLimbs[index], angleConstraint };
                                setTempConfig({ ...tempConfig, limbs: updatedLimbs });
                            }}
                        />
                    </td>
                    <td>
                        <select
                            value={limb.spawnDirection}
                            onChange={e => {
                                const spawnDirection = e.target.value as 'left' | 'right';
                                const updatedLimbs = [...tempConfig.limbs];
                                updatedLimbs[index] = { ...updatedLimbs[index], spawnDirection };
                                setTempConfig({ ...tempConfig, limbs: updatedLimbs });
                            }}
                        >
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                        </select>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );

    return (
        <div className={`${styles['control-side-menu']} ${isCollapsed ? styles.collapsed : ''}`}>
            <Tabs
                tabs={['Spine', 'Limbs', "Presets"]}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
            <div className={styles.content}>
                {activeTab === 'Spine' && renderSpineSettings()}
                {activeTab === 'Limbs' && renderLimbSettings()}
                {activeTab === 'Presets' && renderPresetSettings()}
            </div>
            <button onClick={handleSaveChanges} className={styles.saveButton}>
                Save Changes
            </button>
        </div>
    );
};

export default ControlSideMenu;
