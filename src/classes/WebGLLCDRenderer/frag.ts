// #version 300 es needs to be on the first line
export const frag = `#version 300 es
precision mediump float;

in vec2 vUV;
uniform sampler2D uTexture;
out vec4 fragColor;

void main() {
    fragColor = vec4(0, 0, 0, texture(uTexture, vUV).r);
}
`;