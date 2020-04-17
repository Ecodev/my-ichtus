import { marks, nodes } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { Schema } from 'prosemirror-model';

// Disable a few elements
delete nodes.image;
delete nodes.code;
delete nodes.code_block;
delete nodes.blockquote;
delete nodes.horizontal_rule;

const basicSchema = new Schema({nodes, marks});

export const schema = new Schema({
    nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
    marks: basicSchema.spec.marks,
});
