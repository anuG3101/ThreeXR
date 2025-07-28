import React, { forwardRef, useRef } from 'react';
import { useGLTF, PresentationControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { FloatingButton } from './floating-button';



type GLTFProps = {
  path?: string;
  position?: [number, number, number];
  onBackToChat: () => void;
};

const ThreeDmodelHandler = forwardRef<unknown, GLTFProps>((props, ref) => {
  const { position, path, onBackToChat } = props;
  const modelRef = useRef<Group>(null);
  const { camera } = useThree();

  const modelPath = path ?? process.env.PUBLIC_URL + '/threeDModels/robotArmV1_2.gltf';
  const { scene } = useGLTF(modelPath);
  const finalScale = 0.01;

  useFrame(() => {
    if (modelRef.current) {
      const distanceFromCamera = 1;
      const direction = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const targetPosition = camera.position.clone().add(direction.multiplyScalar(distanceFromCamera));
      modelRef.current.position.lerp(targetPosition, 0.2);
    }
  });



  return (
    <>
      <PresentationControls
        global
        zoom={1}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 2, Math.PI / 2]}
        azimuth={[-Infinity, Infinity]}
      >
        <group ref={modelRef} position={position} scale={finalScale}>
          <primitive object={scene} />
        </group>
      </PresentationControls>

      <FloatingButton
        label="Back to Chat"
        onClick={() => onBackToChat()}
      />

    </>

  );
});

export default ThreeDmodelHandler;
