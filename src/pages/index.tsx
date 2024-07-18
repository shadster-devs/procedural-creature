import Head from "next/head";
import Canvas from "@/components/Canvas/Canvas";
import ControlSideMenu from "@/components/ControlSideMenu/ControlSideMenu";

export default function Home() {
  return (
    <>
      <Head>
        <title>Procedural Creature</title>
      </Head>
        <div style={{display: "flex", flexDirection: "row", justifyContent: "center", height: "100%", width: "100%"}}>
            <Canvas/>
            <ControlSideMenu/>
        </div>
    </>
  );
}
