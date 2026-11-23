/**
 * ui.js — UI controller for sidebar, controls, body editor, and URL sharing
 */

class UIController {
  constructor(app) {
    this.app = app;
    this.sidebarOpen = true;
    
    // Cache DOM elements
    this.els = {
      sidebar: document.getElementById('sidebar'),
      sidebarToggle: document.getElementById('sidebarToggle'),
      presetSelect: document.getElementById('presetSelect'),
      nBodies: document.getElementById('nBodies'),
      nBodiesVal: document.getElementById('nBodiesVal'),
      integrator: document.getElementById('integrator'),
      dt: document.getElementById('dt'),
      dtVal: document.getElementById('dtVal'),
      speed: document.getElementById('speed'),
      speedVal: document.getElementById('speedVal'),
      gConst: document.getElementById('gConst'),
      gVal: document.getElementById('gVal'),
      softening: document.getElementById('softening'),
      softenVal: document.getElementById('softenVal'),
      bodySize: document.getElementById('bodySize'),
      bodySizeVal: document.getElementById('bodySizeVal'),
      trailLength: document.getElementById('trailLength'),
      trailLenVal: document.getElementById('trailLenVal'),
      showTrails: document.getElementById('showTrails'),
      showVectors: document.getElementById('showVectors'),
      showForces: document.getElementById('showForces'),
      showGrid: document.getElementById('showGrid'),
      showAxes: document.getElementById('showAxes'),
      cameraMode: document.getElementById('cameraMode'),
      bodyEditor: document.getElementById('bodyEditor'),
      btnPlayPause: document.getElementById('btnPlayPause'),
      btnReset: document.getElementById('btnReset'),
      btnRewind: document.getElementById('btnRewind'),
      btnStep: document.getElementById('btnStep'),
      btnShare: document.getElementById('btnShare'),
      shareMsg: document.getElementById('shareMsg'),
      timeDisplay: document.getElementById('timeDisplay'),
      energyDisplay: document.getElementById('energyDisplay'),
      fpsDisplay: document.getElementById('fpsDisplay'),
      infoOverlay: document.getElementById('infoOverlay'),
      btnCloseInfo: document.getElementById('btnCloseInfo')
    };
    
    this.bindEvents();
    this.loadFromURL();
  }

  bindEvents() {
    // Sidebar toggle
    this.els.sidebarToggle.addEventListener('click', () => {
      this.sidebarOpen = !this.sidebarOpen;
      this.els.sidebar.classList.toggle('collapsed', !this.sidebarOpen);
      this.els.sidebarToggle.textContent = this.sidebarOpen ? '◀' : '▶';
    });

    // Preset
    this.els.presetSelect.addEventListener('change', () => {
      this.app.loadPreset(this.els.presetSelect.value);
      this.refreshBodyEditor();
    });

    // Number of bodies
    this.els.nBodies.addEventListener('input', () => {
      this.els.nBodiesVal.textContent = this.els.nBodies.value;
    });
    this.els.nBodies.addEventListener('change', () => {
      this.app.setNBodies(parseInt(this.els.nBodies.value));
      this.refreshBodyEditor();
      this.updateCameraOptions();
    });

    // Integrator
    this.els.integrator.addEventListener('change', () => {
      this.app.sim.integrator = this.els.integrator.value;
    });

    // Time step (logarithmic)
    this.els.dt.addEventListener('input', () => {
      const val = Math.pow(10, parseFloat(this.els.dt.value));
      this.els.dtVal.textContent = val.toExponential(1);
      this.app.sim.dt = val;
    });

    // Speed
    this.els.speed.addEventListener('input', () => {
      this.els.speedVal.textContent = parseFloat(this.els.speed.value).toFixed(1);
      this.app.speed = parseFloat(this.els.speed.value);
    });

    // Gravity
    this.els.gConst.addEventListener('input', () => {
      this.els.gVal.textContent = parseFloat(this.els.gConst.value).toFixed(2);
      this.app.sim.G = parseFloat(this.els.gConst.value);
    });

    // Softening
    this.els.softening.addEventListener('input', () => {
      this.els.softenVal.textContent = parseFloat(this.els.softening.value).toFixed(2);
      this.app.sim.softening = parseFloat(this.els.softening.value);
    });

    // Body size
    this.els.bodySize.addEventListener('input', () => {
      this.els.bodySizeVal.textContent = parseFloat(this.els.bodySize.value).toFixed(2);
      this.app.renderer.bodyScale = parseFloat(this.els.bodySize.value);
      this.app.renderer.updateBodySizes(this.app.sim.masses);
    });

    // Trail length
    this.els.trailLength.addEventListener('input', () => {
      this.els.trailLenVal.textContent = this.els.trailLength.value;
      this.app.renderer.maxTrailLength = parseInt(this.els.trailLength.value);
    });

    // Display toggles
    this.els.showTrails.addEventListener('change', () => {
      this.app.renderer.setTrailVisibility(this.els.showTrails.checked);
    });
    this.els.showVectors.addEventListener('change', () => {
      this.app.renderer.showVelocityVectors = this.els.showVectors.checked;
    });
    this.els.showForces.addEventListener('change', () => {
      this.app.renderer.showForceVectors = this.els.showForces.checked;
    });
    this.els.showGrid.addEventListener('change', () => {
      this.app.renderer.setGridVisibility(this.els.showGrid.checked);
    });
    this.els.showAxes.addEventListener('change', () => {
      this.app.renderer.setAxesVisibility(this.els.showAxes.checked);
    });

    // Camera mode
    this.els.cameraMode.addEventListener('change', () => {
      this.app.renderer.cameraMode = this.els.cameraMode.value;
    });

    // Playback buttons
    this.els.btnPlayPause.addEventListener('click', () => this.app.togglePlay());
    this.els.btnReset.addEventListener('click', () => {
      this.app.reset();
      this.refreshBodyEditor();
    });
    this.els.btnRewind.addEventListener('click', () => this.app.rewind());
    this.els.btnStep.addEventListener('click', () => this.app.stepForward());

    // Share
    this.els.btnShare.addEventListener('click', () => this.shareURL());

    // Info overlay
    this.els.btnCloseInfo.addEventListener('click', () => {
      this.els.infoOverlay.classList.add('hidden');
      // Auto-play when closing info
      if (!this.app.playing) this.app.togglePlay();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.app.togglePlay();
          break;
        case 'KeyR':
          this.app.reset();
          this.refreshBodyEditor();
          break;
        case 'KeyH':
          this.els.infoOverlay.classList.toggle('hidden');
          break;
      }
    });

    // Click on canvas to select body
    this.app.renderer.canvas.addEventListener('click', (e) => {
      const idx = this.app.renderer.pickBody(e);
      if (idx >= 0) {
        this.app.renderer.selectBody(idx);
        this.highlightBodyCard(idx);
      }
    });
  }

  /**
   * Build the body editor cards
   */
  refreshBodyEditor() {
    const sim = this.app.sim;
    let html = '';
    
    for (let i = 0; i < sim.n; i++) {
      const pos = sim.getPosition(i);
      const vel = sim.getVelocity(i);
      const color = '#' + BODY_COLORS[i % BODY_COLORS.length].toString(16).padStart(6, '0');
      
      html += `
        <div class="body-card" id="bodyCard${i}">
          <div class="body-card-header">
            <span class="body-dot" style="background:${color}"></span>
            Body ${i + 1}
          </div>
          <div class="row">
            <label>m</label>
            <input type="number" step="0.1" value="${sim.masses[i].toFixed(3)}" 
              onchange="app.ui.setMass(${i}, this.value)">
          </div>
          <div class="row">
            <label>x</label>
            <input type="number" step="0.01" value="${pos.x.toFixed(4)}" 
              onchange="app.ui.setPos(${i}, 0, this.value)">
            <label>y</label>
            <input type="number" step="0.01" value="${pos.y.toFixed(4)}" 
              onchange="app.ui.setPos(${i}, 1, this.value)">
            <label>z</label>
            <input type="number" step="0.01" value="${pos.z.toFixed(4)}" 
              onchange="app.ui.setPos(${i}, 2, this.value)">
          </div>
          <div class="row">
            <label>vx</label>
            <input type="number" step="0.01" value="${vel.x.toFixed(4)}" 
              onchange="app.ui.setVel(${i}, 0, this.value)">
            <label>vy</label>
            <input type="number" step="0.01" value="${vel.y.toFixed(4)}" 
              onchange="app.ui.setVel(${i}, 1, this.value)">
            <label>vz</label>
            <input type="number" step="0.01" value="${vel.z.toFixed(4)}" 
              onchange="app.ui.setVel(${i}, 2, this.value)">
          </div>
        </div>
      `;
    }
    
    this.els.bodyEditor.innerHTML = html;
  }

  setMass(i, val) {
    this.app.sim.setBodyMass(i, parseFloat(val));
    this.app.renderer.updateBodySizes(this.app.sim.masses);
  }

  setPos(i, axis, val) {
    const p = this.app.sim.getPosition(i);
    const coords = [p.x, p.y, p.z];
    coords[axis] = parseFloat(val);
    this.app.sim.setBodyPosition(i, coords[0], coords[1], coords[2]);
  }

  setVel(i, axis, val) {
    const v = this.app.sim.getVelocity(i);
    const coords = [v.x, v.y, v.z];
    coords[axis] = parseFloat(val);
    this.app.sim.setBodyVelocity(i, coords[0], coords[1], coords[2]);
  }

  highlightBodyCard(idx) {
    document.querySelectorAll('.body-card').forEach(c => c.style.borderColor = '');
    const card = document.getElementById(`bodyCard${idx}`);
    if (card) {
      card.style.borderColor = '#4a9eff';
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  updateCameraOptions() {
    const cam = this.els.cameraMode;
    // Remove old follow options
    while (cam.options.length > 3) {
      cam.remove(cam.options.length - 1);
    }
    // Ensure base options
    const baseOpts = ['free', 'follow_com', 'top'];
    // Add follow options for each body
    for (let i = 0; i < this.app.sim.n; i++) {
      const opt = document.createElement('option');
      opt.value = `follow_${i}`;
      opt.textContent = `Follow Body ${i + 1}`;
      cam.appendChild(opt);
    }
  }

  /**
   * Update HUD displays
   */
  updateHUD(fps) {
    this.els.timeDisplay.textContent = `t = ${this.app.sim.time.toFixed(3)}`;
    this.els.energyDisplay.textContent = `E = ${this.app.sim.totalEnergy().toFixed(4)}`;
    this.els.fpsDisplay.textContent = `${fps} fps`;
  }

  updatePlayButton(playing) {
    this.els.btnPlayPause.querySelector('span').textContent = playing ? '⏸' : '▶';
  }

  /**
   * Generate shareable URL with current parameters
   */
  shareURL() {
    const sim = this.app.sim;
    const r = this.app.renderer;
    
    const params = new URLSearchParams();
    params.set('pr', this.els.presetSelect.value);
    params.set('n', sim.n);
    params.set('s', this.app.speed.toFixed(1));
    params.set('im', sim.integrator);
    params.set('dt', sim.dt.toExponential(2));
    params.set('G', sim.G.toFixed(2));
    params.set('so', sim.softening.toFixed(2));
    params.set('bs', r.bodyScale.toFixed(2));
    params.set('tl', r.maxTrailLength);
    params.set('st', this.els.showTrails.checked ? 1 : 0);
    params.set('sv', this.els.showVectors.checked ? 1 : 0);
    params.set('sf', this.els.showForces.checked ? 1 : 0);
    params.set('sg', this.els.showGrid.checked ? 1 : 0);
    params.set('cm', r.cameraMode);
    
    // Camera position
    const cp = r.camera.position;
    params.set('cp', `${cp.x.toFixed(4)},${cp.y.toFixed(4)},${cp.z.toFixed(4)}`);
    const ct = r.controls.target;
    params.set('ct', `${ct.x.toFixed(4)},${ct.y.toFixed(4)},${ct.z.toFixed(4)}`);
    
    // Body states
    const bodies = [];
    for (let i = 0; i < sim.n; i++) {
      const p = sim.getPosition(i);
      const v = sim.getVelocity(i);
      bodies.push({
        m: sim.masses[i],
        p: [p.x, p.y, p.z],
        v: [v.x, v.y, v.z]
      });
    }
    params.set('bodies', btoa(JSON.stringify(bodies)));
    
    const url = window.location.origin + '?' + params.toString();
    
    navigator.clipboard.writeText(url).then(() => {
      this.els.shareMsg.textContent = '✓ URL copied to clipboard!';
      setTimeout(() => { this.els.shareMsg.textContent = ''; }, 3000);
    }).catch(() => {
      // Fallback
      prompt('Copy this URL:', url);
    });
  }

  /**
   * Load parameters from URL on startup
   */
  loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.size === 0) return;
    
    this.urlParams = {};
    
    if (params.has('pr')) {
      this.urlParams.preset = params.get('pr');
      this.els.presetSelect.value = this.urlParams.preset;
    }
    if (params.has('n')) {
      this.urlParams.nBodies = parseInt(params.get('n'));
      this.els.nBodies.value = this.urlParams.nBodies;
      this.els.nBodiesVal.textContent = this.urlParams.nBodies;
    }
    if (params.has('s')) {
      this.urlParams.speed = parseFloat(params.get('s'));
      this.els.speed.value = this.urlParams.speed;
      this.els.speedVal.textContent = this.urlParams.speed.toFixed(1);
    }
    if (params.has('im')) {
      this.urlParams.integrator = params.get('im');
      this.els.integrator.value = this.urlParams.integrator;
    }
    if (params.has('dt')) {
      this.urlParams.dt = parseFloat(params.get('dt'));
      this.els.dt.value = Math.log10(this.urlParams.dt);
      this.els.dtVal.textContent = this.urlParams.dt.toExponential(1);
    }
    if (params.has('G')) {
      this.urlParams.G = parseFloat(params.get('G'));
      this.els.gConst.value = this.urlParams.G;
      this.els.gVal.textContent = this.urlParams.G.toFixed(2);
    }
    if (params.has('so')) {
      this.urlParams.softening = parseFloat(params.get('so'));
      this.els.softening.value = this.urlParams.softening;
      this.els.softenVal.textContent = this.urlParams.softening.toFixed(2);
    }
    if (params.has('bs')) {
      this.urlParams.bodySize = parseFloat(params.get('bs'));
      this.els.bodySize.value = this.urlParams.bodySize;
      this.els.bodySizeVal.textContent = this.urlParams.bodySize.toFixed(2);
    }
    if (params.has('tl')) {
      this.urlParams.trailLength = parseInt(params.get('tl'));
      this.els.trailLength.value = this.urlParams.trailLength;
      this.els.trailLenVal.textContent = this.urlParams.trailLength;
    }
    if (params.has('st')) {
      this.els.showTrails.checked = params.get('st') === '1';
    }
    if (params.has('sv')) {
      this.els.showVectors.checked = params.get('sv') === '1';
    }
    if (params.has('sf')) {
      this.els.showForces.checked = params.get('sf') === '1';
    }
    if (params.has('sg')) {
      this.els.showGrid.checked = params.get('sg') === '1';
    }
    if (params.has('cm')) {
      this.urlParams.cameraMode = params.get('cm');
    }
    if (params.has('cp')) {
      this.urlParams.cameraPos = params.get('cp').split(',').map(Number);
    }
    if (params.has('ct')) {
      this.urlParams.cameraTarget = params.get('ct').split(',').map(Number);
    }
    if (params.has('bodies')) {
      try {
        this.urlParams.bodies = JSON.parse(atob(params.get('bodies')));
      } catch (e) {
        console.warn('Failed to parse body data from URL');
      }
    }
    
    // Close info overlay if URL params exist
    this.els.infoOverlay.classList.add('hidden');
  }
}
