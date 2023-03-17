import {tiny} from './examples/common.js';

const {Vector3, hex_color, Shape} = tiny;

export class Cube_Outline extends Shape {
    constructor() {
        super("position", "color");
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1],
            [-1, -1, -1], [-1, 1, -1],
            [-1, -1, -1], [-1, -1, 1],
            [1, -1, -1], [1, 1, -1],
            [1, -1, -1], [1, -1, 1],
            [-1, 1, -1], [1, 1, -1],
            [-1, 1, -1], [-1, 1, 1],
            [-1, -1, 1], [1, -1, 1],
            [-1, -1, 1], [-1, 1, 1],
            [1, 1, -1], [1, 1, 1],
            [1, -1, 1], [1, 1, 1],
            [-1, 1, 1], [1, 1, 1]);
        this.arrays.color = [
            hex_color("#FFFFFF"), hex_color("#FFFFFF"),
            hex_color("#FFFFFF"), hex_color("#FFFFFF"),
            hex_color("#FFFFFF"), hex_color("#FFFFFF"),
            hex_color("#FFFFFF"), hex_color("#FFFFFF"),
            hex_color("#FFFFFF"), hex_color("#FFFFFF"),
            hex_color("#FFFFFF"), hex_color("#FFFFFF"),
            hex_color("#FFFFFF"), hex_color("#FFFFFF"),
            hex_color("#FFFFFF"), hex_color("#FFFFFF"),
            hex_color("#FFFFFF"), hex_color("#FFFFFF"),
            hex_color("#FFFFFF"), hex_color("#FFFFFF"),
            hex_color("#FFFFFF"), hex_color("#FFFFFF"),
            hex_color("#FFFFFF"), hex_color("#FFFFFF")];
        this.indices = false;
    }
}