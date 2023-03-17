import {tiny} from './examples/common.js';

const {vec4, Matrix} = tiny;

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
export const collision = (model_transform_1, object1_min, object1_max, model_transform_2, object2_min, object2_max) => {
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
export const collisionCorrection = (model_transform_1, object1_min, object1_max, model_transform_2, object2_min, object2_max) => {
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