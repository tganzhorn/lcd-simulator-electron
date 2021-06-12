// #version 300 es needs to be on the first line
export const vert = `#version 300 es
in vec2 aVertexPosition;

out vec2 vUV;

void main() {
    vUV = (aVertexPosition * vec2(1, -1) + 1.0) / 2.0;
    gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}
`;