import {defs, tiny} from "../examples/common.js";

const {hex_color, Mat4, Material,} = tiny;

export class Bird {

    constructor(translation_coordinates) {
        this.x = translation_coordinates.x;
        this.y = translation_coordinates.y;
        this.z = translation_coordinates.z;

        this.shapes = {
            bird_body: new defs.Capped_Cylinder(30, 30),
            bird_head: new defs.Cone_Tip(30, 30),
            left_wing: new defs.Cube(),
            right_wing: new defs.Cube()
        }

        this.materials = {
            bird: new Material(new defs.Phong_Shader(), {
                color: hex_color("#A020F0"), ambient: 0.8, diffusivity: 1
            })
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
        let bird_body_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.translation(0, 0, 0)).times(Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.scale(0.3, 0.3, 2.5));
        this.shapes.bird_body.draw(context, program_state, bird_body_transform, this.materials.bird);

        let bird_head_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.translation(-1.55, 0, 0)).times(Mat4.rotation(-Math.PI/2, 0, 1, 0)).times(Mat4.scale(0.3, 0.3, 0.3));
        this.shapes.bird_head.draw(context, program_state, bird_head_transform, this.materials.bird);

        let left_wing_swing = Math.sin(4*time)/2;
        let left_wing_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.rotation(left_wing_swing, 1, 0, 0)).times(Mat4.translation(0, 0, 0)).times(Mat4.rotation(-Math.PI/2, 0, 1, 0)).times(Mat4.translation(0.7, 0, 0)).times(Mat4.scale(1, 0.05, 0.5));
        this.shapes.left_wing.draw(context, program_state, left_wing_transform, this.materials.bird);

        let right_wing_swing = Math.sin(Math.PI + 4*time)/2;
        let right_wing_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.rotation(right_wing_swing, 1, 0, 0)).times(Mat4.translation(0, 0, 0)).times(Mat4.rotation(-Math.PI/2, 0, 1, 0)).times(Mat4.translation(-0.7, 0, 0)).times(Mat4.scale(1, 0.05, 0.5));
        this.shapes.left_wing.draw(context, program_state, right_wing_transform, this.materials.bird);
    }
}