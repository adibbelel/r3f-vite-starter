import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import Header from "./components/Header";
import CollaborativeCanvas from './components/CollaborativeCanvas';

function App() {
  return (
    <main>
      <img className="absolute top-0 right
      opacity-60 -z-10" 
      src="/textures/gradient.png" alt="Gradient-img"/>

      <div className="h-0 w-[40rem] absolute top-[20%]
      right-[-5%] shadow-[0_0_900px_20px_#63e99b] 
      -rotate-[30deg] -z-10"></div> 

      <Header />
    <Canvas shadows camera={{ position: [3, 3, 3], fov: 30 }}>
      <color attach="background" args={["#ececec"]} />
      <Experience />
    </Canvas>
    <CollaborativeCanvas />
    </main>
  );
}

export default App;