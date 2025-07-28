import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  size?: number;
    position?: [number, number, number];
};

export const ChartTexture = ({ canvasRef, size = 0.8 , position}: Props) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useRef(new THREE.Texture());
  const { camera } = useThree();

  useEffect(() => {
    if (canvasRef.current) {
      texture.current.image = canvasRef.current;
      texture.current.needsUpdate = true;
    }
  }, [canvasRef]);

  useFrame(() => {
    texture.current.needsUpdate = true;

    if (meshRef.current) {
      const distance = 1.2;

      // Get direction the camera is looking
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const targetPosition = camera.position.clone().add(dir.multiplyScalar(distance));

      // Smoothly move toward target position
      meshRef.current.position.lerp(targetPosition, 0.2);

      // Make mesh look at camera
      meshRef.current.lookAt(camera.position);
    }
  });

  return (
    <mesh ref={meshRef} position={position || [0, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture.current} transparent />
    </mesh>
  );
};
