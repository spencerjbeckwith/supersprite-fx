import { init, supersprite, shader, draw, DrawTextOptions } from 'supersprite';
import spr from './atlas.js';

import vertexSource from './shaders/vertex.glsl';
import fragmentSource from './shaders/fragment.glsl';
import { subdivisions } from './subdivide.js';

declare module 'supersprite' {
    export interface MainShaderUniforms {
        paletteSampler: WebGLUniformLocation;
        paletteIndex: WebGLUniformLocation;
        monochrome: WebGLUniformLocation;
        monochromeMultiplier: WebGLUniformLocation;
        useShockwave: WebGLUniformLocation;
        shockwave: WebGLUniformLocation;
        surfaceSize: WebGLUniformLocation;
    }
}

init({
    glOptions: {
        antialias: false,
    },
    contextImageSmoothing: false,
    responsive: 'scale',
    maintainAspectRatio: true,
    scalePerfectly: true,
    gameTextureParameters: {
        textureMagFilter: 'nearest',
        textureMinFilter: 'nearest',
    },
    mainShaderOptions: {
        source: {
            vertex: vertexSource,
            fragment: fragmentSource,
        },
        attributes: {
            position: 'a_position',
            texture: 'a_texture',
        },
        uniforms: {
            atlas: 'u_atlas',
            blend: 'u_blend',
            positionMatrix: 'u_position_matrix',
            textureMatrix: 'u_texture_matrix',
            useTexture: 'u_use_texture',
        },
    }
});

// Find out additional uniforms
const gl = supersprite.gl;
shader.uniforms.paletteIndex = gl.getUniformLocation(shader.program, 'u_palette_index');
shader.uniforms.paletteSampler = gl.getUniformLocation(shader.program, 'u_palette');

shader.uniforms.monochrome = gl.getUniformLocation(shader.program, 'u_monochrome');
shader.uniforms.monochromeMultiplier = gl.getUniformLocation(shader.program, 'u_monochrome_multiplier');

shader.uniforms.useShockwave = gl.getUniformLocation(shader.program, 'u_use_shockwave');
shader.uniforms.shockwave = gl.getUniformLocation(shader.program, 'u_shockwave');
shader.uniforms.surfaceSize = gl.getUniformLocation(shader.program, 'u_surfaceSize');

// Each shockwave is two vec3's of the following format:
//  (epicenter x, epicenter y, intensity) and (max radius, current time, maximum time)
const shockwave = [
    112, 80, 0.05, 25, 0, 30,
    192, 80, 0.08, 25, 0, 20,
    272, 80, 0.03, 25, 0, 60
];

Promise.all([
    supersprite.loadTexture('build/atlas.png',{
        textureMagFilter: 'nearest',
        textureMinFilter: 'nearest',
    }),
    supersprite.loadTexture('build/palette.png',{
        textureMagFilter: 'nearest',
        textureMinFilter: 'nearest',
    }),
]).then(([ atlas, palette ]) => {
    supersprite.setAtlas(atlas);

    // Set the palette texture as texture 1 - you can change this to use multiple palette textures
    gl.uniform1i(shader.uniforms.paletteSampler, 1);
    gl.uniform1i(shader.uniforms.paletteIndex, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, palette.texture);
    
    // Just be sure to reset to texture 0
    gl.activeTexture(gl.TEXTURE0);

    main();
}).catch(console.error);

function main() {
    supersprite.beginRender();
    
    // Palette swap
    draw.text(8,12,'Palette Swaps:');
    draw.spriteSpeed(spr.guy, 0.2, 80, 8);
    gl.uniform1i(shader.uniforms.paletteIndex, 1);
    draw.spriteSpeed(spr.guy, 0.2, 112, 8);
    gl.uniform1i(shader.uniforms.paletteIndex, 2);
    draw.spriteSpeed(spr.guy, 0.2, 144, 8);
    gl.uniform1i(shader.uniforms.paletteIndex, 0);

    // Monochrome
    draw.text(8,32,'Monochrome:');
    gl.uniform1i(shader.uniforms.monochrome, 1);
    gl.uniform3f(shader.uniforms.monochromeMultiplier, 0.8, 0.8, 0.8);
    draw.spriteSpeed(spr.guy, 0.2, 80, 28);
    gl.uniform3f(shader.uniforms.monochromeMultiplier, 1.25, 0.75, 0.75);
    draw.spriteSpeed(spr.guy, 0.2, 112, 28);
    gl.uniform3f(shader.uniforms.monochromeMultiplier, 0.75, 1.25, 0.75);
    draw.spriteSpeed(spr.guy, 0.2, 144, 28);
    gl.uniform3f(shader.uniforms.monochromeMultiplier, 0.75, 0.75, 1.25);
    draw.spriteSpeed(spr.guy, 0.2, 176, 28);
    gl.uniform3f(shader.uniforms.monochromeMultiplier, 0, 1, 1);
    draw.spriteSpeed(spr.guy, 0.2, 208, 28);
    gl.uniform3f(shader.uniforms.monochromeMultiplier, 1, 0, 1);
    draw.spriteSpeed(spr.guy, 0.2, 240, 28);
    gl.uniform3f(shader.uniforms.monochromeMultiplier, 1, 1, 0);
    draw.spriteSpeed(spr.guy, 0.2, 272, 28);
    gl.uniform1i(shader.uniforms.monochrome, 0);

    // Shockwave
    //  Note the shockwave isn't an effect on these drawings, but instead affects the game texture
    draw.text(8,56,'Shockwaves:');
    draw.sprite(spr.bricks, 0, 80, 48);
    draw.sprite(spr.bricks, 0, 112, 48);
    draw.sprite(spr.bricks, 0, 80, 80);
    draw.sprite(spr.bricks, 0, 112, 80);

    draw.sprite(spr.grass, 0, 160, 48);
    draw.sprite(spr.grass, 0, 192, 48);
    draw.sprite(spr.grass, 0, 160, 80);
    draw.sprite(spr.grass, 0, 192, 80);

    draw.sprite(spr.stone, 0, 240, 48);
    draw.sprite(spr.stone, 0, 272, 48);
    draw.sprite(spr.stone, 0, 240, 80);
    draw.sprite(spr.stone, 0, 272, 80);

    // Shockwave processing - controls our uniform
    for (let i = 0; i < shockwave.length; i += 6) {
        shockwave[i+4]++;
        if (shockwave[i+4] > shockwave[i+5]) {
            // Reset time
            shockwave[i+4] = -30;
        }
    }

    gl.uniform3fv(shader.uniforms.shockwave, shockwave);
    gl.uniform2f(shader.uniforms.surfaceSize, supersprite.viewWidth, supersprite.viewHeight);

    gl.uniform1i(shader.uniforms.useShockwave, 1);
    supersprite.endRender(null, subdivisions.screen, subdivisions.screen);
    gl.uniform1i(shader.uniforms.useShockwave, 0);

    requestAnimationFrame(main);
}