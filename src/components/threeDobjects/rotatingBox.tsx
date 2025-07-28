
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Mesh, Vector3 } from 'three'

type RotatingBoxProps = {
  position?: [number, number, number]
}

export const RotatingBox: React.FC<RotatingBoxProps> = ({position = [0, 0, 0] }) => {
  const meshRef = useRef<Mesh>(null)
   const { camera } = useThree()
  const targetPosition = new Vector3()


  //Rotate the box on every frame
  useFrame(() => {
if (meshRef.current) {
      const distance = 1.2;

            meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.02;

      // Get direction the camera is looking
      const dir = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const targetPosition = camera.position.clone().add(dir.multiplyScalar(distance));

      // Smoothly move toward target position
      meshRef.current.position.copy(targetPosition);

      // Make mesh look at camera
      meshRef.current.lookAt(camera.position);
    }
  })
  

  return (
     <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  )
}