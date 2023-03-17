import {defs, tiny} from "../examples/common.js";

const {hex_color, Mat4, Material, Texture,} = tiny;

const {Textured_Phong} = defs

export class Pond {

    constructor(translation_coordinates) {
        this.x = translation_coordinates.x;
        this.y = translation_coordinates.y;
        this.z = translation_coordinates.z;

        this.shapes = {
            pond: new defs.Subdivision_Sphere(4),
            pond2: new defs.Subdivision_Sphere(4),
        }

        this.materials = {
            pond: new Material(new Textured_Phong(), {
                color: hex_color("#5fd2b1"), ambient: 1, diffusivity: 0,texture: new Texture("assets/pond.png")
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
        let pond_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.translation(0,0,0)).times(Mat4.scale(1.5,0.05,1.5));
        this.shapes.pond.draw(context, program_state, pond_transform, this.materials.pond);

        let pond2_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.translation(1.25,0,0)).times(Mat4.scale(1,0.05,1));
        this.shapes.pond2.draw(context, program_state, pond2_transform, this.materials.pond);
    }
}