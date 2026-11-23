# Trisolar - Three-Body Gravitational Physics Simulator

An interactive 3D WebGL N-body gravitational physics simulator inspired by **trisolarchaos.com**, modeling chaotic and periodic orbits in the 3-body problem using Newton's laws of universal gravitation.

---

## 🌟 Key Features

### 1. Physics Engine (`public/js/simulation.js`)
* **Numerical Integrators**:
  * **RK4 (4th-order Runge-Kutta)** for high accuracy.
  * **Velocity Verlet** (symplectic integrator) preserving energy and angular momentum over long time horizons.
  * **Euler** method for step-by-step comparison.
* **Gravitational Parameters**:
  * Gravitational constant $G$ customization.
  * Softening factor $\epsilon$ to prevent numerical singularities during close stellar encounters.
  * Adaptive time step $\Delta t$ logarithmic adjustment.
* **Conservation Diagnostics**:
  * Real-time calculation of total energy $E = KE + PE$ and Center of Mass tracking.
  * State history recording for rewinding and time scrubbing.

### 2. 3D WebGL Visualization (`public/js/renderer.js`)
* Powered by **Three.js** and **OrbitControls**.
* Dynamic celestial glowing spheres scaled by cube root of mass ($\sim \sqrt[3]{m}$).
* Multi-colored smooth trailing orbits with configurable trail length (up to 5000 segments).
* Real-time velocity vectors (green) and gravitational force vectors (magenta).
* Starfield background, orbital reference grid, and 3D coordinate axes.
* **Camera tracking modes**:
  * Free Orbit (360° interactive rotation, pan, zoom)
  * Center of Mass tracking
  * Lock-on tracking for individual bodies (Body 1, Body 2, Body 3, etc.)
  * Top-Down XY plane view

### 3. Periodic & Chaotic Presets (`public/js/presets.js`)
* **2D Classic Choreographies**:
  * Chenciner & Montgomery **Figure-8**
  * **Butterfly I**, **Moth I**, **Yarn**, and **Yin-Yang I**
  * **Lagrange** (Equilateral triangle solution)
  * **Euler** (Collinear solution)
* **Broucke-Hénon Family**:
  * **Broucke A1**, **Broucke A2**, and **Broucke A7** (matching URL queries like `pr=broucke`)
* **Classic & Sandbox Scenarios**:
  * **Pythagorean 3-body** (3-4-5 right triangle chaotic evolution)
  * Hierarchical **Sun-Earth-Moon** system
  * **Binary Star + Planet**
  * **Random N-body generator** with automatic Center of Mass correction

### 4. Interactive Body Editor & URL State Sharing (`public/js/ui.js`)
* Click directly on any star in 3D to highlight its live coordinates ($x, y, z$), velocity ($v_x, v_y, v_z$), and mass ($m$).
* Edit any values in real time.
* **Shareable URL serialization**: Copies full simulation parameters (preset, step size, tolerances, body scale, camera position/target, and base64 encoded states) matching the format of `trisolarchaos.com`:
  ```
  ?pr=broucke_a1&n=3&s=5.0&im=rk4&dt=7.50e-5&G=1.00&so=0.00&bs=0.20&tl=1500&st=1&sv=0&sf=0&sg=1&cm=free...
  ```

### 5. Backend Server (`server.js`)
* Zero-dependency native Node.js HTTP server.
* Gzip-compressed static file delivery with SPA fallback.
* JSON REST API endpoints:
  * `GET /api/presets` — List of all orbital presets and metadata.
  * `GET /api/info` — Supported integrators and engine capabilities.

---

## 🚀 How to Run

### Option 1: Direct in Browser (Frontend)
Double click or open [`public/index.html`](file:///C:/Users/bhara/.gemini/antigravity/scratch/trisolar-sim/public/index.html) directly in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Running with Node.js Server
If you have Node.js installed on your machine:
```bash
cd trisolar-sim
node server.js
```
Then navigate to:
```
http://localhost:3000
```
Or open with your specific parameter URL:
```
http://localhost:3000/?pr=broucke_a1&n=3&s=5.0&im=rk4&dt=7.50e-5&cm=free&tl=1500
```

---

## ⌨️ Controls & Shortcuts

| Action | Control |
|---|---|
| Play / Pause | **Space** or Play button |
| Reset to Initial | **R** or Reset button |
| Step Forward | **Next** button |
| Rewind | **Rewind** button |
| Orbit Camera | **Left-click drag** |
| Pan Camera | **Right-click drag** |
| Zoom | **Mouse scroll wheel** |
| Select Body | **Click directly on any celestial sphere** |
| Toggle Help | **H** |
