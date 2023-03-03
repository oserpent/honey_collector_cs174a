import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

const FLOOR_MIN = vec4(-1, -1, 0, 1);
const FLOOR_MAX = vec4(1, 1, 0, 1);

const CUBE_MIN = vec4(-1, -1, -1, 1);
const CUBE_MAX = vec4(1, 1, 1, 1);

const GRAVITY_ACCELERATION = -0.3;
const JUMP_VELOCITY = 10;

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

//return true for collision between object1 and object2
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

export class HoneyCollector extends Scene {
    constructor() {
        super();

        this.shapes = {
            cube: new defs.Cube(),
            floor: new defs.Square()
        };

        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };

        this.model_transforms = {
            cube: Mat4.identity(),
            floor: Mat4.translation(0, -1, 0).times(Mat4.scale(2, 1, 2)).times(Mat4.rotation(Math.PI/2, 1, 0, 0))
        };

        this.cube = {
            velocity: {
                x: 0,
                y: 0
            },
        };
        
        this.airborne = true;
        this.jump = false;

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        this.key_triggered_button("Jump", ["v"], () => {
            //jump only when airborne
            if (!this.airborne){
                this.jump = true;
            }
        });
    }

    display(context, program_state) {
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        //handle cube collision with floor
        if (!collision(this.model_transforms.cube, CUBE_MIN, CUBE_MAX, this.model_transforms.floor, FLOOR_MIN, FLOOR_MAX)){
            this.cube.velocity.y += GRAVITY_ACCELERATION;
            this.airborne = true;
        }
        else {
            this.cube.velocity.y = 0;
            this.airborne = false;
        }

        //handle jump
        if (this.jump) {
            this.cube.velocity.y += JUMP_VELOCITY;
            this.jump = false;
        }

        //move cube downward based on cube y velocity
        this.model_transforms.cube = this.model_transforms.cube.times(Mat4.translation(0, this.cube.velocity.y * dt, 0));

        this.shapes.floor.draw(context, program_state, this.model_transforms.floor, this.materials.test);
        this.shapes.cube.draw(context, program_state, this.model_transforms.cube, this.materials.test);
    }
}