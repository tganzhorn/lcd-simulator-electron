export const frag = `
#ifdef GL_ES
    precision highp float;
#endif

varying vec2 vUV;
uniform sampler2D uTexture;

void main() {
    gl_FragColor = vec4(0, 0, 0, texture2D(uTexture, vUV).r);
}
`