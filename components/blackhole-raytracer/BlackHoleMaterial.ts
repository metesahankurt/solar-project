import * as THREE from 'three'

export const BlackHoleUniforms = {
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(1920, 1080) },
  uMass: { value: 1.0 },
  uDiskTemp: { value: 1.5 },
  uDiskDensity: { value: 1.2 },
  uLensingStrength: { value: 1.0 },
  uPerspective: { value: 1.0 },
  uQuality: { value: 2.0 },
  uBackground: { value: null as any }
}

export const BlackHoleVertexShader = /*glsl*/`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

export const BlackHoleFragmentShader = /*glsl*/`
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uMass;
    uniform float uDiskTemp;
    uniform float uDiskDensity;
    uniform float uLensingStrength;
    uniform float uPerspective;
    uniform float uQuality;
    uniform sampler2D uBackground;

    varying vec2 vUv;

    #define MAX_STEPS 120
    #define MAX_DIST 20.0
    #define PI 3.14159265359

    mat2 rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
    }

    // High quality hash for starry background
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    // 3D noise for accretion disk
    float hash3(vec3 p) {
      p = fract(p * vec3(123.34, 456.21, 789.12));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y * p.z);
    }
    
    float noise3(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float n = mix(
        mix(
          mix(hash3(i + vec3(0,0,0)), hash3(i + vec3(1,0,0)), f.x),
          mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x),
          f.y
        ),
        mix(
          mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x),
          mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x),
          f.y
        ),
        f.z
      );
      return n;
    }

    float fbm3(vec3 p) {
      float f = 0.0;
      float w = 0.5;
      for (int i = 0; i < 4; i++) {
        f += w * noise3(p);
        p *= 2.0;
        w *= 0.5;
      }
      return f;
    }

    void main() {
      // Safe resolution logic to avoid black screen on mount
      vec2 res = uResolution;
      if(res.x < 1.0) res = vec2(1920.0, 1080.0);
      
      vec2 uv = (vUv - 0.5) * 2.0;
      uv.x *= res.x / res.y;

      // Camera
      vec3 ro = vec3(0.0, 0.3 + uPerspective * 0.5, -6.0); 
      vec3 rd = normalize(vec3(uv, 2.0));
      
      // Look slightly down towards the black hole
      float tilt = -0.05 - uPerspective * 0.05;
      ro.yz *= rot(tilt);
      rd.yz *= rot(tilt);
      
      // Physics constants
      float Rs = uMass * 0.5; // Event horizon radius
      float ISCO = Rs * 3.0;  // Innermost stable circular orbit
      
      vec3 col = vec3(0.0);
      vec3 pos = ro;
      vec3 dir = rd;
      
      float dt = 0.1;
      vec3 diskAccum = vec3(0.0);
      bool hitBH = false;
      
      // Cap iterations robustly
      for(int i = 0; i < MAX_STEPS; i++) {
        float r = length(pos);
        
        // Inside Event Horizon
        if(r < Rs) {
          hitBH = true;
          break;
        }
        
        // Ray escaped to infinity (stars)
        if(r > MAX_DIST) break;

        // Gravitational lensing: continuous deflection
        // Bend direction vector towards the origin based on gravity strength
        vec3 gravity = -normalize(pos) * (uLensingStrength * Rs * 0.8) / (r * r);
        dir = normalize(dir + gravity * dt);
        
        // Accumulate Accretion Disk (lives on XZ plane, y ~ 0)
        float diskThickness = 0.15 + (r - ISCO) * 0.02; // Flared edge
        if (abs(pos.y) < diskThickness) {
           float dR = length(pos.xz);
           
           if (dR > ISCO && dR < ISCO * 4.0) {
             // Normalized distance through disk thickness (0 at center, 1 at edge)
             float vDist = abs(pos.y) / diskThickness;
             float density = 1.0 - smoothstep(0.0, 1.0, vDist);
             
             // Radial falloff of density
             float radialDensity = smoothstep(ISCO, ISCO + Rs, dR) * smoothstep(ISCO * 4.0, ISCO * 2.0, dR);
             
             // Doppler beaming (brighter when matter moves towards us)
             // Fluid rotates around Y axis (counter-clockwise)
             vec3 velocity = normalize(vec3(-pos.z, 0.0, pos.x));
             float doppler = 1.0 + dot(dir, velocity) * 0.85; // Relativistic beaming
             doppler = max(0.05, doppler); 
             doppler = pow(doppler, 3.0); // Amplify visual impact
             
             // Swirling gas texture
             float angle = atan(pos.z, pos.x);
             // Twist coordinate space to make spirals
             vec3 spiralPos = pos;
             spiralPos.xz *= rot(-angle * 2.0 + uTime * (Rs/dR));
             float noise = fbm3(spiralPos * 2.0);
             noise = smoothstep(0.2, 0.8, noise);
             
             // Colors based on temperature & distance
             // Inner disk is hot blue/white, outer disk is orange/red
             float tempFactor = (dR - ISCO) / ((ISCO * 4.0) - ISCO);
             vec3 hotCol = vec3(1.0, 0.9, 0.8);
             vec3 midCol = vec3(1.0, 0.6, 0.2);
             vec3 coldCol= vec3(0.5, 0.1, 0.0);
             
             vec3 baseCol = mix(hotCol, midCol, smoothstep(0.0, 0.4, tempFactor));
             baseCol = mix(baseCol, coldCol, smoothstep(0.4, 1.0, tempFactor));
             baseCol *= uDiskTemp;
             
             // Alpha blend
             float alpha = density * radialDensity * noise * uDiskDensity * 0.15;
             diskAccum += baseCol * alpha * doppler;
           }
        }
        
        // Take step
        // Slow down step size near the event horizon for accuracy
        float curDt = dt * clamp(r / (Rs * 3.0), 0.2, 1.0);
        pos += dir * curDt;
      }
      
      if(hitBH) {
        // Void
        col = vec3(0.0);
      } else {
        // Background Starfield (ESO Image)
        vec3 bgDir = normalize(dir);
        
        // Equirectangular mapping for the spherical background
        float u = 0.5 + atan(bgDir.z, -bgDir.x) / (2.0 * PI);
        float v = 0.5 + asin(bgDir.y) / PI;
        
        // Sample texture
        col = texture2D(uBackground, vec2(u, v)).rgb;
      }
      
      // Composite accretion disk over background
      col += diskAccum;
      
      // Soft bloom around the singularity
      float bloom = exp(-length(uv) * 1.5) * uDiskDensity * 0.2 * uDiskTemp;
      col += vec3(1.0, 0.8, 0.6) * bloom;
      
      // Cinematic ACES Tonemapping
      col = clamp(col, 0.0, 5.0);
      col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
      
      // Gamma correction
      col = pow(col, vec3(1.0 / 2.2));
      
      // Vignette
      float vignette = length(uv) * 0.4;
      col *= 1.0 - vignette * vignette;
      
      gl_FragColor = vec4(col, 1.0);
    }
`

