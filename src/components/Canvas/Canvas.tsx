import React, { useRef, useEffect } from 'react';
import styles from './Canvas.module.scss';
import CreatureSimulator from "@/components/CreatureSimulator/CreatureSimulator";

interface CanvasProps {
}

const Canvas: React.FC<CanvasProps> = (props) => {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas?.getContext('2d');

        if (ctx) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }, []);

    return (
                <canvas ref={canvasRef} className={styles.canvas}>
                        <CreatureSimulator canvasRef={canvasRef}/>
                </canvas>
    );
};

export default Canvas;
