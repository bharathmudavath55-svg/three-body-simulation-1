/**
 * simulation.js — N-body gravitational physics engine
 * 
 * Supports RK4, Velocity Verlet, and Euler integration.
 * All computations in 3D with configurable G and softening.
 */

class NBodySimulation {
  constructor(config) {
    this.G = config.G || 1.0;
    this.softening = config.softening || 0.0;
    this.dt = config.dt || 5e-4;
    this.integrator = config.integrator || 'rk4';
    this.n = 0;
    this.masses = [];
    this.positions = [];   // flat [x0,y0,z0, x1,y1,z1, ...]
    this.velocities = [];  // flat
    this.accelerations = []; // flat (for Verlet)
    this.time = 0;
    this.totalSteps = 0;
    this.history = [];      // for timeline scrubbing
    this.maxHistory = 10000;
    this.historyInterval = 20; // save every N steps
  }

  /**
   * Initialize bodies from preset data
   */
  init(masses, positions, velocities) {
    this.n = masses.length;
    this.masses = new Float64Array(masses);
    this.positions = new Float64Array(this.n * 3);
    this.velocities = new Float64Array(this.n * 3);
    this.accelerations = new Float64Array(this.n * 3);

    for (let i = 0; i < this.n; i++) {
      this.positions[i*3]   = positions[i][0];
      this.positions[i*3+1] = positions[i][1];
      this.positions[i*3+2] = positions[i][2];
      this.velocities[i*3]   = velocities[i][0];
      this.velocities[i*3+1] = velocities[i][1];
      this.velocities[i*3+2] = velocities[i][2];
    }

    this.time = 0;
    this.totalSteps = 0;
    this.history = [];
    
    // Initial accelerations (needed for Verlet)
    this.computeAccelerations(this.positions, this.accelerations);
    
    // Save initial state
    this.saveHistory();
  }

  /**
   * Compute gravitational accelerations for all bodies
   */
  computeAccelerations(pos, acc) {
    const n = this.n;
    const G = this.G;
    const eps2 = this.softening * this.softening;

    // Zero out
    for (let i = 0; i < n * 3; i++) acc[i] = 0;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[j*3]   - pos[i*3];
        const dy = pos[j*3+1] - pos[i*3+1];
        const dz = pos[j*3+2] - pos[i*3+2];
        
        const r2 = dx*dx + dy*dy + dz*dz + eps2;
        const r = Math.sqrt(r2);
        const r3 = r2 * r;
        
        const fOverR3 = G / r3;
        
        // Force on i from j
        acc[i*3]   += this.masses[j] * fOverR3 * dx;
        acc[i*3+1] += this.masses[j] * fOverR3 * dy;
        acc[i*3+2] += this.masses[j] * fOverR3 * dz;
        
        // Force on j from i (Newton's 3rd law)
        acc[j*3]   -= this.masses[i] * fOverR3 * dx;
        acc[j*3+1] -= this.masses[i] * fOverR3 * dy;
        acc[j*3+2] -= this.masses[i] * fOverR3 * dz;
      }
    }
  }

  /**
   * RK4 integration step
   */
  stepRK4() {
    const n = this.n;
    const dt = this.dt;
    const dim = n * 3;

    // Current state
    const pos = this.positions;
    const vel = this.velocities;

    // Temporary arrays
    const k1v = new Float64Array(dim);
    const k1a = new Float64Array(dim);
    const k2v = new Float64Array(dim);
    const k2a = new Float64Array(dim);
    const k3v = new Float64Array(dim);
    const k3a = new Float64Array(dim);
    const k4v = new Float64Array(dim);
    const k4a = new Float64Array(dim);
    const tmpPos = new Float64Array(dim);
    const tmpVel = new Float64Array(dim);

    // k1
    for (let i = 0; i < dim; i++) k1v[i] = vel[i];
    this.computeAccelerations(pos, k1a);

    // k2
    for (let i = 0; i < dim; i++) {
      tmpPos[i] = pos[i] + 0.5 * dt * k1v[i];
      tmpVel[i] = vel[i] + 0.5 * dt * k1a[i];
    }
    for (let i = 0; i < dim; i++) k2v[i] = tmpVel[i];
    this.computeAccelerations(tmpPos, k2a);

    // k3
    for (let i = 0; i < dim; i++) {
      tmpPos[i] = pos[i] + 0.5 * dt * k2v[i];
      tmpVel[i] = vel[i] + 0.5 * dt * k2a[i];
    }
    for (let i = 0; i < dim; i++) k3v[i] = tmpVel[i];
    this.computeAccelerations(tmpPos, k3a);

    // k4
    for (let i = 0; i < dim; i++) {
      tmpPos[i] = pos[i] + dt * k3v[i];
      tmpVel[i] = vel[i] + dt * k3a[i];
    }
    for (let i = 0; i < dim; i++) k4v[i] = tmpVel[i];
    this.computeAccelerations(tmpPos, k4a);

    // Update
    for (let i = 0; i < dim; i++) {
      pos[i] += (dt / 6) * (k1v[i] + 2*k2v[i] + 2*k3v[i] + k4v[i]);
      vel[i] += (dt / 6) * (k1a[i] + 2*k2a[i] + 2*k3a[i] + k4a[i]);
    }
  }

  /**
   * Velocity Verlet integration step
   */
  stepVerlet() {
    const n = this.n;
    const dt = this.dt;
    const dim = n * 3;

    // Half-step velocity
    for (let i = 0; i < dim; i++) {
      this.velocities[i] += 0.5 * dt * this.accelerations[i];
    }

    // Full-step position
    for (let i = 0; i < dim; i++) {
      this.positions[i] += dt * this.velocities[i];
    }

    // New accelerations
    this.computeAccelerations(this.positions, this.accelerations);

    // Half-step velocity (complete)
    for (let i = 0; i < dim; i++) {
      this.velocities[i] += 0.5 * dt * this.accelerations[i];
    }
  }

  /**
   * Euler integration step (basic, for comparison)
   */
  stepEuler() {
    const dim = this.n * 3;
    const acc = new Float64Array(dim);
    this.computeAccelerations(this.positions, acc);

    for (let i = 0; i < dim; i++) {
      this.positions[i] += this.dt * this.velocities[i];
      this.velocities[i] += this.dt * acc[i];
    }
  }

  /**
   * Advance simulation by one time step
   */
  step() {
    switch (this.integrator) {
      case 'rk4':    this.stepRK4(); break;
      case 'verlet': this.stepVerlet(); break;
      case 'euler':  this.stepEuler(); break;
      default:       this.stepRK4();
    }
    this.time += this.dt;
    this.totalSteps++;

    if (this.totalSteps % this.historyInterval === 0) {
      this.saveHistory();
    }
  }

  /**
   * Advance by multiple steps (for speed control)
   */
  advance(stepsPerFrame) {
    for (let s = 0; s < stepsPerFrame; s++) {
      this.step();
    }
  }

  /**
   * Save current state to history
   */
  saveHistory() {
    this.history.push({
      time: this.time,
      positions: new Float64Array(this.positions),
      velocities: new Float64Array(this.velocities)
    });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Restore state from history index
   */
  restoreFromHistory(index) {
    if (index < 0 || index >= this.history.length) return;
    const state = this.history[index];
    this.time = state.time;
    this.positions.set(state.positions);
    this.velocities.set(state.velocities);
    this.computeAccelerations(this.positions, this.accelerations);
  }

  /**
   * Compute total energy (kinetic + potential)
   */
  totalEnergy() {
    let KE = 0;
    let PE = 0;
    const n = this.n;
    const eps2 = this.softening * this.softening;

    // Kinetic energy
    for (let i = 0; i < n; i++) {
      const vx = this.velocities[i*3];
      const vy = this.velocities[i*3+1];
      const vz = this.velocities[i*3+2];
      KE += 0.5 * this.masses[i] * (vx*vx + vy*vy + vz*vz);
    }

    // Potential energy
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = this.positions[j*3]   - this.positions[i*3];
        const dy = this.positions[j*3+1] - this.positions[i*3+1];
        const dz = this.positions[j*3+2] - this.positions[i*3+2];
        const r = Math.sqrt(dx*dx + dy*dy + dz*dz + eps2);
        PE -= this.G * this.masses[i] * this.masses[j] / r;
      }
    }

    return KE + PE;
  }

  /**
   * Center of mass position
   */
  centerOfMass() {
    let cx = 0, cy = 0, cz = 0, totalM = 0;
    for (let i = 0; i < this.n; i++) {
      cx += this.masses[i] * this.positions[i*3];
      cy += this.masses[i] * this.positions[i*3+1];
      cz += this.masses[i] * this.positions[i*3+2];
      totalM += this.masses[i];
    }
    return { x: cx/totalM, y: cy/totalM, z: cz/totalM };
  }

  /**
   * Get position of body i as {x, y, z}
   */
  getPosition(i) {
    return {
      x: this.positions[i*3],
      y: this.positions[i*3+1],
      z: this.positions[i*3+2]
    };
  }

  /**
   * Get velocity of body i as {x, y, z}
   */
  getVelocity(i) {
    return {
      x: this.velocities[i*3],
      y: this.velocities[i*3+1],
      z: this.velocities[i*3+2]
    };
  }

  /**
   * Get acceleration of body i (recomputed)
   */
  getAcceleration(i) {
    const acc = new Float64Array(this.n * 3);
    this.computeAccelerations(this.positions, acc);
    return {
      x: acc[i*3],
      y: acc[i*3+1],
      z: acc[i*3+2]
    };
  }

  /**
   * Set body properties
   */
  setBodyMass(i, m) { this.masses[i] = m; }
  setBodyPosition(i, x, y, z) {
    this.positions[i*3] = x;
    this.positions[i*3+1] = y;
    this.positions[i*3+2] = z;
  }
  setBodyVelocity(i, vx, vy, vz) {
    this.velocities[i*3] = vx;
    this.velocities[i*3+1] = vy;
    this.velocities[i*3+2] = vz;
  }
}
