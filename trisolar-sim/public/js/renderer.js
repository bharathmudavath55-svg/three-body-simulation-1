/**
 * renderer.js — Three.js 3D renderer for the N-body simulation
 * 
 * Handles scene setup, body meshes, trails, vectors, grid, and camera.
 */

class SimRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    
    // Three.js setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060612);
    
    this.camera = new THREE.PerspectiveCamera(
      55, window.innerWidth / window.innerHeight, 0.01, 1000
    );
    this.camera.position.set(0, 0, 6);
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Orbit controls
    this.controls = new THREE.OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.8;
    this.controls.zoomSpeed = 1.2;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 200;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
    this.scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    this.scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x4a9eff, 0.5, 50);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);
    
    // Body meshes
    this.bodyMeshes = [];
    this.bodyGlows = [];
    
    // Trails
    this.trails = [];
    this.trailPositions = []; // Array of arrays of Vector3
    this.maxTrailLength = 1500;
    this.showTrails = true;
    
    // Vectors
    this.velocityArrows = [];
    this.forceArrows = [];
    this.showVelocityVectors = false;
    this.showForceVectors = false;
    
    // Grid and axes
    this.gridHelper = null;
    this.axesHelper = null;
    this.showGrid = true;
    this.showAxes = true;
    
    // Camera mode
    this.cameraMode = 'free';
    this.followTarget = null;
    
    // Body size
    this.bodyScale = 0.2;
    
    // Selection
    this.selectedBody = -1;
    this.selectionRing = null;
    
    // Raycaster for clicking
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Init helpers
    this.initGrid();
    this.initAxes();
    
    // Starfield background
    this.initStarfield();
    
    // Resize handler
    window.addEventListener('resize', () => this.onResize());
  }

  initStarfield() {
    const starGeom = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 80 + Math.random() * 120;
      positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i*3+2] = r * Math.cos(phi);
      sizes[i] = 0.3 + Math.random() * 1.2;
    }
    
    starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starMat = new THREE.PointsMaterial({
      color: 0xaabbdd,
      size: 0.15,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7
    });
    
    this.starfield = new THREE.Points(starGeom, starMat);
    this.scene.add(this.starfield);
  }

  initGrid() {
    this.gridHelper = new THREE.GridHelper(20, 20, 0x1a1a3a, 0x111128);
    this.gridHelper.rotation.x = Math.PI / 2; // XY plane
    this.gridHelper.visible = this.showGrid;
    this.scene.add(this.gridHelper);
  }

  initAxes() {
    this.axesHelper = new THREE.AxesHelper(3);
    this.axesHelper.visible = this.showAxes;
    this.scene.add(this.axesHelper);
  }

  /**
   * Create body meshes and trails for n bodies
   */
  initBodies(n, masses, colors) {
    // Clear existing
    this.clearBodies();
    
    for (let i = 0; i < n; i++) {
      const color = new THREE.Color(colors[i % colors.length]);
      const massScale = Math.cbrt(masses[i]) * this.bodyScale;
      
      // Main sphere
      const geom = new THREE.SphereGeometry(massScale, 32, 24);
      const mat = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        shininess: 80,
        specular: 0x444444
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.userData.bodyIndex = i;
      this.scene.add(mesh);
      this.bodyMeshes.push(mesh);
      
      // Glow sprite
      const glowCanvas = document.createElement('canvas');
      glowCanvas.width = 64;
      glowCanvas.height = 64;
      const ctx = glowCanvas.getContext('2d');
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, `rgba(${(color.r*255)|0}, ${(color.g*255)|0}, ${(color.b*255)|0}, 0.6)`);
      gradient.addColorStop(0.4, `rgba(${(color.r*255)|0}, ${(color.g*255)|0}, ${(color.b*255)|0}, 0.2)`);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      
      const glowTex = new THREE.CanvasTexture(glowCanvas);
      const glowMat = new THREE.SpriteMaterial({
        map: glowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const glow = new THREE.Sprite(glowMat);
      glow.scale.set(massScale * 4, massScale * 4, 1);
      this.scene.add(glow);
      this.bodyGlows.push(glow);
      
      // Trail line
      const trailGeom = new THREE.BufferGeometry();
      const trailPositions = new Float32Array(this.maxTrailLength * 3);
      trailGeom.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      trailGeom.setDrawRange(0, 0);
      
      const trailMat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        linewidth: 1
      });
      const trail = new THREE.Line(trailGeom, trailMat);
      trail.frustumCulled = false;
      this.scene.add(trail);
      this.trails.push(trail);
      this.trailPositions.push([]);
      
      // Velocity arrow
      const velArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1,
        0x00ff88, 0.1, 0.05
      );
      velArrow.visible = this.showVelocityVectors;
      this.scene.add(velArrow);
      this.velocityArrows.push(velArrow);
      
      // Force arrow
      const forceArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1,
        0xff4488, 0.1, 0.05
      );
      forceArrow.visible = this.showForceVectors;
      this.scene.add(forceArrow);
      this.forceArrows.push(forceArrow);
    }
  }

  clearBodies() {
    this.bodyMeshes.forEach(m => this.scene.remove(m));
    this.bodyGlows.forEach(g => this.scene.remove(g));
    this.trails.forEach(t => this.scene.remove(t));
    this.velocityArrows.forEach(a => this.scene.remove(a));
    this.forceArrows.forEach(a => this.scene.remove(a));
    
    this.bodyMeshes = [];
    this.bodyGlows = [];
    this.trails = [];
    this.trailPositions = [];
    this.velocityArrows = [];
    this.forceArrows = [];
    
    if (this.selectionRing) {
      this.scene.remove(this.selectionRing);
      this.selectionRing = null;
    }
  }

  /**
   * Clear just the trails
   */
  clearTrails() {
    for (let i = 0; i < this.trailPositions.length; i++) {
      this.trailPositions[i] = [];
      this.trails[i].geometry.setDrawRange(0, 0);
    }
  }

  /**
   * Update body positions and trails from simulation state
   */
  update(sim) {
    for (let i = 0; i < sim.n; i++) {
      const pos = sim.getPosition(i);
      const vel = sim.getVelocity(i);
      
      // Update mesh position
      this.bodyMeshes[i].position.set(pos.x, pos.y, pos.z);
      this.bodyGlows[i].position.set(pos.x, pos.y, pos.z);
      
      // Update trail
      if (this.showTrails) {
        const tp = this.trailPositions[i];
        tp.push(new THREE.Vector3(pos.x, pos.y, pos.z));
        if (tp.length > this.maxTrailLength) tp.shift();
        
        // Update trail geometry
        const trailAttr = this.trails[i].geometry.attributes.position;
        for (let j = 0; j < tp.length; j++) {
          trailAttr.array[j*3]   = tp[j].x;
          trailAttr.array[j*3+1] = tp[j].y;
          trailAttr.array[j*3+2] = tp[j].z;
        }
        trailAttr.needsUpdate = true;
        this.trails[i].geometry.setDrawRange(0, tp.length);
      }
      
      // Update velocity arrow
      if (this.showVelocityVectors) {
        const velLen = Math.sqrt(vel.x*vel.x + vel.y*vel.y + vel.z*vel.z);
        if (velLen > 1e-10) {
          const dir = new THREE.Vector3(vel.x, vel.y, vel.z).normalize();
          this.velocityArrows[i].position.set(pos.x, pos.y, pos.z);
          this.velocityArrows[i].setDirection(dir);
          this.velocityArrows[i].setLength(Math.min(velLen * 0.5, 3), 0.15, 0.08);
          this.velocityArrows[i].visible = true;
        }
      } else {
        this.velocityArrows[i].visible = false;
      }
      
      // Update force arrow
      if (this.showForceVectors) {
        const acc = sim.getAcceleration(i);
        const accLen = Math.sqrt(acc.x*acc.x + acc.y*acc.y + acc.z*acc.z);
        if (accLen > 1e-10) {
          const dir = new THREE.Vector3(acc.x, acc.y, acc.z).normalize();
          this.forceArrows[i].position.set(pos.x, pos.y, pos.z);
          this.forceArrows[i].setDirection(dir);
          this.forceArrows[i].setLength(Math.min(accLen * 0.3, 3), 0.15, 0.08);
          this.forceArrows[i].visible = true;
        }
      } else {
        this.forceArrows[i].visible = false;
      }
    }
    
    // Update selection ring
    if (this.selectedBody >= 0 && this.selectedBody < sim.n) {
      this.updateSelectionRing(sim.getPosition(this.selectedBody));
    }
    
    // Camera follow
    this.updateCamera(sim);
  }

  updateCamera(sim) {
    if (this.cameraMode === 'free') return;
    
    let target;
    if (this.cameraMode === 'follow_com') {
      target = sim.centerOfMass();
    } else if (this.cameraMode === 'top') {
      const com = sim.centerOfMass();
      this.camera.position.set(com.x, com.y, Math.max(this.camera.position.z, 5));
      this.controls.target.set(com.x, com.y, 0);
      this.controls.update();
      return;
    } else if (this.cameraMode.startsWith('follow_')) {
      const idx = parseInt(this.cameraMode.split('_')[1]);
      if (idx < sim.n) {
        target = sim.getPosition(idx);
      } else {
        return;
      }
    }
    
    if (target) {
      const offset = this.camera.position.clone().sub(this.controls.target);
      this.controls.target.set(target.x, target.y, target.z);
      this.camera.position.set(
        target.x + offset.x,
        target.y + offset.y,
        target.z + offset.z
      );
      this.controls.update();
    }
  }

  selectBody(index) {
    this.selectedBody = index;
    if (this.selectionRing) {
      this.scene.remove(this.selectionRing);
      this.selectionRing = null;
    }
    if (index >= 0 && index < this.bodyMeshes.length) {
      const ringGeom = new THREE.RingGeometry(
        this.bodyMeshes[index].geometry.parameters.radius * 1.8,
        this.bodyMeshes[index].geometry.parameters.radius * 2.1,
        32
      );
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      this.selectionRing = new THREE.Mesh(ringGeom, ringMat);
      this.selectionRing.lookAt(this.camera.position);
      this.scene.add(this.selectionRing);
    }
  }

  updateSelectionRing(pos) {
    if (this.selectionRing) {
      this.selectionRing.position.set(pos.x, pos.y, pos.z);
      this.selectionRing.lookAt(this.camera.position);
    }
  }

  /**
   * Check if a body was clicked
   */
  pickBody(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.bodyMeshes);
    
    if (intersects.length > 0) {
      return intersects[0].object.userData.bodyIndex;
    }
    return -1;
  }

  /**
   * Update body sizes when scale changes
   */
  updateBodySizes(masses) {
    for (let i = 0; i < this.bodyMeshes.length; i++) {
      const s = Math.cbrt(masses[i]) * this.bodyScale;
      this.bodyMeshes[i].scale.setScalar(s / this.bodyMeshes[i].geometry.parameters.radius);
      this.bodyGlows[i].scale.set(s * 4, s * 4, 1);
    }
  }

  setTrailVisibility(visible) {
    this.showTrails = visible;
    this.trails.forEach(t => t.visible = visible);
  }

  setGridVisibility(visible) {
    this.showGrid = visible;
    if (this.gridHelper) this.gridHelper.visible = visible;
  }

  setAxesVisibility(visible) {
    this.showAxes = visible;
    if (this.axesHelper) this.axesHelper.visible = visible;
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Set camera position
   */
  setCameraPosition(x, y, z) {
    this.camera.position.set(x, y, z);
  }

  setCameraTarget(x, y, z) {
    this.controls.target.set(x, y, z);
  }
}
