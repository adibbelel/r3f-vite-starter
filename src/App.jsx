import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import Header from "./components/Header";
import CollaborativeCanvas from './components/CollaborativeCanvas';
import { use, useEffect, useState } from "react";

function App() {
  const [document, setDocument] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:3000');
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'init') {
          setDocument(message.data);
        } else if (message.type === 'update') {
          setDocument(message.data);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      newSocket.close();
    };
  }, []);

  const handleChange = (e) => {
    const newDocument = e.target.value;
    setDocument(newDocument);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'update', data: newDocument }));
    }
  };

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
    <CollaborativeCanvas
      document={document}
      onChange={handleChange}
    />
    </main>
  );
}

export default App;