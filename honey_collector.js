import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong, Square} = defs

const FLOOR_MIN = vec4(-1, -1, 0, 1);
const FLOOR_MAX = vec4(1, 1, 0, 1);

const CUBE_MIN = vec4(-1, -1, -1, 1);
const CUBE_MAX = vec4(1, 1, 1, 1);

const GRAVITY_ACCELERATION = -0.5;
const JUMP_VELOCITY = 15;

const OBSTACLE_VELOCITY = -15;
const CUBE_SPAWN = Mat4.translation(-12, 0, 0);
const OBSTACLE_SPAWN = Mat4.translation(20, -9, 0);

const red = hex_color("#FF0000");
const light_green = hex_color("#90EE90");
const light_blue = hex_color("#87C1FF");

//returns a 4x4 matrix whose first column is a vec4
const vec4_to_matrix = vector => {
    return Matrix.of([vector[0], 0, 0, 0], [vector[1], 0, 0, 0], [vector[2], 0, 0, 0], [vector[3], 0, 0, 0]);
}

//returns a vec4 which is the first column of a 4x4 matrix
const matrix_to_vec4 = matrix => {
    let x, y, z, h;
    x = matrix[0][0];
    y = matrix[1][0];
    z = matrix[2][0];
    h = matrix[3][0];
    return vec4(x, y, z, h);
}

//returns a vec4 which is the product of a 4x4 matrix and a vec4
const matrix_times_vec4 = (matrix, vector) => {
    return matrix_to_vec4(matrix.times(vec4_to_matrix(vector)));
}

//return true for AABB collision between object1 and object2, otherwise return false
const collision = (model_transform_1, object1_min, object1_max, model_transform_2, object2_min, object2_max) => {
    const transformed_object1_min = matrix_times_vec4(model_transform_1, object1_min);
    const transformed_object1_max = matrix_times_vec4(model_transform_1, object1_max);
    const transformed_object2_min = matrix_times_vec4(model_transform_2, object2_min);
    const transformed_object2_max = matrix_times_vec4(model_transform_2, object2_max);
    return (
        (transformed_object1_min[0] <= transformed_object2_max[0]) &&
        (transformed_object1_max[0] >= transformed_object2_min[0]) &&
        (transformed_object1_min[1] <= transformed_object2_max[1]) &&
        (transformed_object1_max[1] >= transformed_object2_min[1]) &&
        (transformed_object1_min[2] <= transformed_object2_max[2]) &&
        (transformed_object1_max[2] >= transformed_object2_min[2])
    );
}

const collisionCorrection = (model_transform_1, object1_min, object1_max, model_transform_2, object2_min, object2_max) => {
    const transformed_object1_min = matrix_times_vec4(model_transform_1, object1_min);
    const transformed_object1_max = matrix_times_vec4(model_transform_1, object1_max);
    const transformed_object2_min = matrix_times_vec4(model_transform_2, object2_min);
    const transformed_object2_max = matrix_times_vec4(model_transform_2, object2_max);
    const x_right = transformed_object2_max[0] - transformed_object1_min[0];
    const x_left = transformed_object2_min[0] - transformed_object1_max[0];
    const y_up = transformed_object2_max[1] - transformed_object1_min[1];
    const y_down = transformed_object2_min[1] - transformed_object1_max[1];
    const z_forward = transformed_object2_max[2] - transformed_object1_min[2];
    const z_back = transformed_object2_min[2] - transformed_object1_max[2];
    return { x_right, x_left, y_up, y_down, z_forward, z_back };
};

export class HoneyCollector extends Scene {
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
            cube: new Cube(),
            floor: new Square(),
            obstacle: new Cube(),
            square: new Square(),
            axis: new Axis_Arrows()
        }

        //scale box coordinates by 50%
        //snippet of code taken from scene-to-texture-demo.js example


        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
            }),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.5, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/stars.png")
            }),
            stars: new Material(new Texture_Rotate(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/stars.png")
            }),
            floor: new Material(new defs.Phong_Shader(),
            {ambient: 1, diffusivity: 1, color: hex_color("#30D5C8")}),
        cube: new Material(new defs.Phong_Shader(),
            {ambient: 0, diffusivity: 1, color: light_green}),
        obstacle: new Material(new defs.Phong_Shader(),
            {ambient: 0, diffusivity: 1, color: light_blue}),
            //loading square images of my choice
            //opaque black has hex color #000000
            //set ambient to 1 to be ablet o see it
            cutecatto: new Material(new Texture_Rotate(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/cute-cat.png", "NEAREST")
            }),
            sleepycatto: new Material(new Texture_Scroll_X(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/sleepy-catto.jpeg","LINEAR_MIPMAP_LINEAR")
            }),
            background: new Material(new Texture_Scroll_X(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/unsplash.jpeg","LINEAR_MIPMAP_LINEAR")
            }),

        }



        this.model_transforms = {
            cube: CUBE_SPAWN,
            floor: Mat4.translation(0, -10, 0).times(Mat4.scale(20, 1, 2)).times(Mat4.rotation(Math.PI/2, 1, 0, 0)),
            obstacle: OBSTACLE_SPAWN,
        }; 
        this.cube = {
            velocity: {
                x: 0,
                y: 0
            },
            color: light_green
        };

        this.obstacle = {
            velocity: {
                x: OBSTACLE_VELOCITY,
                y: 0
            },
            time_snapshot: 0
        };
        
        console.log(this.shapes.square.arrays.texture_coord)

        this.airborne = true;
        this.jump = false;

        this.playing = true;
        this.time = 0;
        this.spin = 0;
        this.cube_1 = Mat4.translation(-2, 0, 0, 0);
        this.cube_2 = Mat4.translation(2, 0, 0, 0);
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        // TODO:  Implement requirement #5 using a key_triggered_button that responds to the 'c' key.
        this.key_triggered_button("Jump", ["v"], () => {
            //jump only when airborne
            if (this.playing && !this.airborne){
                this.jump = true;
            }
        });
        this.key_triggered_button("Restart", ["x"], () => {
            //reset spawns on game restart
            this.playing = true;
            this.model_transforms.cube = CUBE_SPAWN;
            this.model_transforms.obstacle = OBSTACLE_SPAWN;
            this.obstacle.time_snapshot = this.time;
            this.cube.color = light_green;
        });
        

    }


    display(context, program_state) {
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        this.time = t;


        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.translation(0, 0, -30));
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
        let model_transform = Mat4.identity();
        let background_transform = model_transform.times(Mat4.scale(25, 25, 0)).times(Mat4.rotation(0, 0, Math.PI, 0))

        if(this.playing){
            //obstacle spawn after 3 seconds
            if (this.time - this.obstacle.time_snapshot >= 3){
                this.obstacle.time_snapshot = this.time;
                this.model_transforms.obstacle = OBSTACLE_SPAWN;
            }

            //move cube downward based on cube y velocity
            this.model_transforms.cube = this.model_transforms.cube.times(Mat4.translation(0, this.cube.velocity.y * dt, 0));

            //move obstacle to the left based on obstacle velocity
            this.model_transforms.obstacle = this.model_transforms.obstacle.times(Mat4.translation(this.obstacle.velocity.x * dt, 0, 0));

            //handle cube collision with floor
            if (!collision(this.model_transforms.cube, CUBE_MIN, CUBE_MAX, this.model_transforms.floor, FLOOR_MIN, FLOOR_MAX)){
                this.cube.velocity.y += GRAVITY_ACCELERATION;
                this.airborne = true;
            }
            else {
                const { y_up } = collisionCorrection(this.model_transforms.cube, CUBE_MIN, CUBE_MAX, this.model_transforms.floor, FLOOR_MIN, FLOOR_MAX);
                this.model_transforms.cube = this.model_transforms.cube.times(Mat4.translation(0, y_up, 0));
                this.cube.velocity.y = 0;
                this.airborne = false;
            }

            //handle jump
            if (this.jump) {
                this.cube.velocity.y += JUMP_VELOCITY;
                this.jump = false;
            }

            //end game after collision with obstacle
            if (collision(this.model_transforms.cube, CUBE_MIN, CUBE_MAX, this.model_transforms.obstacle, CUBE_MIN, CUBE_MAX)){
                const { x_right: obstacle_x_right } = collisionCorrection(this.model_transforms.obstacle, CUBE_MIN, CUBE_MAX, this.model_transforms.cube, CUBE_MIN, CUBE_MAX);
                const { y_up: cube_y_up } = collisionCorrection(this.model_transforms.cube, CUBE_MIN, CUBE_MAX, this.model_transforms.obstacle, CUBE_MIN, CUBE_MAX);
                if (cube_y_up < obstacle_x_right){
                    //cube collides with obstacle head on
                    this.model_transforms.cube = this.model_transforms.cube.times(Mat4.translation(0, cube_y_up, 0));
                }
                else {
                    //cube lands on obstacle
                    this.model_transforms.obstacle = this.model_transforms.obstacle.times(Mat4.translation(obstacle_x_right, 0, 0));
                }
                this.playing = false;
                this.cube.color = red;
            }
        }

        // TODO:  Draw the required boxes. Also update their stored matrices.
        // You can remove the folloeing line.
        //requirement 2: put the uploaded textures onto cubes
        if (this.playing != false) {
            this.shapes.square.draw(context, program_state, background_transform, this.materials.background);
        }

        this.shapes.floor.draw(context, program_state, this.model_transforms.floor, this.materials.floor);
        this.shapes.cube.draw(context, program_state, this.model_transforms.cube, this.materials.cube.override({color: this.cube.color}));
        this.shapes.obstacle.draw(context, program_state, this.model_transforms.obstacle, this.materials.obstacle);


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
                //to slide 2 texture units/second, we must figure out which texture panels are in frame
                //first, calculate the move per unit
                //then, multiply it by 2 to make it 2 texture units per second
                //in order to make it seamless, need to do it per time, so that it doesn't go to infinity
                //do this by taking mod so that it resets ever so often

                float leftover_panels = mod(animation_time, 5.);
                float panels_slide_scaled = leftover_panels * 0.4;

                //first column has x = -1, since we are going to be scrolling to the left
                //last column is going to have our scale factor which will be multiplied for x, to make sure its scrolling the right units

                mat4 scroll_mat = mat4(vec4(1., 0., 0., 0.), vec4(0., 1., 0., 0.), vec4(0., 0., 1., 0.), vec4(panels_slide_scaled, 0., 0., 1.));

                //now, we take our old f_tex_coord, convert it to a vec4
                vec4 f_tex_coord_new = vec4(f_tex_coord, 0., 0.);

                //we need to interpolate our f_tex_coordinates since f_tex_coord only gives pre-interpolated units
                //we just need to translate to the edge
                vec4 interpolated_f_tex_coord = f_tex_coord_new + vec4(1., 1., 0., 1.);

                //to get new texture coordinate, just multiply interpolated coordinates by the scrolling matrix
                interpolated_f_tex_coord = scroll_mat * interpolated_f_tex_coord;

                //get color using texture2D
                
                vec4 tex_color = texture2D( texture, interpolated_f_tex_coord.xy);



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

                //make a rotation matrix
                //rotate the center of each face at 15 rpm
                //angle of rotation: using 1 rpm = 2pi/60
                //15 rpm = (2pi*15)/60
                float pi = 3.14159265359;
                float angle_of_rotation = (2.0*pi*15.0)/60.0;
                float animation_time_split = mod(animation_time, 2.);
                float angle_of_rotation_scaled = angle_of_rotation*animation_time_split;

                //from the gif, we see that it is rotating counterclockwise around the z-axis 
                //the rotation matrix for z is (vec2(cos(theta), sin(theta)), vec2(sin(theta), -cos(theta)))
                //we put the negative sign on the second column because of the direction

                mat4 rotate_mat = mat4(vec4(cos(angle_of_rotation_scaled), sin(angle_of_rotation_scaled), 0., 0.), vec4(sin(angle_of_rotation_scaled), -cos(angle_of_rotation_scaled), 0., 0.), vec4(0., 0., 1., 0.), vec4(0., 0., 0., 1.));


                //now, we take our old f_tex_coord, convert it to a vec4
                vec4 f_tex_coord_new = vec4(f_tex_coord, 0., 0.);

                //we need to interpolate our f_tex_coordinates since f_tex_coord only gives pre-interpolated units
                //we are going to be rotating around the center, but we need to first shift it -0.5 and then back 0.5 units after rotation.
                vec4 interpolated_f_tex_coord = f_tex_coord_new + vec4(-0.5, -0.5, 0., 0.);

                //to get new texture coordinate, just multiply interpolated coordinates by the scrolling matrix
                //need to translate by 0.5 since we want the rotation to be from the center
                interpolated_f_tex_coord = (rotate_mat * interpolated_f_tex_coord) + vec4(0.5, 0.5, 0., 0.);

                

                vec4 tex_color = texture2D( texture, interpolated_f_tex_coord.xy);

                float x_border = mod(interpolated_f_tex_coord.x, 1.0);
                float y_border = mod(interpolated_f_tex_coord.y, 1.0);

                //now we want to get the edge coordinates
                //inner edge: 0.5 so 1-0.5 = 0.5/2 = 0.25 (edges will go from 0-0.25 and 0.75-1)
                //outter edge: 0.7 so 1-0.7 = 0.3/2 = 0.15 (edges will go from 0-0.15 and 0.85-1)

                //right edge
                if (x_border > 0.75 && x_border < 0.85 && y_border > 0.15 && y_border < 0.85) {
                    tex_color = vec4(0., 0., 0., 1.0);
                }

                //left edge
                if (x_border > 0.15 && x_border < 0.25 && y_border > 0.15 && y_border < 0.85) {
                    tex_color = vec4(0., 0., 0., 1.0);
                }

                //top edge
                if (x_border > 0.15 && x_border < 0.85 && y_border > 0.75 && y_border < 0.85) {
                    tex_color = vec4(0., 0., 0., 1.0);
                }

                if (x_border > 0.15 && x_border < 0.85 && y_border > 0.15 && y_border < 0.25) {
                    tex_color = vec4(0., 0., 0., 1.0);
                }
                
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}