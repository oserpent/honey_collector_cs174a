import {defs, tiny} from "./examples/common.js";

const {
    hex_color, Mat4, Material,
} = tiny;

class SevenSegmentDisplay {
    // translation_coordinates is an object of form { x: x_coord, y: y_coord, z: z_coord }
    constructor(material, translation_coordinates, scaling_factor, segment_width) {

        //digit is a string
        this.digit = null;
        this.x = translation_coordinates.x;
        this.y = translation_coordinates.y;
        this.z = translation_coordinates.z;
        this.scaling_factor = scaling_factor;
        this.segment_width = segment_width;

        this.shapes = {
            segment: new defs.Cube()
        }

        this.material = material;

        //function so model_transforms updates when setTranslationCoordinates is called
        this.model_transforms = () => {
            return {
                //segment height = 1 before scaling_factor is applied
                A: Mat4.translation(this.x, this.y, this.z).times(Mat4.scale(this.scaling_factor, scaling_factor, scaling_factor)).times(Mat4.translation(0,2 - segment_width,0)).times(Mat4.scale(1, segment_width, segment_width)),
                B: Mat4.translation(this.x, this.y, this.z).times(Mat4.scale(this.scaling_factor, scaling_factor, scaling_factor)).times(Mat4.translation(1 - this.segment_width,2 - 1, 0)).times(Mat4.scale(segment_width, 1, segment_width)),
                C: Mat4.translation(this.x, this.y, this.z).times(Mat4.scale(this.scaling_factor, scaling_factor, scaling_factor)).times(Mat4.translation(1 - this.segment_width,1 - 2, 0)).times(Mat4.scale(segment_width, 1, segment_width)),
                D: Mat4.translation(this.x, this.y, this.z).times(Mat4.scale(this.scaling_factor, scaling_factor, scaling_factor)).times(Mat4.translation(0,segment_width - 2,0)).times(Mat4.scale(1, segment_width, segment_width)),
                E: Mat4.translation(this.x, this.y, this.z).times(Mat4.scale(this.scaling_factor, scaling_factor, scaling_factor)).times(Mat4.translation(this.segment_width - 1,1 - 2, 0)).times(Mat4.scale(segment_width, 1, segment_width)),
                F: Mat4.translation(this.x, this.y, this.z).times(Mat4.scale(this.scaling_factor, scaling_factor, scaling_factor)).times(Mat4.translation(this.segment_width - 1,2 - 1, 0)).times(Mat4.scale(segment_width, 1, segment_width)),
                G: Mat4.translation(this.x, this.y, this.z).times(Mat4.scale(this.scaling_factor, scaling_factor, scaling_factor)).times(Mat4.translation(0, 0, 0)).times(Mat4.scale(1, segment_width, segment_width))
            }
        }
    }

    setDigit (digit) {
        this.digit = digit;
    }

    setTranslationCoordinates (translation_coordinates) {
        this.x = translation_coordinates.x;
        this.y = translation_coordinates.y;
        this.z = translation_coordinates.z;
    }

    display(context, program_state) {
        const draw_segment = segment => {
            switch(segment) {
                case 'A':
                    this.shapes.segment.draw(context, program_state, this.model_transforms().A, this.material);
                    break;
                case 'B':
                    this.shapes.segment.draw(context, program_state, this.model_transforms().B, this.material);
                    break;
                case 'C':
                    this.shapes.segment.draw(context, program_state, this.model_transforms().C, this.material);
                    break;
                case 'D':
                    this.shapes.segment.draw(context, program_state, this.model_transforms().D, this.material);
                    break;
                case 'E':
                    this.shapes.segment.draw(context, program_state, this.model_transforms().E, this.material);
                    break;
                case 'F':
                    this.shapes.segment.draw(context, program_state, this.model_transforms().F, this.material);
                    break;
                case 'G':
                    this.shapes.segment.draw(context, program_state, this.model_transforms().G, this.material);
                    break;
                default:
                    throw 'Not a valid segment'
            }
        }

        const draw_many_segments = (...segments) => {
            for (const segment of segments){
                draw_segment(segment);
            }
        }

        switch(this.digit) {
            case '0':
                draw_many_segments('A', 'B', 'C', 'D', 'E', 'F');
                break;
            case '1':
                draw_many_segments('B', 'C');
                break;
            case '2':
                draw_many_segments('A', 'B', 'D', 'E', 'G');
                break;
            case '3':
                draw_many_segments('A', 'B', 'C', 'D', 'G');
                break;
            case '4':
                draw_many_segments('B', 'C', 'F', 'G');
                break;
            case '5':
                draw_many_segments('A', 'C', 'D', 'F', 'G');
                break;
            case '6':
                draw_many_segments('A', 'C', 'D', 'E', 'F', 'G');
                break;
            case '7':
                draw_many_segments('A', 'B', 'C');
                break;
            case '8':
                draw_many_segments('A', 'B', 'C', 'D', 'E', 'F', 'G');
                break;
            case '9':
                draw_many_segments('A', 'B', 'C', 'D', 'F', 'G');
                break;
            default:
                throw 'Not a valid number'
        }
    }
}

// translation_coordinates is the coordinates of the center of the right-most digit

export class NumberDisplay {
    constructor(material, translation_coordinates = {x: 0, y: 0, z: 0}, scaling_factor = 1, segment_width = 0.3) {
        this.material = material;
        this.x = translation_coordinates.x;
        this.y = translation_coordinates.y;
        this.z = translation_coordinates.z;
        this.scaling_factor = scaling_factor;
        this.segment_width = segment_width;
        this.ssds = [];
    }

    // number is an int
    display_number(number, context, program_state) {
        const digits = number.toString().split('');
        while (digits.length > this.ssds.length) {
            this.ssds.push(new SevenSegmentDisplay(this.material, {x: this.x, y: this.y, z: this.z}, this.scaling_factor, this.segment_width));
            //shift existing seven segment displays when new digit comes in
            for (let i = 0; i < this.ssds.length; i++) {
                this.ssds[i].setTranslationCoordinates({x: this.x - 2.5*this.scaling_factor*(this.ssds.length-i-1), y: this.y, z: this.z});
            }
        }

        for (let i = 0; i < digits.length; i++) {
            this.ssds[i].setDigit(digits[i]);
            this.ssds[i].display(context, program_state);
        }
    }
}