"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Center, Bounds } from "@react-three/drei";

// configura o caminho para o decodificador draco
useGLTF.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.5/");

interface ModelProps {
  url: string;
}

function Model({ url }: ModelProps) {
  const { scene } = useGLTF(url);
  // clona a cena para evitar conflitos de renderização múltipla
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);
  return <primitive object={clonedScene} />;
}

// error boundary para capturar falhas de renderização 3d
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.error("[Island3DViewer] Falha ao renderizar modelo 3D:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface Island3DViewerProps {
  modelUrl: string;
  fallback: React.ReactNode;
}

export function Island3DViewer({ modelUrl, fallback }: Island3DViewerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return (
    <ErrorBoundary fallback={fallback}>
      <div className="w-full h-full relative">
        <Canvas
          camera={{
            position: [200, 150, 200],
            fov: 30,
            near: 1,
            far: 5000,
          }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={1.4} />
          <directionalLight position={[20, 40, 20]} intensity={2.2} />
          <directionalLight position={[-20, 25, -20]} intensity={0.5} />
          <Suspense fallback={null}>
            {/* enquadra a câmera automaticamente nos limites do modelo */}
            <Bounds fit clip observe margin={1.4}>
              <Center bottom>
                <Model url={modelUrl} />
              </Center>
            </Bounds>
          </Suspense>
          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom={true}
            minDistance={50}
            maxDistance={800}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}
