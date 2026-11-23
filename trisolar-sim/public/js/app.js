/**
 * app.js — Main application controller
 * 
 * Wires together the simulation, renderer, and UI.
 */

class App {
  constructor() {
    this.canvas = document.getElementById('simCanvas');
    
    // Create renderer
    this.renderer = new SimRenderer(this.canvas);
    
    // Create simulation
    this.sim = new NBodySimulation({
      G: 1.0,
      softening: 0,
      dt: 5e-4,
      integrator: 'rk4'
    });
    
    // State
    this.playing = false;
    this.speed = 5.0;
    this.currentPreset = 'figure8';
    this.stepsPerFrame = 10;
    
    // FPS tracking
    this.frameCount = 0;
    this.lastFpsTime = performance.now();
    this.currentFps = 60;
    
    // Create UI (must be after sim and renderer)
    this.ui = new UIController(this);
    
    // Initialize from URL params or default preset
    this.initFromParams();
    
    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initFromParams() {
    const params = this.ui.urlParams || {};
    
    // Apply simulation params from URL
    if (params.integrator) this.sim.integrator = params.integrator;
    if (params.dt) this.sim.dt = params.dt;
    if (params.G) this.sim.G = params.G;
    if (params.softening) this.sim.softening = params.softening;
    if (params.speed) this.speed = params.speed;
    if (params.bodySize) this.renderer.bodyScale = params.bodySize;
    if (params.trailLength) this.renderer.maxTrailLength = params.trailLength;
    
    // Load preset
    const presetId = params.preset || 'figure8';
    const nBodies = params.nBodies || 3;
    this.loadPreset(presetId, nBodies);
    
    // Override body states from URL
    if (params.bodies && Array.isArray(params.bodies)) {
      const bodies = params.bodies;
      for (let i = 0; i < Math.min(bodies.length, this.sim.n); i++) {
        if (bodies[i].m !== undefined) this.sim.setBodyMass(i, bodies[i].m);
        if (bodies[i].p) this.sim.setBodyPosition(i, bodies[i].p[0], bodies[i].p[1], bodies[i].p[2]);
        if (bodies[i].v) this.sim.setBodyVelocity(i, bodies[i].v[0], bodies[i].v[1], bodies[i].v[2]);
      }
      this.renderer.updateBodySizes(this.sim.masses);
      this.ui.refreshBodyEditor();
    }
    
    // Camera
    if (params.cameraPos) {
      this.renderer.setCameraPosition(params.cameraPos[0], params.cameraPos[1], params.cameraPos[2]);
    }
    if (params.cameraTarget) {
      this.renderer.setCameraTarget(params.cameraTarget[0], params.cameraTarget[1], params.cameraTarget[2]);
    }
    if (params.cameraMode) {
      this.renderer.cameraMode = params.cameraMode;
    }
    
    // Display settings
    this.renderer.setTrailVisibility(document.getElementById('showTrails').checked);
    this.renderer.showVelocityVectors = document.getElementById('showVectors').checked;
    this.renderer.showForceVectors = document.getElementById('showForces').checked;
    this.renderer.setGridVisibility(document.getElementById('showGrid').checked);
    this.renderer.setAxesVisibility(document.getElementById('showAxes').checked);
    
    // Auto-play if loaded from URL
    if (this.ui.urlParams && Object.keys(this.ui.urlParams).length > 0) {
      this.playing = true;
      this.ui.updatePlayButton(true);
    }
  }

  /**
   * Load a preset configuration.
   * Automatically applies the preset's recommended integrator, dt, speed,
   * G, and softening so periodic orbits stay stable out of the box.
   */
  loadPreset(id, nBodies) {
    this.currentPreset = id;
    const n = nBodies || parseInt(document.getElementById('nBodies').value) || 3;
    const preset = getPreset(id, n);

    // ---- Apply recommended settings BEFORE initialising sim ----
    if (preset.recommended) {
      const rec = preset.recommended;

      // Integrator
      if (rec.integrator) {
        this.sim.integrator = rec.integrator;
        document.getElementById('integrator').value = rec.integrator;
      }
      // Time step
      if (rec.dt !== undefined) {
        this.sim.dt = rec.dt;
        document.getElementById('dt').value = Math.log10(rec.dt);
        document.getElementById('dtVal').textContent = rec.dt.toExponential(1);
      }
      // Speed
      if (rec.speed !== undefined) {
        this.speed = rec.speed;
        document.getElementById('speed').value = rec.speed;
        document.getElementById('speedVal').textContent = rec.speed.toFixed(1);
      }
      // G
      if (rec.G !== undefined) {
        this.sim.G = rec.G;
        document.getElementById('gConst').value = rec.G;
        document.getElementById('gVal').textContent = rec.G.toFixed(2);
      }
      // Softening
      if (rec.softening !== undefined) {
        this.sim.softening = rec.softening;
        document.getElementById('softening').value = rec.softening;
        document.getElementById('softenVal').textContent = rec.softening.toFixed(2);
      }
    }

    // Initialize simulation
    this.sim.init(preset.masses, preset.positions, preset.velocities);
    
    // Initialize renderer bodies
    this.renderer.initBodies(this.sim.n, preset.masses, BODY_COLORS);
    
    // Update UI
    this.ui.refreshBodyEditor();
    this.ui.updateCameraOptions();
    
    // Update nBodies slider
    document.getElementById('nBodies').value = this.sim.n;
    document.getElementById('nBodiesVal').textContent = this.sim.n;
  }

  /**
   * Change number of bodies
   */
  setNBodies(n) {
    this.loadPreset(this.currentPreset, n);
  }

  /**
   * Toggle play/pause
   */
  togglePlay() {
    this.playing = !this.playing;
    this.ui.updatePlayButton(this.playing);
  }

  /**
   * Reset to current preset
   */
  reset() {
    this.loadPreset(this.currentPreset);
    this.playing = false;
    this.ui.updatePlayButton(false);
  }

  /**
   * Rewind to beginning via history
   */
  rewind() {
    if (this.sim.history.length > 0) {
      this.sim.restoreFromHistory(0);
      this.renderer.clearTrails();
      this.playing = false;
      this.ui.updatePlayButton(false);
      this.ui.refreshBodyEditor();
    }
  }

  /**
   * Single step forward
   */
  stepForward() {
    this.playing = false;
    this.ui.updatePlayButton(false);
    this.sim.advance(this.stepsPerFrame);
    this.renderer.update(this.sim);
    this.ui.updateHUD(this.currentFps);
  }

  /**
   * Main animation loop
   */
  animate(timestamp) {
    requestAnimationFrame(this.animate);
    
    // FPS calculation
    this.frameCount++;
    const elapsed = timestamp - this.lastFpsTime;
    if (elapsed >= 1000) {
      this.currentFps = Math.round(this.frameCount * 1000 / elapsed);
      this.frameCount = 0;
      this.lastFpsTime = timestamp;
    }
    
    // Simulation steps
    if (this.playing) {
      // Calculate steps per frame based on speed
      const steps = Math.max(1, Math.round(this.speed * 2));
      this.sim.advance(steps);
    }
    
    // Update renderer
    this.renderer.update(this.sim);
    
    // Update HUD every few frames
    if (this.frameCount % 5 === 0) {
      this.ui.updateHUD(this.currentFps);
    }
    
    // Render
    this.renderer.render();
  }
}

// ===== Start application =====
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new App();
});
