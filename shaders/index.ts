
export const treeVert = `
uniform float uTime;
uniform float uBoostIntensity;
attribute float aSize;
attribute vec3 aColor;
attribute float aPhase;
attribute float aHeightFactor;
attribute float aIsOuter;
varying vec3 vColor;
varying float vHeightFactor;
varying float vIsOuter;

void main() {
  vColor = aColor;
  vHeightFactor = aHeightFactor;
  vIsOuter = aIsOuter;
  vec3 pos = position;
  
  // Breathing/Floating animation
  float breathe = sin(uTime * 0.5 + aPhase) * 0.02;
  pos.y += breathe;
  pos.x += cos(uTime * 0.3 + aPhase) * 0.01 * (1.0 - aHeightFactor);
  // Less movement at top
  pos.z += sin(uTime * 0.3 + aPhase) * 0.01 * (1.0 - aHeightFactor);
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  
  // Particle size attenuation and boost
  gl_PointSize = aSize * (1.0 + uBoostIntensity * 0.5) * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const treeFrag = `
uniform float uTime;
uniform float uBoostIntensity;
varying vec3 vColor;
varying float vHeightFactor;
varying float vIsOuter;

// Pseudo-random function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  // Soft circle sprite
  vec2 xy = gl_PointCoord.xy - vec2(0.5);
  float r = length(xy);
  if (r > 0.5) discard;
  
  // Basic flicker
  float flicker = 0.8 + 0.2 * sin(uTime * 2.0 + random(gl_PointCoord) * 6.28);
  float strength = (1.0 - r * 2.0) * flicker; 
  
  // Color logic
  vec3 finalColor = vColor;
  vec3 warmPink = vec3(1.0, 0.42, 0.56); // #FF6B90
  vec3 softPink = vec3(1.0, 0.62, 0.71); // #FF9FB5
  vec3 lightPink = vec3(1.0, 0.91, 0.94); // #FFE8F0
  vec3 gold = vec3(0.98, 0.79, 0.42);     // #FBC96B
  
  float noise = random(gl_PointCoord + uTime * 0.1);
  
  if (vIsOuter > 0.5) { 
    // Outer particles
    float pLightPink = 0.25 * vHeightFactor;
    float pGold = 0.15 * vHeightFactor;
    float randVal = random(gl_FragCoord.xy * 0.01 + noise);
    
    if (randVal < pLightPink) {
      finalColor = lightPink;
    } else if (randVal < pLightPink + pGold) {
      finalColor = gold;
    } else {
      finalColor = mix(warmPink, softPink, random(gl_FragCoord.yx * 0.01));
    }
  } else { 
    // Inner particles
    finalColor = mix(warmPink, softPink, random(gl_FragCoord.xy * 0.02));
  }
  
  // Edge glow
  float edgeGlow = smoothstep(0.3, 0.5, r);
  finalColor += vec3(0.2, 0.1, 0.0) * edgeGlow * vHeightFactor;
  
  // Boost reaction
  strength *= (1.0 + uBoostIntensity * 1.5);
  
  gl_FragColor = vec4(finalColor * strength, 1.0);
}
`;

export const heartVert = `
uniform float uTime;
uniform float uBoostIntensity;
uniform float uExplosion;
attribute float aSize;
attribute vec3 aColor;
attribute float aPhase;
attribute float aDensity;
varying vec3 vColor;
varying float vDensity;

void main() {
  vColor = aColor;
  vDensity = aDensity;
  vec3 pos = position;
  
  // Heartbeat pulse
  float pulse = sin(uTime * 2.5) * 0.05 + 1.0; 
  pos *= pulse;
  
  // Explosion logic
  if (uExplosion > 0.0) {
     vec3 explosionDir = normalize(pos);
     // Add some randomness to direction based on phase to make it less uniform
     explosionDir.x += sin(aPhase) * 0.5;
     explosionDir.y += cos(aPhase) * 0.5;
     explosionDir = normalize(explosionDir);
     
     pos += explosionDir * uExplosion * 25.0;
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * (0.8 + aDensity * 0.4) * (1.0 + uBoostIntensity * 0.8) * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const heartFrag = `
uniform float uTime;
uniform float uBoostIntensity;
uniform float uExplosion;
varying vec3 vColor;
varying float vDensity;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec2 xy = gl_PointCoord.xy - vec2(0.5);
  float r = length(xy);
  if (r > 0.5) discard;
  
  float pulseIntensity = sin(uTime * 2.5) * 0.2 + 0.8;
  float noise = random(gl_PointCoord + uTime * 0.5);
  float sparkle = 0.7 + 0.3 * noise;
  
  float coreStrength = smoothstep(0.5, 0.0, r) * (0.5 + vDensity * 0.5);
  float halo = smoothstep(0.5, 0.3, r) * 0.3;
  
  vec3 finalColor = vColor * (coreStrength + halo) * sparkle * pulseIntensity;
  finalColor *= (1.0 + uBoostIntensity * 2.0);
  
  // Fade out during explosion
  float alpha = 1.0;
  if (uExplosion > 0.0) {
      alpha = 1.0 - uExplosion * 2.0; // Fade out quickly
      if (alpha < 0.0) alpha = 0.0;
  }
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;
