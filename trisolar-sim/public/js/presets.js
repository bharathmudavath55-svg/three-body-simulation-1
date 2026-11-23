/**
 * presets.js — Initial conditions for famous three-body orbits
 * 
 * All use G=1, equal masses m=1 unless noted.
 * Positions/velocities in barycentric frame.
 * 
 * Each preset includes a `recommended` block with the best-suited
 * integrator, time step, and speed for stable periodic behaviour.
 */

const PRESETS = {

  // ========== Figure-8 (Chenciner & Montgomery, 2000) ==========
  figure8: {
    name: 'Figure-8',
    masses: [1, 1, 1],
    positions: [
      [-0.97000436,  0.24308753, 0],
      [ 0.97000436, -0.24308753, 0],
      [ 0,           0,          0]
    ],
    velocities: [
      [ 0.4662036850,  0.4323657300, 0],
      [ 0.4662036850,  0.4323657300, 0],
      [-0.9324073700, -0.8647314600, 0]
    ],
    period: 6.32591398,
    recommended: { integrator: 'rk4', dt: 1e-4, speed: 8, G: 1, softening: 0 },
    description: 'Three equal masses chase each other along a figure-8 curve.'
  },

  // ========== Broucke A1 ==========
  broucke_a1: {
    name: 'Broucke A1',
    masses: [1, 1, 1],
    positions: [
      [-0.9892620043, 0, 0],
      [ 2.2096177241, 0, 0],
      [-1.2203557197, 0, 0]
    ],
    velocities: [
      [0,  1.9169244185, 0],
      [0,  0.1910268738, 0],
      [0, -2.1079512924, 0]
    ],
    period: 6.2356,
    recommended: { integrator: 'rk4', dt: 5e-5, speed: 10, G: 1, softening: 0 },
    description: 'Broucke-Hénon family A orbit, type 1.'
  },

  // ========== Broucke A2 ==========
  broucke_a2: {
    name: 'Broucke A2',
    masses: [1, 1, 1],
    positions: [
      [ 0.3361300950, 0, 0],
      [ 0.7699893804, 0, 0],
      [-1.1061194753, 0, 0]
    ],
    velocities: [
      [0,  1.5324315370, 0],
      [0, -0.6287350978, 0],
      [0, -0.9036964391, 0]
    ],
    period: 7.0039,
    recommended: { integrator: 'rk4', dt: 5e-5, speed: 10, G: 1, softening: 0 },
    description: 'Broucke-Hénon family A orbit, type 2.'
  },

  // ========== Broucke A7 ==========
  broucke_a7: {
    name: 'Broucke A7',
    masses: [1, 1, 1],
    positions: [
      [ 0.3149337497, 0, 0],
      [ 0.8124665240, 0, 0],
      [-1.1274002737, 0, 0]
    ],
    velocities: [
      [0,  1.4601869417, 0],
      [0, -0.5765462656, 0],
      [0, -0.8836406761, 0]
    ],
    period: 9.8214,
    recommended: { integrator: 'rk4', dt: 5e-5, speed: 10, G: 1, softening: 0 },
    description: 'Broucke-Hénon family A orbit, type 7.'
  },

  // ========== Butterfly I ==========
  butterfly: {
    name: 'Butterfly I',
    masses: [1, 1, 1],
    positions: [
      [-1, 0, 0],
      [ 1, 0, 0],
      [ 0, 0, 0]
    ],
    velocities: [
      [ 0.30689,  0.12551, 0],
      [ 0.30689,  0.12551, 0],
      [-0.61378, -0.25102, 0]
    ],
    period: 6.2356,
    recommended: { integrator: 'rk4', dt: 2e-5, speed: 15, G: 1, softening: 0 },
    description: 'Butterfly-shaped periodic choreography.'
  },

  // ========== Moth I ==========
  moth: {
    name: 'Moth I',
    masses: [1, 1, 1],
    positions: [
      [-1, 0, 0],
      [ 1, 0, 0],
      [ 0, 0, 0]
    ],
    velocities: [
      [ 0.46444,  0.39606, 0],
      [ 0.46444,  0.39606, 0],
      [-0.92888, -0.79212, 0]
    ],
    period: 14.8939,
    recommended: { integrator: 'rk4', dt: 2e-5, speed: 15, G: 1, softening: 0 },
    description: 'Moth-shaped periodic orbit.'
  },

  // ========== Yarn ==========
  yarn: {
    name: 'Yarn',
    masses: [1, 1, 1],
    positions: [
      [-1, 0, 0],
      [ 1, 0, 0],
      [ 0, 0, 0]
    ],
    velocities: [
      [ 0.55906,  0.34919, 0],
      [ 0.55906,  0.34919, 0],
      [-1.11812, -0.69838, 0]
    ],
    period: 55.789,
    recommended: { integrator: 'rk4', dt: 2e-5, speed: 20, G: 1, softening: 0 },
    description: 'Complex yarn-like periodic orbit.'
  },

  // ========== Yin-Yang I ==========
  yin_yang_1: {
    name: 'Yin-Yang I',
    masses: [1, 1, 1],
    positions: [
      [-1, 0, 0],
      [ 1, 0, 0],
      [ 0, 0, 0]
    ],
    velocities: [
      [ 0.51394,  0.30474, 0],
      [ 0.51394,  0.30474, 0],
      [-1.02788, -0.60948, 0]
    ],
    period: 17.3284,
    recommended: { integrator: 'rk4', dt: 2e-5, speed: 15, G: 1, softening: 0 },
    description: 'Yin-Yang shaped periodic orbit.'
  },

  // ========== Lagrange (Equilateral Triangle) ==========
  lagrange: {
    name: 'Lagrange (Equilateral)',
    masses: [1, 1, 1],
    positions: [
      [ 1,          0,          0],
      [-0.5,        0.86602540, 0],
      [-0.5,       -0.86602540, 0]
    ],
    velocities: [
      [ 0,          0.57735027, 0],
      [-0.5,       -0.28867513, 0],
      [ 0.5,       -0.28867513, 0]
    ],
    period: 7.1429,
    recommended: { integrator: 'verlet', dt: 1e-4, speed: 10, G: 1, softening: 0 },
    description: 'Three bodies orbit in an equilateral triangle formation.'
  },

  // ========== Euler (Collinear) ==========
  euler: {
    name: 'Euler (Collinear)',
    masses: [1, 1, 1],
    positions: [
      [-1, 0, 0],
      [ 0, 0, 0],
      [ 1, 0, 0]
    ],
    velocities: [
      [0,  0.5, 0],
      [0, -1.0, 0],
      [0,  0.5, 0]
    ],
    period: 2.3834,
    recommended: { integrator: 'rk4', dt: 5e-5, speed: 8, G: 1, softening: 0 },
    description: 'Euler collinear periodic orbit.'
  },

  // ========== Pythagorean 3-Body ==========
  pyth_3body: {
    name: 'Pythagorean 3-Body',
    masses: [3, 4, 5],
    positions: [
      [ 1,  3, 0],
      [-2, -1, 0],
      [ 1, -1, 0]
    ],
    velocities: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ],
    period: null,
    recommended: { integrator: 'rk4', dt: 1e-5, speed: 30, G: 1, softening: 0.001 },
    description: 'Masses 3, 4, 5 at vertices of a right triangle. Chaotic evolution.'
  },

  // ========== Sun-Earth-Moon (hierarchical) ==========
  solar: {
    name: 'Sun-Earth-Moon',
    masses: [100, 1, 0.01],
    positions: [
      [0,   0, 0],
      [5,   0, 0],
      [5.2, 0, 0]
    ],
    velocities: [
      [0, 0,    0],
      [0, 4.47, 0],
      [0, 5.1,  0]
    ],
    period: null,
    recommended: { integrator: 'verlet', dt: 5e-5, speed: 15, G: 1, softening: 0 },
    description: 'A hierarchical system: massive star with planet and moon.'
  },

  // ========== Binary + Planet ==========
  binary_star: {
    name: 'Binary + Planet',
    masses: [10, 10, 0.1],
    positions: [
      [-0.5, 0, 0],
      [ 0.5, 0, 0],
      [ 4,   0, 0]
    ],
    velocities: [
      [0, -2.236, 0],
      [0,  2.236, 0],
      [0,  2.5,   0]
    ],
    period: null,
    recommended: { integrator: 'verlet', dt: 1e-4, speed: 12, G: 1, softening: 0 },
    description: 'Two equal-mass stars with a lightweight planet in orbit.'
  },

  // ========== Random ==========
  random: {
    name: 'Random',
    recommended: { integrator: 'rk4', dt: 5e-4, speed: 8, G: 1, softening: 0.01 },
    generate: function(n) {
      const masses = [];
      const positions = [];
      const velocities = [];
      for (let i = 0; i < n; i++) {
        masses.push(0.5 + Math.random() * 1.5);
        positions.push([
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 0.5
        ]);
        velocities.push([
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 0.2
        ]);
      }
      let comX = 0, comY = 0, comZ = 0, totalMass = 0;
      let comVX = 0, comVY = 0, comVZ = 0;
      for (let i = 0; i < n; i++) {
        comX += masses[i] * positions[i][0];
        comY += masses[i] * positions[i][1];
        comZ += masses[i] * positions[i][2];
        comVX += masses[i] * velocities[i][0];
        comVY += masses[i] * velocities[i][1];
        comVZ += masses[i] * velocities[i][2];
        totalMass += masses[i];
      }
      for (let i = 0; i < n; i++) {
        positions[i][0] -= comX / totalMass;
        positions[i][1] -= comY / totalMass;
        positions[i][2] -= comZ / totalMass;
        velocities[i][0] -= comVX / totalMass;
        velocities[i][1] -= comVY / totalMass;
        velocities[i][2] -= comVZ / totalMass;
      }
      return { masses, positions, velocities, period: null };
    },
    description: 'Random initial conditions (centered at COM).'
  }
};

const BODY_COLORS = [
  0xff6b6b,
  0x4ecdc4,
  0xffe66d,
  0xa78bfa,
  0x34d399,
  0xf472b6,
  0x60a5fa,
  0xfb923c,
  0x22d3ee,
  0xe879f9
];

function getPreset(id, nBodies) {
  const preset = PRESETS[id];
  if (!preset) return getPreset('figure8', nBodies);
  
  if (preset.generate) {
    const generated = preset.generate(nBodies || 3);
    return { ...preset, ...generated };
  }
  
  const result = {
    name: preset.name,
    masses: [...preset.masses],
    positions: preset.positions.map(p => [...p]),
    velocities: preset.velocities.map(v => [...v]),
    period: preset.period,
    recommended: preset.recommended ? { ...preset.recommended } : null,
    description: preset.description
  };
  
  const existing = result.masses.length;
  if (nBodies && nBodies > existing) {
    for (let i = existing; i < nBodies; i++) {
      result.masses.push(0.5);
      result.positions.push([
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 1
      ]);
      result.velocities.push([
        (Math.random() - 0.5) * 1,
        (Math.random() - 0.5) * 1,
        0
      ]);
    }
  } else if (nBodies && nBodies < existing) {
    result.masses = result.masses.slice(0, nBodies);
    result.positions = result.positions.slice(0, nBodies);
    result.velocities = result.velocities.slice(0, nBodies);
  }
  
  return result;
}
