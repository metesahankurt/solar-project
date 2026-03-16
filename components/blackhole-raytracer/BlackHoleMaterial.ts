import * as THREE from 'three'

export const BlackHoleUniforms = {
  uTime: { value: 0 },
  uMass: { value: 1.0 },
  uDiskTemp: { value: 1.5 },
  uDiskDensity: { value: 1.2 },
  uLensingStrength: { value: 1.0 },
  uQuality: { value: 2.0 },
  uBackground: { value: null as any }
}

export const BlackHoleVertexShader = /*glsl*/`
    varying vec3 vWorldPos;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
`

export const BlackHoleFragmentShader = /*glsl*/`
    uniform float uTime;
    uniform float uMass;
    uniform float uDiskTemp;
    uniform float uDiskDensity;
    uniform float uLensingStrength;
    uniform float uQuality;
    uniform sampler2D uBackground;

    varying vec3 vWorldPos;

    #define MAX_DIST 25.0
    #define PI 3.14159265359

    mat2 rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
    }

    // High quality hash
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

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

    // Ultra-optimized 3D noise for performance (2 octaves)
    float fbm3(vec3 p) {
      float f = 0.0;
      float w = 0.5;
      for (int i = 0; i < 2; i++) {
        f += w * noise3(p);
        p *= 2.0;
        w *= 0.5;
      }
      return f;
    }

    void main() {
      vec3 ro = cameraPosition; 
      vec3 rd = normalize(vWorldPos - cameraPosition);
      
      // Physics constants
      float Rs = uMass * 0.5; 
      float ISCO = Rs * 3.0;  
      
      vec3 col = vec3(0.0);
      vec3 pos = ro;
      vec3 dir = rd;
      
      float dt = 0.35; // Massive step size for maximum performance
      vec3 diskAccum = vec3(0.0);
      bool hitBH = false;
      
      // Dynamic max steps. Very low for optimal performance.
      // Quality 1 = 15 steps, Quality 2 = 30 steps, Quality 3 = 45 steps
      int maxSteps = int(15.0 * uQuality);
      if (maxSteps < 10) maxSteps = 10;
      
      for(int i = 0; i < 100; i++) {
        if(i >= maxSteps) break;
        
        float r = length(pos);
        if(r < Rs) {
          hitBH = true;
          break;
        }
        if(r > MAX_DIST) break;

        // Fast Lensing approximation
        vec3 gravity = -normalize(pos) * (uLensingStrength * Rs * 0.8) / (r * r);
        dir = normalize(dir + gravity * dt);
        
        float diskThickness = 0.15 + (r - ISCO) * 0.02; 
        if (abs(pos.y) < diskThickness) {
           float dR = length(pos.xz);
           
           if (dR > ISCO && dR < ISCO * 4.0) {
             float vDist = abs(pos.y) / diskThickness;
             float density = 1.0 - smoothstep(0.0, 1.0, vDist);
             float radialDensity = smoothstep(ISCO, ISCO + Rs, dR) * smoothstep(ISCO * 4.0, ISCO * 2.0, dR);
             
             vec3 velocity = normalize(vec3(-pos.z, 0.0, pos.x));
             float doppler = 1.0 + dot(dir, velocity) * 0.85; 
             doppler = max(0.05, doppler); 
             doppler = pow(doppler, 3.0); 
             
             float angle = atan(pos.z, pos.x);
             vec3 spiralPos = pos;
             spiralPos.xz *= rot(-angle * 2.0 + uTime * (Rs/dR));
             float noise = fbm3(spiralPos * 2.0);
             noise = smoothstep(0.2, 0.8, noise);
             
             float tempFactor = (dR - ISCO) / ((ISCO * 4.0) - ISCO);
             vec3 hotCol = vec3(1.0, 0.9, 0.8);
             vec3 midCol = vec3(1.0, 0.6, 0.2);
             vec3 coldCol= vec3(0.5, 0.1, 0.0);
             
             vec3 baseCol = mix(hotCol, midCol, smoothstep(0.0, 0.4, tempFactor));
             baseCol = mix(baseCol, coldCol, smoothstep(0.4, 1.0, tempFactor));
             baseCol *= uDiskTemp;
             
             float currentDt = dt * clamp(r / (Rs * 3.0), 0.5, 2.0);
             float alpha = density * radialDensity * noise * uDiskDensity * 0.15 * currentDt * 3.0;
             diskAccum += baseCol * alpha * doppler;
           }
        }
        
        float curDt = dt * clamp(r / (Rs * 3.0), 0.8, 2.0);
        pos += dir * curDt;
      }
      
      if(hitBH) {
        col = vec3(0.0);
      } else {
        vec3 bgDir = normalize(dir);
        float u = 0.5 + atan(bgDir.z, -bgDir.x) / (2.0 * PI);
        float v = 0.5 + asin(bgDir.y) / PI;
        col = texture2D(uBackground, vec2(u, v)).rgb;
      }
      
      col += diskAccum;
      
      vec3 toCenter = -ro;
      float distToCenter = length(cross(normalize(toCenter), rd)) * length(toCenter);
      float bloom = exp(-distToCenter * 0.5) * uDiskDensity * 0.2 * uDiskTemp;
      col += vec3(1.0, 0.8, 0.6) * bloom;
      
      col = clamp(col, 0.0, 5.0);
      col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
      col = pow(col, vec3(1.0 / 2.2));
      
      gl_FragColor = vec4(col, 1.0);
    }
`
