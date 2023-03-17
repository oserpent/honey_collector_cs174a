import {defs, tiny} from './examples/common.js';
import {NumberDisplay} from './number_display.js';
import {Bear} from './game_components/bear.js';
import {Log} from './game_components/log.js';
import {Pond} from './game_components/pond.js';
import {Bird} from './game_components/bird.js';
import {HoneyDrop} from './game_components/honey_drop.js';
import {Cube_Outline} from './cube_outline.js';
import {collision, collisionCorrection} from './collision_detection.js';

const {
    vec4, color, hex_color, Mat4, Light, Material, Scene, Texture,
} = tiny;

const {Textured_Phong, Square} = defs

const FLOOR_MIN = vec4(-1, -1, 0, 1);
const FLOOR_MAX = vec4(1, 1, 0, 1);

const CUBE_MIN = vec4(-1, -1, -1, 1);
const CUBE_MAX = vec4(1, 1, 1, 1);
const GRAVITY_ACCELERATION = -0.5;

//FLOOR
const FLOOR_SPAWN = Mat4.translation(0, -10, 0).times(Mat4.scale(30, 1, 6)).times(Mat4.rotation(Math.PI/2, 1, 0, 0));

//BACKGROUND
const BACKGROUND_SPAWN = Mat4.translation(0, 0, -8).times(Mat4.scale(30, 25, 0)).times(Mat4.rotation(0, 0, Math.PI, 0));

//NUMBER_DISPLAY
const NUMBER_DISPLAY_SPAWN = {x: 20, y: 10, z: 0};

//BEAR
const MAX_BEAR_AABB_HEIGHT = 3;
const DUCK_BEAR_AABB_HEIGHT = 0.85 * MAX_BEAR_AABB_HEIGHT;
let BEAR_AABB_HEIGHT = MAX_BEAR_AABB_HEIGHT;
const BEAR_DUCK = Mat4.scale(1, DUCK_BEAR_AABB_HEIGHT, 1);
const BEAR_STAND = Mat4.scale(1, MAX_BEAR_AABB_HEIGHT, 1);
const BEAR_DUCK_TRANSLATION = Mat4.translation(0, DUCK_BEAR_AABB_HEIGHT - MAX_BEAR_AABB_HEIGHT, 0);
const BEAR_STAND_TRANSLATION = Mat4.translation(0, MAX_BEAR_AABB_HEIGHT - DUCK_BEAR_AABB_HEIGHT, 0);
const BEAR_AABB_SPAWN = Mat4.translation(-15, -7, 0).times(BEAR_STAND);
const BEAR_SPAWN = {x: -15, y: -7, z: 0};
const JUMP_VELOCITY = 15;

//MOVING OBJECTS
const MOVING_OBJECT_VELOCITY = -15;

//LOG
const LOG_LENGTH = 1;
const LOG_AABB_SPAWN = Mat4.translation(25, -9, 0).times(Mat4.scale(LOG_LENGTH, 1, 1.8));
const LOG_SPAWN = {x: 25, y: -9, z: 0};

//POND
const POND_LENGTH = 2;
const POND_AABB_SPAWN = Mat4.translation(25.35, -9.8, 0).times(Mat4.scale(POND_LENGTH, 0.2, 1.5));
const POND_SPAWN = {x: 25, y: -10, z: 0};

//BIRD
const BIRD_LENGTH = 1.5;
const BIRD_AABB_SPAWN = Mat4.translation(25, -4.3, 0).times(Mat4.scale(BIRD_LENGTH, 0.5, 1.5));
const BIRD_SPAWN = {x: 25.25, y: -4.3, z: 0};

//HONEY DROP
const HONEY_DROP_LENGTH = 1;
const HONEY_DROP_AABB_SPAWN = Mat4.translation(25, -2.4, 0).times(Mat4.scale(HONEY_DROP_LENGTH, 1.5, 1));
const HONEY_DROP_SPAWN = {x: 25, y: -3, z: 0};

//COLORS
const light_green = hex_color("#90EE90");
const grass_green = hex_color("#7CFC00");

//GLOBAL VARS
let game_start = 0;
let game_time = 0;
let speedup = 0;

export class HoneyCollector extends Scene {
    constructor() {
        super();

        this.shapes = {
            bear_aabb: new Cube_Outline(),
            floor: new Square(),
            obstacle_aabb: new Cube_Outline(),
            background: new Square(),
            honey_drop_aabb: new Cube_Outline(),
        }

        this.materials = {
            floor: new Material(new defs.Phong_Shader(),
            {ambient: 0.5, diffusivity: 1, color: grass_green}),
            //loading square images of my choice
            //opaque black has hex color #000000
            //set ambient to 1 to be able to see it
            background: new Material(new Texture_Scroll_X(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/pot_starry_background.jpg","LINEAR_MIPMAP_LINEAR")
            }),
            number_display: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, color: light_green}),
        }

        this.white = new Material(new defs.Basic_Shader());

        this.model_transforms = {
            bear_aabb: BEAR_AABB_SPAWN,
            floor: FLOOR_SPAWN,
            obstacle_aabb: null,
            background: BACKGROUND_SPAWN,
            honey_drop_aabb: HONEY_DROP_AABB_SPAWN
        };

        this.bear_aabb = {
            velocity: {
                x: 0,
                y: 0
            },
            color: light_green
        };

        this.obstacle_aabb = {
            velocity: {
                x: MOVING_OBJECT_VELOCITY,
                y: 0
            },
            time_snapshot: 0,
            game_component: null,
            obstacle_length: 0
        };

        this.honey_drop_aabb = {
            velocity: {
                x: MOVING_OBJECT_VELOCITY,
                y: 0
            },
            time_snapshot: game_time + (Math.random() * (10 - 5)) + 5,
            lifetime: (Math.random() * (20 - 15)) + 15
        }

        this.airborne = true;

        this.playing = true;

        this.initial_camera_location = Mat4.translation(0, 0, -30);

        this.number_display = new NumberDisplay(this.materials.number_display, NUMBER_DISPLAY_SPAWN, 0.5);

        this.bear = new Bear(BEAR_SPAWN);
        this.log = new Log(LOG_SPAWN);
        this.pond = new Pond(POND_SPAWN);
        this.bird = new Bird(BIRD_SPAWN);

        this.honey_drop = new HoneyDrop(HONEY_DROP_SPAWN);

        this.setUpRandomObstacle();

        this.duck = false;

        this.curr_honey_drop_collected = false;

        this.score = 0;

        this.hitboxes = false;
    }

    setUpRandomObstacle() {
        const randInt = Math.floor(Math.random() * 3);
        switch (randInt) {
            case 0:
                this.model_transforms.obstacle_aabb = LOG_AABB_SPAWN;
                this.log.setTranslationCoordinates(LOG_SPAWN);
                this.obstacle_aabb.game_component = this.log;
                this.obstacle_aabb.obstacle_length = LOG_LENGTH;
                break;
            case 1:
                this.model_transforms.obstacle_aabb = POND_AABB_SPAWN;
                this.pond.setTranslationCoordinates(POND_SPAWN);
                this.obstacle_aabb.game_component = this.pond;
                this.obstacle_aabb.obstacle_length = POND_LENGTH;
                break;
            case 2:
                this.model_transforms.obstacle_aabb = BIRD_AABB_SPAWN;
                this.bird.setTranslationCoordinates(BIRD_SPAWN);
                this.obstacle_aabb.game_component = this.bird;
                this.obstacle_aabb.obstacle_length = BIRD_LENGTH;
                break;
            default:
                throw "Not a valid random int"
        }
        this.obstacle_aabb.time_snapshot = game_time;
    }
    setUpHoney(restart) {
        this.model_transforms.honey_drop_aabb = HONEY_DROP_AABB_SPAWN;
        this.honey_drop.setTranslationCoordinates(HONEY_DROP_SPAWN);
        if (restart){
            this.honey_drop_aabb.time_snapshot = game_time + (Math.random() * (20 - 15)) + 15;
        } else {
            this.honey_drop_aabb.time_snapshot = game_time;
        }
        this.honey_drop_aabb.lifetime = (Math.random() * (20 - 15)) + 15;
        this.curr_honey_drop_collected = false;
    }

    make_control_panel() {
        this.key_triggered_button("Jump", ["v"], () => {
            //jump only when not airborne
            if (this.playing && !this.airborne){
                this.bear_aabb.velocity.y += JUMP_VELOCITY;
            }
        });
        this.key_triggered_button("Duck", ["c"], () => {
            //duck only when not airborne
            if (this.playing && !this.duck && !this.airborne){
                this.duck_aabb();
                this.bear.duck_component();
                this.duck = true;
            }
        }, undefined, () => {
            if (this.playing && this.duck && !this.airborne){
                this.stand_aabb();
                this.bear.stand_component();
                this.duck = false;
            }
        });
        this.key_triggered_button("Restart", ["x"], () => {
            //reset spawns on game restart
            game_start = this.time;
            game_time = this.time - game_start;
            this.playing = true;
            if (this.duck) {
                this.stand_aabb();
                this.bear.stand_component();
                this.duck = false;
            }
            this.model_transforms.bear_aabb = BEAR_AABB_SPAWN;
            this.bear.setTranslationCoordinates(BEAR_SPAWN);

            this.setUpRandomObstacle();
            this.setUpHoney(true);

            this.bear_aabb.color = light_green;
            this.bear_aabb.velocity.y = 0;
            this.score = 0;
        });
        this.key_triggered_button("Show Hitboxes", ["h"], () => {
            //jump only when not airborne
            this.hitboxes ^= 1;
        });
    }

    duck_aabb() {
        const bear_translation = Mat4.inverse(BEAR_STAND.times(Mat4.inverse(this.model_transforms.bear_aabb)));
        this.model_transforms.bear_aabb = BEAR_DUCK_TRANSLATION.times(bear_translation.times(BEAR_DUCK));
        BEAR_AABB_HEIGHT = DUCK_BEAR_AABB_HEIGHT;
    }

    stand_aabb() {
        const bear_translation = Mat4.inverse(BEAR_DUCK.times(Mat4.inverse(this.model_transforms.bear_aabb)));
        this.model_transforms.bear_aabb = BEAR_STAND_TRANSLATION.times(bear_translation.times(BEAR_STAND));
        BEAR_AABB_HEIGHT = MAX_BEAR_AABB_HEIGHT
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
            const speedup_temp = game_time / 50;
            if (speedup <= 1) {
                speedup = 1 + speedup_temp;
            }

            this.score += speedup * dt;

            game_time = this.time - game_start;
            //obstacle spawn after 4 / speedup seconds
            if (game_time - this.obstacle_aabb.time_snapshot >= 4 / speedup){

                this.setUpRandomObstacle();
            }

            if (game_time - this.honey_drop_aabb.time_snapshot >= this.honey_drop_aabb.lifetime / speedup) {
                this.setUpHoney(false);
            }

            //move bear downwards based on bear_aabb y velocity
            this.model_transforms.bear_aabb = this.model_transforms.bear_aabb.times(Mat4.translation(0, (this.bear_aabb.velocity.y * dt)/BEAR_AABB_HEIGHT, 0));
            this.bear.moveCoordinates({x: 0, y: this.bear_aabb.velocity.y * dt, z: 0});

            //move obstacle to the left based on obstacle_aabb velocity
            this.model_transforms.obstacle_aabb = this.model_transforms.obstacle_aabb.times(Mat4.translation((this.obstacle_aabb.velocity.x * speedup * dt)/this.obstacle_aabb.obstacle_length, 0, 0));
            this.obstacle_aabb.game_component.moveCoordinates({x: this.obstacle_aabb.velocity.x * speedup * dt, y: 0, z: 0})

            //move honey_drop to the left based on honey_drop_aabb velocity
            this.model_transforms.honey_drop_aabb = this.model_transforms.honey_drop_aabb.times(Mat4.translation((this.honey_drop_aabb.velocity.x * speedup * dt)/HONEY_DROP_LENGTH, 0, 0));
            this.honey_drop.moveCoordinates({x: this.honey_drop_aabb.velocity.x * speedup * dt, y: 0, z: 0});

            //handle bear_aabb collision with floor
            if (!collision(this.model_transforms.bear_aabb, CUBE_MIN, CUBE_MAX, this.model_transforms.floor, FLOOR_MIN, FLOOR_MAX)){
                this.bear_aabb.velocity.y += GRAVITY_ACCELERATION;
                this.airborne = true;
            }
            else {
                const { y_up } = collisionCorrection(this.model_transforms.bear_aabb, CUBE_MIN, CUBE_MAX, this.model_transforms.floor, FLOOR_MIN, FLOOR_MAX);
                this.model_transforms.bear_aabb = this.model_transforms.bear_aabb.times(Mat4.translation(0, y_up/BEAR_AABB_HEIGHT, 0));
                this.bear.moveCoordinates({x: 0, y: y_up, z: 0})
                this.bear_aabb.velocity.y = 0;
                this.airborne = false;
            }

            //handle collision with honey_drop
            if (collision(this.model_transforms.bear_aabb, CUBE_MIN, CUBE_MAX, this.model_transforms.honey_drop_aabb, CUBE_MIN, CUBE_MAX)){
                if (!this.curr_honey_drop_collected && game_time >= this.honey_drop_aabb.time_snapshot) {
                    this.score += 10;
                    this.curr_honey_drop_collected = true;
                }
            }

            //end game after collision with obstacle
            if (collision(this.model_transforms.bear_aabb, CUBE_MIN, CUBE_MAX, this.model_transforms.obstacle_aabb, CUBE_MIN, CUBE_MAX)){
                this.playing = false;
            }
        }

        this.shapes.floor.draw(context, program_state, this.model_transforms.floor, this.materials.floor);
        if (this.hitboxes) {
            this.shapes.bear_aabb.draw(context, program_state, this.model_transforms.bear_aabb, this.white, "LINES");
            this.shapes.obstacle_aabb.draw(context, program_state, this.model_transforms.obstacle_aabb, this.white, "LINES");
        }
        this.shapes.background.draw(context, program_state, this.model_transforms.background, this.materials.background);
        this.number_display.display_number(Math.floor(this.score), context, program_state);
        this.bear.display(context, program_state, speedup * game_time);
        this.obstacle_aabb.game_component.display(context, program_state, game_time);
        if (!this.curr_honey_drop_collected && game_time >= this.honey_drop_aabb.time_snapshot){
            if (this.hitboxes) {
                this.shapes.honey_drop_aabb.draw(context, program_state, this.model_transforms.honey_drop_aabb, this.white, "LINES");
            }
            this.honey_drop.display(context, program_state);
        }
    }
}

class Texture_Scroll_X extends Textured_Phong {
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float game_time;
            
            void main(){
                float leftover_panels = mod(game_time, 5.);
                float panels_slide_scaled = leftover_panels * 0.4;
                mat4 scroll_mat = mat4(vec4(1., 0., 0., 0.), vec4(0., 1., 0., 0.), vec4(0., 0., 1., 0.), vec4(panels_slide_scaled, 0., 0., 1.));
                vec4 f_tex_coord_new = vec4(f_tex_coord, 0., 0.);
                vec4 interpolated_f_tex_coord = f_tex_coord_new + vec4(1., 1., 0., 1.);
                interpolated_f_tex_coord = scroll_mat * interpolated_f_tex_coord;
                vec4 tex_color = texture2D( texture, interpolated_f_tex_coord.xy);
                if( tex_color.w < .01 ) discard;                                                       
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        super.update_GPU(context, gpu_addresses, gpu_state, model_transform, material);
        context.uniform1f(gpu_addresses.game_time, speedup * game_time);
        if (material.texture && material.texture.ready) {
            context.uniform1i(gpu_addresses.texture, 0);
            material.texture.activate(context);
        }
    }
}