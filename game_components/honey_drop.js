import {defs, tiny} from "../examples/common.js";

const {hex_color, Mat4, Material,} = tiny;

export class HoneyDrop {

    constructor(translation_coordinates) {
        this.x = translation_coordinates.x;
        this.y = translation_coordinates.y;
        this.z = translation_coordinates.z;

        this.shapes = {
            honey_sphere: new defs.Subdivision_Sphere(4),
            honey_cone: new defs.Cone_Tip(30, 30)
        }

        this.materials = {
            honey: new Material(new defs.Phong_Shader(), {
                color: hex_color("#f9c901"), ambient: 0.8, diffusivity: 1
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

    display(context, program_state) {
        let honey_sphere_transform = Mat4.translation(this.x, this.y, this.z);
        this.shapes.honey_sphere.draw(context, program_state, honey_sphere_transform, this.materials.honey);

        let honey_cone_transform = Mat4.translation(this.x, this.y, this.z).times(Mat4.translation(0, 1.2, 0)).times(Mat4.rotation(-Math.PI/2, 1, 0, 0)).times(Mat4.scale(0.98, 0.98, 1));
        this.shapes.honey_cone.draw(context, program_state, honey_cone_transform, this.materials.honey);
    }
}