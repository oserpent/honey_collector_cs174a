import {defs, tiny} from "../examples/common.js";

const {hex_color, Mat4, Material, Texture,} = tiny;

const {Textured_Phong} = defs

export class Bear {

    constructor(translation_coordinates) {
        this.x = translation_coordinates.x;
        this.y = translation_coordinates.y;
        this.z = translation_coordinates.z;
        const bump = new defs.Fake_Bump_Map(1);
        this.shapes = {
            head: new defs.Subdivision_Sphere(5),
            ear1: new defs.Subdivision_Sphere(4),
            ear2: new defs.Subdivision_Sphere(4),
            body: new defs.Capped_Cylinder(15,15),
            arm1: new defs.Capped_Cylinder(4,4),
            arm2: new defs.Capped_Cylinder(4,4),
            leg1: new defs.Capped_Cylinder(4,4),
            leg2: new defs.Capped_Cylinder(4,4),
        }

        this.materials = {
            fur: new Material(bump, {
                color: hex_color("#14100b"), ambient: 1, diffusivity: 0,texture: new Texture("assets/Bear.png")
            }),
            head: new Material(new defs.Move_Texture(), {
                ambient: 1, diffusivity: 1, texture: new Texture("assets/bear_head_3.png")
            }),
            shirt: new Material(new defs.Phong_Shader(), {
                color: hex_color("#cc0f44"), ambient: 1, diffusivity: 0
            }),
        }

        this.duck = false;
    }

    duck_component() {
        this.duck = true;
    }

    stand_component() {
        this.duck = false;
    }

    setTranslationCoordinates(translation_coordinates) {
        this.x = translation_coordinates.x;
        this.y = translation_coordinates.y;
        this.z = translation_coordinates.z;
    }

    moveCoordinates(translation_coordinates) {
        this.x += translation_coordinates.x;
        this.y += translation_coordinates.y;
        this.z += translation_coordinates.z;
    }

    display(context, program_state, time) {
        let body_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.scale(1,1,2));
        this.shapes.body.draw(context, program_state, body_transform, this.materials.shirt);

        let head_transform = Mat4.translation(this.x,this.y,this.z).times(Mat4.translation(0, 2, 0)).times(Mat4.scale(1.2, 1.2, 1.2)).times(Mat4.rotation(Math.sin(Math.PI/4), 1,1, 1)).times(Mat4.rotation(1, Math.sin(Math.PI/4),1, 1)).times(Mat4.rotation(1, 1,Math.sin(Math.PI/10), 1));
        if (this.duck) {
            head_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.translation(-1, 1, 0)).times(Mat4.rotation(-Math.PI/2, 0, 0, 1)).times(Mat4.translation(0,2,0));
        }
        this.shapes.head.draw(context, program_state, head_transform, this.materials.head);

        let ear1_transform = Mat4.translation(this.x,this.y,this.z).times(Mat4.translation(0, 3, 0.5)).times(Mat4.scale(0.1,0.4,0.4));
        if (this.duck) {
            ear1_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.translation(1, -1.25, 0)).times(Mat4.translation(0,1,0.5)).times(Mat4.translation(0,2,0)).times(Mat4.scale(0.1,0.4,0.4));
        }
        this.shapes.ear1.draw(context, program_state, ear1_transform, this.materials.fur);

        let ear2_transform = Mat4.translation(this.x,this.y,this.z).times(Mat4.translation(0, 3, -0.5)).times(Mat4.scale(0.1,0.4,0.4));
        if (this.duck) {
            ear2_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.translation(1, -1.25, 0)).times(Mat4.translation(0,1,-0.5)).times(Mat4.translation(0,2,0)).times(Mat4.scale(0.1,0.4,0.4));
        }
        this.shapes.ear2.draw(context, program_state, ear2_transform, this.materials.fur);

        let arm1_swing = Math.sin(2*time)/2;
        let arm1_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.rotation(arm1_swing,0,0,1)).times(Mat4.translation(arm1_swing, 0, 0))
            .times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.translation(0,1.15,0.25)).times(Mat4.scale(0.15,0.15,2.4));
        this.shapes.arm1.draw(context, program_state, arm1_transform, this.materials.fur);

        let arm2_swing = Math.sin(2*time+Math.PI)/2;
        let arm2_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.rotation(arm2_swing,0,0,1)).times(Mat4.translation(arm2_swing, 0, 0))
            .times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.translation(0,-1.15,0.25)).times(Mat4.scale(0.15,0.15,2.4));
        this.shapes.arm2.draw(context, program_state, arm2_transform, this.materials.fur);

        let leg1_swing = Math.sin(2*time+Math.PI)/3.3;
        let leg1_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.rotation(leg1_swing,0,0,1)).times(Mat4.translation(leg1_swing, 0, 0))
            .times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.translation(0,0.5,2)).times(Mat4.scale(0.2,0.2,2.3));
        this.shapes.leg1.draw(context, program_state, leg1_transform, this.materials.fur);

        let leg2_swing = Math.sin(2*time)/3.3;
        let leg2_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.rotation(leg2_swing,0,0,1)).times(Mat4.translation(leg2_swing, 0, 0))
            .times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.translation(0,-0.5,2)).times(Mat4.scale(0.2,0.2,2.3));
        this.shapes.leg2.draw(context, program_state, leg2_transform, this.materials.fur);
    }
}

const Move_Texture = defs.Move_Texture = class Move_Texture extends Textured_Phong {
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
                const float M_1_PI = 1.0 / 3.1415926535897932384626433832795;
                varying vec2 f_tex_coord;
                uniform sampler2D texture;
                void main(){
                    vec3 n_normal = normalize(N);
                    vec2 texture_coordinate;
                    texture_coordinate.x = 0.5 - atan(n_normal.z, n_normal.x) * M_1_PI;
                    texture_coordinate.y = 0.5 - asin(-n_normal.y) * M_1_PI;
                    gl_FragColor = texture2D(texture, texture_coordinate);
                    
                  } `;
    }
}
const Fake_Bump_Map = defs.Fake_Bump_Map =
    class Fake_Bump_Map extends Textured_Phong {
        // **Fake_Bump_Map** Same as Phong_Shader, except adds a line of code to
        // compute a new normal vector, perturbed according to texture color.
        fragment_glsl_code() {
            // ********* FRAGMENT SHADER *********
            return this.shared_glsl_code() + `
                varying vec2 f_tex_coord;
                uniform sampler2D texture;
        
                void main(){
                    // Sample the texture image in the correct place:
                    vec4 tex_color = texture2D( texture, f_tex_coord );
                    if( tex_color.w < .01 ) discard;
                    // Slightly disturb normals based on sampling the same image that was used for texturing:
                    vec3 bumped_N  = N + tex_color.rgb - .5*vec3(1,1,1);
                    // Compute an initial (ambient) color:
                    gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                    // Compute the final color with contributions from lights:
                    gl_FragColor.xyz += phong_model_lights( normalize( bumped_N ), vertex_worldspace );
                  } `;
        }
    }