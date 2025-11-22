import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WebGPURenderer, MeshBasicNodeMaterial } from 'three/webgpu';
import { 
    Fn, 
    uniform, 
    instanceIndex, 
    float, 
    vec3, 
    vec4,
    color, 
    storage, 
    sin, 
    cos, 
    mix,
    time,
    uv,
    positionLocal
} from 'three/tsl';

const WebGPUScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WebGPURenderer | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Configuration
    const particleCount = 10000; // Ten thousand particles!
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene Setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0, 40);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050505');

    // Renderer
    const renderer = new WebGPURenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- WebGPU Compute Particle System ---

    // 1. Create Storage Buffers for positions and velocities
    const positionBuffer = new Float32Array(particleCount * 3);
    const velocityBuffer = new Float32Array(particleCount * 3);
    const colorBuffer = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Random start positions
        positionBuffer[i3] = (Math.random() - 0.5) * 20;
        positionBuffer[i3 + 1] = (Math.random() - 0.5) * 20;
        positionBuffer[i3 + 2] = (Math.random() - 0.5) * 20;

        // Random velocities
        velocityBuffer[i3] = (Math.random() - 0.5) * 0.1;
        velocityBuffer[i3 + 1] = (Math.random() - 0.5) * 0.1;
        velocityBuffer[i3 + 2] = (Math.random() - 0.5) * 0.1;
        
        // Colors
        colorBuffer[i3] = Math.random();
        colorBuffer[i3 + 1] = Math.random();
        colorBuffer[i3 + 2] = 1.0; 
    }

    const positionStorage = storage(new THREE.InstancedBufferAttribute(positionBuffer, 3), 'vec3', particleCount);
    const velocityStorage = storage(new THREE.InstancedBufferAttribute(velocityBuffer, 3), 'vec3', particleCount);

    // 2. Create Compute Update Loop
    // This runs on the GPU every frame
    const computeUpdate = Fn(() => {
        const p = positionStorage.element(instanceIndex);
        const v = velocityStorage.element(instanceIndex);
        
        // Update position by velocity
        p.addAssign(v);
        
        // Simple bounds collision/wrap
        const limit = float(20.0);
        const negLimit = limit.negate();
        
        If(p.x.greaterThan(limit), () => { p.x.assign(negLimit); });
        If(p.x.lessThan(negLimit), () => { p.x.assign(limit); });
        If(p.y.greaterThan(limit), () => { p.y.assign(negLimit); });
        If(p.y.lessThan(negLimit), () => { p.y.assign(limit); });
        If(p.z.greaterThan(limit), () => { p.z.assign(negLimit); });
        If(p.z.lessThan(negLimit), () => { p.z.assign(limit); });
        
        // Dynamic movement perturbation based on time and position
        const t = time.mul(0.5);
        v.x.addAssign(sin(p.y.mul(0.5).add(t)).mul(0.001));
        v.y.addAssign(cos(p.x.mul(0.5).add(t)).mul(0.001));
        v.z.addAssign(sin(p.z.mul(0.5).add(t)).mul(0.001));
        
        // Damping
        v.mulAssign(0.995);
    }).compute(particleCount);

    // 3. Visuals
    // Use an InstancedMesh or just a geometry with the storage buffer as position
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new MeshBasicNodeMaterial();
    
    // Connect the computed position to the vertex shader position
    // We access the storage buffer for reading in the vertex shader
    const particlePos = positionStorage.element(instanceIndex);
    
    // Offset the mesh vertex position by the particle position
    material.positionNode = positionLocal.add(particlePos);
    
    // Dynamic Color
    const speed = velocityStorage.element(instanceIndex).length();
    const colorBase = vec3(0.0, 0.5, 1.0);
    const colorHot = vec3(1.0, 0.0, 0.5);
    material.colorNode = vec4(mix(colorBase, colorHot, speed.mul(5.0)), 1.0);

    const mesh = new THREE.InstancedMesh(geometry, material, particleCount);
    // We need to set instance count effectively? 
    // In WebGPU renderer with storage buffers, we might not strictly need InstancedMesh in the traditional way 
    // if we drive everything via nodes, but InstancedMesh is the standard container.
    mesh.count = particleCount;
    scene.add(mesh);

    // Animation Loop
    const animate = () => {
      // Execute compute shader
      renderer.compute(computeUpdate);
      
      // Render scene
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(animate);

    // Resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.setAnimationLoop(null);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
};

export default WebGPUScene;
