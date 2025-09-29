import { GPGPUParticles } from "./GPGPUParticles";

export const Experience = ({ curGeometry = "Box", shouldAnimate = false }) => {
  return (
    <>
      {/* <Environment preset="warehouse" /> */}
      <GPGPUParticles curGeometry={curGeometry} shouldAnimate={shouldAnimate} />
      {/* <mesh>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh> */}
    </>
  );
};