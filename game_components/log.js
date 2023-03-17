import {defs, tiny} from "../examples/common.js";

const {hex_color, Mat4, Material, Texture,} = tiny;

const {Textured_Phong} = defs

export class Log {

    constructor(translation_coordinates) {
        this.x = translation_coordinates.x;
        this.y = translation_coordinates.y;
        this.z = translation_coordinates.z;

        this.shapes = {
            log: new defs.Cylindrical_Tube(3,20),
            log_face: new defs.Capped_Cylinder(3,20)
        }

        this.materials = {
            wood: new Material(new defs.Phong_Shader(), {
                color: hex_color("#6c3918"), ambient: 0.8, diffusivity: 1
            }),
            wood_face: new Material(new Textured_Phong(), {
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