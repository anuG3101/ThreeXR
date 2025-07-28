import { useThree, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

type FloatingButtonProps = {
  label: string;
  onClick: () => void;
};

export const FloatingButton: React.FC<FloatingButtonProps> = ({ label, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      const offset = new THREE.Vector3(0, -0.4, -1.2);
      const cameraWorldPos = new THREE.Vector3();
      camera.getWorldPosition(cameraWorldPos);

      const cameraWorldQuat = new THREE.Quaternion();
      camera.getWorldQuaternion(cameraWorldQuat);

      const targetPos = offset.clone().applyQuaternion(cameraWorldQuat).add(cameraWorldPos);
      groupRef.current.position.copy(targetPos);
      groupRef.current.quaternion.copy(cameraWorldQuat);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh onClick={onClick}>
        {/* Smaller button box */}
        <boxGeometry args={[0.3, 0.06, 0.03]} />
        <meshStandardMaterial color="#00bcd4" />
      </mesh>
      <Text
        position={[0, 0, 0.025]}
        fontSize={0.03} // smaller font
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};
