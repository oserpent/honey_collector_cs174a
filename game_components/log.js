import {defs, tiny} from "../examples/common.js";

const {hex_color, Mat4, Material, Texture,} = tiny;

const {Textured_Phong} = defs

export class Log {

    constructor(translation_coordinates) {
        this.x = translation_coordinates.x;
        this.y = translation_coordinates.y;
        this.z = translation_coordinates.z;
        const bump = new defs.Fake_Bump_Map(1);

        this.shapes = {
            log: new defs.Cylindrical_Tube(3,20),
            log_face: new defs.Capped_Cylinder(3,20)
        }

        this.materials = {
            wood: new Material(bump, {
                color: hex_color("#6c3918"), ambient: 0.8, diffusivity: 1
            }),
            wood_face: new Material(bump, {
                color: hex_color("#482610"), ambient: 1, diffusivity: 1,texture: new Texture("assets/WoodLog.png")
            }),
        }
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
        let log_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.rotation(Math.PI/12,0,1,0)).times(Mat4.scale(0.8,0.8,3));
        this.shapes.log.draw(context, program_state, log_transform, this.materials.wood);

        let logface_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.rotation(Math.PI/12,0,1,0)).times(Mat4.scale(0.8,0.8,3));
        this.shapes.log_face.draw(context, program_state, logface_transform, this.materials.wood_face);
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