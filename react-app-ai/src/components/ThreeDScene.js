import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import helvetikerFont from 'three/examples/fonts/helvetiker_regular.typeface.json';

const MathVisualization = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Inicjalizacja sceny
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    
    // Kamera
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Efekty post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2, 0.4, 0.85
    );
    composer.addPass(bloomPass);

    // Światła
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 1. Fraktal 3D (w odcieniach niebieskiego i fioletu)
    const fractalGeometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    for (let i = 0; i < 50000; i++) {
      let x = Math.random() * 4 - 2;
      let y = Math.random() * 4 - 2;
      let z = Math.random() * 4 - 2;
      
      let nx = 0, ny = 0, nz = 0;
      let iteration = 0;
      const maxIterations = 10;
      
      while (iteration < maxIterations) {
        const xx = x * x;
        const yy = y * y;
        const zz = z * z;
        
        if (xx + yy + zz > 4) break;
        
        nz = 2 * x * y + z;
        ny = xx - yy + y;
        nx = xx - yy - zz + x;
        
        x = nx;
        y = ny;
        z = nz;
        iteration++;
      }
      
      if (iteration < maxIterations) {
        positions.push(x, y, z);
        // Kolory: niebieski -> fiolet
        const hue = 0.6 + (iteration / maxIterations) * 0.2;
        colors.push(...new THREE.Color().setHSL(hue, 0.9, 0.5).toArray());
      }
    }
    
    fractalGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    fractalGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const fractalMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const fractal = new THREE.Points(fractalGeometry, fractalMaterial);
    scene.add(fractal);

    // 2. Wirujące równania matematyczne (kolory: pomarańcz, czerwony, niebieski)
    const loader = new FontLoader();
    const font = loader.parse(helvetikerFont);
    
    const equations = [
      "f(x)=sin(x)",
      "y=∫x²dx",
      "z=cos(xy)",
      "∇·E=ρ/ε₀",
      "e^{iπ}+1=0"
    ];
    
    const equationMeshes = [];
    const equationColors = [
      0xff7b00, // pomarańczowy
      0xff2a00, // czerwień
      0x0088ff, // niebieski
      0xaa00ff, // fiolet
      0xffffff  // biały (dla równania Eulera)
    ];
    
    equations.forEach((eq, i) => {
      const geometry = new TextGeometry(eq, {
        font: font,
        size: 0.5,
        height: 0.05
      });
      
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(equationColors[i]),
        emissive: 0x111111,
        specular: 0xffffff,
        shininess: 30
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = (i - 2) * 3;
      mesh.position.y = Math.sin(i) * 2;
      equationMeshes.push(mesh);
      scene.add(mesh);
    });

    // 3. Struktura geometryczna - sześcian z siatką (zamiast torusa)
    const boxGeometry = new THREE.BoxGeometry(5, 5, 5);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    
    const box = new THREE.Mesh(boxGeometry, wireMaterial);
    scene.add(box);

    // Animacja
    const clock = new THREE.Clock();
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime();
      
      // Animacja fraktala
      fractal.rotation.x = time * 0.1;
      fractal.rotation.y = time * 0.15;
      
      // Animacja równań
      equationMeshes.forEach((mesh, i) => {
        mesh.position.y = Math.sin(time + i) * 2;
        mesh.rotation.x = Math.sin(time * 0.3 + i) * 0.5;
        mesh.rotation.y = Math.cos(time * 0.2 + i) * 0.5;
      });
      
      // Animacja sześcianu
      box.rotation.x = time * 0.15;
      box.rotation.y = time * 0.25;
      
      // Płynne poruszanie kamerą
      camera.position.x = Math.sin(time * 0.2) * 10;
      camera.position.z = 15 + Math.cos(time * 0.1) * 5;
      camera.lookAt(scene.position);
      
      composer.render();
    };
    
    animate();

    // Obsługa responsywności
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default MathVisualization;