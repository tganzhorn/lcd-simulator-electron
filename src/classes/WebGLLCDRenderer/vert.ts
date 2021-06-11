export const vert = `
attribute vec2 aVertexPosition;

varying vec2 vUV;

void main() {
    vUV = (aVertexPosition * vec2(1, -1) + 1.0) / 2.0;
    gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}
`