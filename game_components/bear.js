import {defs, tiny} from "../examples/common.js";

const {hex_color, Mat4, Material, Texture,} = tiny;

const {Textured_Phong} = defs

export class Bear {

    constructor(translation_coordinates) {
        this.x = translation_coordinates.x;
        this.y = translation_coordinates.y;
        this.z = translation_coordinates.z;

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
            fur: new Material(new Textured_Phong(), {
                color: hex_color("#482610"), ambient: 1, diffusivity: 0,texture: new Texture("assets/Bear.png")
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

        let head_transform = Mat4.translation(this.x,this.y,this.z).times(Mat4.translation(0, 2, 0));
        if (this.duck) {
            head_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.translation(-1, 1, 0)).times(Mat4.rotation(-Math.PI/2, 0, 0, 1)).times(Mat4.translation(0,2,0));
        }
        this.shapes.head.draw(context, program_state, head_transform, this.materials.fur);

        let ear1_transform = Mat4.translation(this.x,this.y,this.z).times(Mat4.translation(0, 3, 0.5)).times(Mat4.scale(0.1,0.4,0.4));
        if (this.duck) {
            ear1_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.translation(0,1,0.5)).times(Mat4.rotation(-Math.PI/2, 0, 0, 1)).times(Mat4.translation(0,2,0)).times(Mat4.scale(0.1,0.4,0.4));
        }
        this.shapes.ear1.draw(context, program_state, ear1_transform, this.materials.fur);

        let ear2_transform = Mat4.translation(this.x,this.y,this.z).times(Mat4.translation(0, 3, -0.5)).times(Mat4.scale(0.1,0.4,0.4));
        if (this.duck) {
            ear2_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.translation(0,1,-0.5)).times(Mat4.rotation(-Math.PI/2, 0, 0, 1)).times(Mat4.translation(0,2,0)).times(Mat4.scale(0.1,0.4,0.4));
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