import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

export class Assignment4 extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // TODO:  Create two cubes, including one with the default texture coordinates (from 0 to 1), and one with the modified
        //        texture coordinates as required for cube #2.  You can either do this by modifying the cube code or by modifying
        //        a cube instance's texture_coords after it is already created.
        this.shapes = {
            box_1: new Cube(),
            box_2: new Cube(),
            axis: new Axis_Arrows(),
            head: new defs.Subdivision_Sphere(5),
            ear1: new defs.Subdivision_Sphere(4),
            ear2: new defs.Subdivision_Sphere(4),
            body: new defs.Capped_Cylinder(15,15),
            arm1: new defs.Capped_Cylinder(4,4),
            arm2: new defs.Capped_Cylinder(4,4),
            leg1: new defs.Capped_Cylinder(4,4),
            leg2: new defs.Capped_Cylinder(4,4),
            pond: new defs.Subdivision_Sphere(4),
            pond2: new defs.Subdivision_Sphere(4),
            log: new defs.Cylindrical_Tube(3,20),
            log_face: new defs.Capped_Cylinder(3,20)


        }
        console.log(this.shapes.box_1.arrays.texture_coord)


        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials = {
            fur: new Material(new Textured_Phong(), {
                color: hex_color("#482610"), ambient: 1, diffusivity: 0,texture: new Texture("assets/Bear.png")
            }),
            pond: new Material(new Textured_Phong(), {
                color: hex_color("#5fd2b1"), ambient: 1, diffusivity: 0,texture: new Texture("assets/pond.png")
            }),
            wood: new Material(new defs.Phong_Shader(), {
                color: hex_color("#6c3918"), ambient: 0.8, diffusivity: 1
            }),

            wood_face: new Material(new Textured_Phong(), {
                color: hex_color("#482610"), ambient: 1, diffusivity: 1,texture: new Texture("assets/WoodLog.png")
            }),
            shirt: new Material(new defs.Phong_Shader(), {
                color: hex_color("#cc0f44"), ambient: 1, diffusivity: 0
            }),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#7c3d3d"),
                ambient: 0.5, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/stars.png")
            }),
        }

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, 0, -8));
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();

        // TODO:  Draw the required boxes. Also update their stored matrices.
        // You can remove the folloeing line.
        let body_transform = model_transform;
        body_transform = body_transform.times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.scale(1,1,2));
        this.shapes.body.draw(context, program_state, body_transform, this.materials.shirt);

        let head_transform = model_transform;
        head_transform = head_transform.times(Mat4.translation(0,2,0));
        this.shapes.head.draw(context, program_state, head_transform, this.materials.fur);

        let ear1_transform = model_transform;
        ear1_transform = ear1_transform.times(Mat4.translation(0,3,0.5)).times(Mat4.scale(0.1,0.4,0.4));
        this.shapes.ear1.draw(context, program_state, ear1_transform, this.materials.fur);

        let ear2_transform = model_transform;
        ear2_transform = ear2_transform.times(Mat4.translation(0,3,-0.5)).times(Mat4.scale(0.1,0.4,0.4));
        this.shapes.ear2.draw(context, program_state, ear2_transform, this.materials.fur);

        var arm1_swing = Math.sin(t)/2;
        let arm1_transform = model_transform;
        arm1_transform = arm1_transform.times(Mat4.rotation(arm1_swing,0,0,1)).times(Mat4.translation(arm1_swing, 0, 0))
            .times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.translation(0,1.15,0.25)).times(Mat4.scale(0.15,0.15,2.4));
        this.shapes.arm1.draw(context, program_state, arm1_transform, this.materials.fur);

        var arm2_swing = Math.sin(t+Math.PI)/2;
        let arm2_transform = model_transform;
        arm2_transform = arm2_transform.times(Mat4.rotation(arm2_swing,0,0,1)).times(Mat4.translation(arm2_swing, 0, 0))
            .times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.translation(0,-1.15,0.25)).times(Mat4.scale(0.15,0.15,2.4));
        this.shapes.arm2.draw(context, program_state, arm2_transform, this.materials.fur);

        var leg1_swing = Math.sin(t+Math.PI)/3.3;
        let leg1_transform = model_transform;
        leg1_transform = leg1_transform.times(Mat4.rotation(leg1_swing,0,0,1)).times(Mat4.translation(leg1_swing, 0, 0))
            .times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.translation(0,0.5,2)).times(Mat4.scale(0.2,0.2,2.3));
        this.shapes.leg1.draw(context, program_state, leg1_transform, this.materials.fur);

        var leg2_swing = Math.sin(t)/3.3;
        let leg2_transform = model_transform;
        leg2_transform = leg2_transform.times(Mat4.rotation(leg2_swing,0,0,1)).times(Mat4.translation(leg2_swing, 0, 0))
            .times(Mat4.rotation(Math.PI/2,1,0,0)).times(Mat4.translation(0,-0.5,2)).times(Mat4.scale(0.2,0.2,2.3));
        this.shapes.leg2.draw(context, program_state, leg2_transform, this.materials.fur);

        let pond_transform = model_transform;
        pond_transform = pond_transform.times(Mat4.translation(3,1,1)).times(Mat4.scale(1.5,0.05,1.5));
        this.shapes.pond.draw(context, program_state, pond_transform, this.materials.pond);

        let pond2_transform = model_transform;
        pond2_transform = pond2_transform.times(Mat4.translation(4.25,1,1)).times(Mat4.scale(1,0.05,1));
        this.shapes.pond2.draw(context, program_state, pond2_transform, this.materials.pond);

        let log_transform = model_transform;
        log_transform = log_transform.times(Mat4.translation(7,1,1)).times(Mat4.rotation(Math.PI/12,0,1,0)).times(Mat4.scale(0.8,0.8,3));
        this.shapes.log.draw(context, program_state, log_transform, this.materials.wood);

        let logface_transform = model_transform;
        logface_transform = logface_transform.times(Mat4.translation(7,1,1)).times(Mat4.rotation(Math.PI/12,0,1,0)).times(Mat4.scale(0.8,0.8,3));
        this.shapes.log_face.draw(context, program_state, logface_transform, this.materials.wood_face);



    }
}


class Texture_Scroll_X extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord);
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}


class Texture_Rotate extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #7.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord );
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

