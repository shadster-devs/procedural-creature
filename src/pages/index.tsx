import Head from "next/head";
import Canvas from "@/components/Canvas/Canvas";
import ControlSideMenu from "@/components/ControlSideMenu/ControlSideMenu";
import {useState} from "react";

export default function Home() {
    const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <>
      <Head>
        <title>Procedural Creature</title>
      </Head>
        <div style={{height: "100%", width: "100%", position: "relative"}}>
            <button onClick={() => setIsCollapsed(!isCollapsed)} style={{
                position: "absolute",
                top: "7px",
                right: "7px",
                fontSize: "1.2rem",
                backgroundColor: "white",
                border: "none",
                color: "black",
                cursor: "pointer",
                zIndex: 1000
            }}>
                {isCollapsed ? "Open Config" : "Close"}
            </button>
            <Canvas/>
            <ControlSideMenu isCollapsed={isCollapsed}/>

        </div>
    </>
  );
}
