import { ContactShadows, Decal, Environment, OrbitControls, useTexture } from "@react-three/drei";
import { Truck } from "./MemeTruck";

export const Experience = () => {
  return (
    <>
      <OrbitControls />
      <Truck />
      <ContactShadows position-y={-1} opacity={0.4} blur={2}/>
      <Environment preset="city" background blur={4} />
    </>
  );
};
