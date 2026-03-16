import * as THREE from 'three'

export const BlackHoleUniforms = {
  uTime: { value: 0 },
  uMass: { value: 1.0 },
  uSpin: { value: 0.68 },
  uDiskTemp: { value: 0.74 },
  uDiskDensity: { value: 0.34 },
  uLensingStrength: { value: 1.0 },
  uQuality: { value: 4.0 },
  uVisibility: { value: 1.0 },
  uBackground: { value: null as THREE.Texture | null }
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
    uniform float uSpin;
    uniform float uDiskTemp;
    uniform float uDiskDensity;
    uniform float uLensingStrength;
    uniform float uQuality;
    uniform float uVisibility;
    uniform sampler2D uBackground;

    varying vec3 vWorldPos;

    #define MAX_DIST 32.0
    #define PI 3.14159265359

    mat2 rot(float a) {
      float s = sin(a), c = cos(a);
      return mat2(c, -s, s, c);
    }

    vec3 rotateX(vec3 p, float a) {
      float s = sin(a), c = cos(a);
      return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
    }

    float safeSqrt(float x) {
      return sqrt(max(x, 0.0));
    }

    float kerrHorizon(float m, float a) {
      return m * (1.0 + safeSqrt(1.0 - a * a));
    }

    float kerrISCO(float m, float a) {
      float z1 = 1.0 + pow(1.0 - a * a, 1.0 / 3.0) * (pow(1.0 + a, 1.0 / 3.0) + pow(1.0 - a, 1.0 / 3.0));
      float z2 = safeSqrt(3.0 * a * a + z1 * z1);
      return m * (3.0 + z2 - safeSqrt((3.0 - z1) * (3.0 + z1 + 2.0 * z2)));
    }

    float photonImpactParameter(float m, float a) {
      float rPh = 2.0 * m * (1.0 + cos((2.0 / 3.0) * acos(-clamp(a, 0.0, 0.999))));
      return safeSqrt(rPh * rPh + 12.0 * m * m);
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
      
      float spin = clamp(uSpin, 0.0, 0.99);
      float visibility = clamp(uVisibility, 0.0, 1.0);
      float m = uMass * 0.52 * mix(0.68, 1.0, visibility);
      float horizonRadius = kerrHorizon(m, spin);
      float ISCO = kerrISCO(m, spin);
      float shadowRadius = photonImpactParameter(m, spin);
      float diskTilt = -0.22;
      
      vec3 col = vec3(0.0);
      vec3 pos = ro;
      vec3 dir = rd;
      
      float dt = 0.16;
      vec3 diskAccum = vec3(0.0);
      bool hitBH = false;
      
      int maxSteps = int(22.0 * uQuality);
      if (maxSteps < 24) maxSteps = 24;
      
      for(int i = 0; i < 100; i++) {
        if(i >= maxSteps) break;
        
        float r = length(pos);
        if(r < horizonRadius) {
          hitBH = true;
          break;
        }
        if(r > MAX_DIST) break;

        float gravityFalloff = max(r * r, m * m);
        vec3 radialGravity = -normalize(pos) * (uLensingStrength * m * 1.08) / gravityFalloff;
        vec3 dragDir = normalize(cross(vec3(0.0, 1.0, 0.0), pos) + vec3(0.0001, 0.0, 0.0));
        vec3 frameDrag = dragDir * (spin * uLensingStrength * m * m * 0.65) / max(r * r * r, m * m * m);
        dir = normalize(dir + (radialGravity + frameDrag) * dt);
        
        vec3 diskPos = rotateX(pos, diskTilt);
        float diskThickness = 0.024 + max(r - ISCO, 0.0) * 0.004;
        if (abs(diskPos.y) < diskThickness) {
           float dR = length(diskPos.xz);
           
           if (dR > ISCO * 1.01 && dR < ISCO * 5.2) {
             float vDist = abs(diskPos.y) / diskThickness;
             float density = 1.0 - smoothstep(0.0, 1.0, vDist);
             float innerRise = smoothstep(ISCO * 1.01, ISCO + m * 0.4, dR);
             float outerFade = 1.0 - smoothstep(ISCO * 3.2, ISCO * 5.2, dR);
             float radialDensity = innerRise * outerFade;
             
             vec3 velocity = normalize(rotateX(vec3(-diskPos.z, 0.0, diskPos.x), -diskTilt));
             float beta = clamp(safeSqrt(m / max(dR - 0.85 * m, m * 0.7)), 0.08, 0.72);
             beta *= mix(0.9, 1.18, spin);
             float los = dot(dir, velocity);
             float gamma = inversesqrt(max(1.0 - beta * beta, 0.08));
             float doppler = 1.0 / max(gamma * (1.0 - beta * los), 0.2);
             float beaming = pow(doppler, 3.0);
             float gravRedshift = safeSqrt(max(1.0 - (2.0 * m / max(dR, 2.05 * m)), 0.03));
             
             float angle = atan(diskPos.z, diskPos.x);
             vec3 spiralPos = diskPos;
             spiralPos.xz *= rot(-angle * (1.8 + spin * 0.9) + uTime * (m / max(dR, 0.001)));
             float noise = fbm3(spiralPos * 2.0);
             noise = smoothstep(0.34, 0.74, noise);
             
             float tempFactor = clamp((dR - ISCO) / ((ISCO * 5.2) - ISCO), 0.0, 1.0);
             vec3 hotCol = vec3(1.0, 0.985, 0.95);
             vec3 midCol = vec3(0.98, 0.8, 0.62);
             vec3 coldCol= vec3(0.54, 0.27, 0.12);
             
             vec3 baseCol = mix(hotCol, midCol, smoothstep(0.0, 0.4, tempFactor));
             baseCol = mix(baseCol, coldCol, smoothstep(0.4, 1.0, tempFactor));
             baseCol *= mix(0.55, 1.0, clamp(uDiskTemp / 1.8, 0.0, 1.0));
             
             float currentDt = dt * clamp(r / (m * 6.0), 0.32, 1.0);
             float alpha = density * radialDensity * noise * uDiskDensity * 0.042 * currentDt * visibility;
             float observedIntensity = beaming * pow(gravRedshift, 4.0);
             vec3 observedColor = mix(baseCol * gravRedshift, vec3(dot(baseCol, vec3(0.299, 0.587, 0.114))), 0.08 * (1.0 - gravRedshift));
             diskAccum += observedColor * alpha * observedIntensity;
           }
        }
        
        float curDt = dt * clamp(r / (m * 6.0), 0.4, 1.25);
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
      
      vec3 viewToCenter = normalize(-ro);
      float forwardMask = smoothstep(0.0, 0.2, dot(rd, viewToCenter));
      float impact = length(cross(rd, viewToCenter)) * length(ro);
      float shadow = (1.0 - smoothstep(shadowRadius * 0.9, shadowRadius * 1.03, impact)) * visibility;
      col *= 1.0 - shadow * forwardMask;

      col += diskAccum;
      
      float ringWidth = max(m * mix(0.18, 0.11, spin), 0.028);
      float photonRing = exp(-pow((impact - shadowRadius) / ringWidth, 2.0));
      float ringAsymmetry = 0.82 + 0.18 * dot(normalize(vec3(1.0, 0.0, 0.3)), rd);
      col += vec3(0.96, 0.93, 0.89) * photonRing * ringAsymmetry * 0.065 * visibility;

      float equator = exp(-pow(rd.y * 38.0, 2.0));
      float longBand = 1.0 - smoothstep(m * 4.0, m * 12.0, impact);
      float bandGap = smoothstep(shadowRadius * 1.01, shadowRadius * 1.16, impact);
      float horizontalBand = equator * longBand * bandGap;
      col += vec3(0.76, 0.75, 0.74) * horizontalBand * uDiskDensity * 0.038 * visibility;

      float arcCore = exp(-pow((impact - shadowRadius * 1.025) / (m * 0.22), 2.0));
      float arcVertical = exp(-pow((abs(rd.y) - 0.076) / 0.02, 2.0));
      float upperLowerArcs = arcCore * arcVertical * forwardMask;
      col += vec3(0.9, 0.88, 0.85) * upperLowerArcs * 0.052 * visibility;

      float centralAbsorption = (1.0 - smoothstep(shadowRadius * 0.93, shadowRadius * 1.02, impact)) * visibility;
      float penumbra = 1.0 - smoothstep(shadowRadius * 1.0, shadowRadius * 1.18, impact);

      float bloom = exp(-impact * 1.2) * uDiskDensity * 0.008 * (0.58 + uDiskTemp * 0.12) * visibility;
      col += vec3(0.96, 0.94, 0.92) * bloom * penumbra;

      col *= 1.0 - centralAbsorption * forwardMask * 0.98;
      col = mix(col, vec3(0.0), centralAbsorption * forwardMask);
      
      col *= vec3(0.91, 0.92, 0.96);
      col = clamp(col, 0.0, 1.35);
      col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
      col = pow(col, vec3(1.0 / 2.16));
      
      gl_FragColor = vec4(col, 1.0);
    }
`
