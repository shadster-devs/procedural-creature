import React from "react";

export type  CreatureState = {
    numOfSegments : number
    segmentsRadius : number[]
    linkSize : number
    angleConstraint : number
}


interface CreatureStateContextProps {
    creatureState : CreatureState
    updateState : (newState : Partial<CreatureState>) => void
}

const CreatureStateContext = React.createContext<CreatureStateContextProps | undefined>(undefined)

export const useCreatureState = () => {
    const context = React.useContext(CreatureStateContext)
    if (!context) {
        throw new Error('useCreatureState must be used within a CreatureStateProvider')
    }
    return context
}

export const CreatureStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [creatureState, setCreateState] = React.useState<CreatureState>({
        numOfSegments: 50,
        segmentsRadius: Array.from({ length: 5 }, (_, i) => 50-(i/2)),
        linkSize: 30,
        angleConstraint: Math.PI/12,
    })

    React.useEffect(() => {
        setCreateState((prevState) => ({
            ...prevState,
            segmentsRadius: Array.from({ length: prevState.numOfSegments }, (_, i) => 50-(i/2))
        }))
    }, [creatureState.numOfSegments]);


    const updateState = (newState: Partial<CreatureState>) => {
        setCreateState((prevState) => ({
            ...prevState,
            ...newState
        }))
    }

    return (
        <CreatureStateContext.Provider value={{ creatureState, updateState }}>
            {children}
        </CreatureStateContext.Provider>
    )
}

export default CreatureStateProvider;