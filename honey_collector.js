import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

const FLOOR_MIN = vec4(-1, -1, 0, 1);
const FLOOR_MAX = vec4(1, 1, 0, 1);

const CUBE_MIN = vec4(-1, -1, -1, 1);
const CUBE_MAX = vec4(1, 1, 1, 1);

const GRAVITY_ACCELERATION = -0.5;
const JUMP_VELOCITY = 15;

const OBSTACLE_VELOCITY = -15;
const CUBE_SPAWN = Mat4.translation(-12, 0, 0);
const OBSTACLE_SPAWN = Mat4.translation(20, 0, 0);

const red = hex_color("#FF0000");
const light_green = hex_color("#90EE90");
const light_blue = hex_color("#87C1FF");
const turquoise = hex_color("#30D5C8");

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

// returns how much object1 has to move in each direction to resolve AABB collision
//x_right: how much object1 has to move right
//x_left: how much object1 has to move left
//y_up: how much object1 has to move up
//y_down: how much object1 has to move down
//z_forward: how much object1 has to move forward
//z_back: how much object1 has to move back
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
    constructor() {
        super();

        this.shapes = {
            cube: new defs.Cube(),
            floor: new defs.Square(),
            obstacle: new defs.Cube(),
        };

        this.materials = {
            floor: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, color: turquoise}),
            cube: new Material(new defs.Phong_Shader(),
                {ambient: 0, diffusivity: 1, color: light_green}),
            obstacle: new Material(new defs.Phong_Shader(),
                {ambient: 0, diffusivity: 1, color: light_blue}),
        };

        this.model_transforms = {
            cube: CUBE_SPAWN,
            floor: Mat4.translation(0, -1, 0).times(Mat4.scale(20, 1, 2)).times(Mat4.rotation(Math.PI/2, 1, 0, 0)),
            obstacle: OBSTACLE_SPAWN
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
        
        this.airborne = true;

        this.playing = true;
        this.time = 0;

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        this.key_triggered_button("Jump", ["v"], () => {
            //jump only when airborne
            if (this.playing && !this.airborne){
                this.cube.velocity.y += JUMP_VELOCITY;
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
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

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

        this.shapes.floor.draw(context, program_state, this.model_transforms.floor, this.materials.floor);
        this.shapes.cube.draw(context, program_state, this.model_transforms.cube, this.materials.cube.override({color: this.cube.color}));
        this.shapes.obstacle.draw(context, program_state, this.model_transforms.obstacle, this.materials.obstacle);
    }
}