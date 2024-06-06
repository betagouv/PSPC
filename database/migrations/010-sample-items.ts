import { Knex } from 'knex';

exports.up = async (knex: Knex) => {
  await knex.schema.createTable('sample_items', (table) => {
    table
      .uuid('sample_id')
      .references('id')
      .inTable('samples')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.integer('item_number').notNullable();
    table.double('quantity');
    table.string('quantity_unit');
    table.string('seal_id');
    table.boolean('compliance200263');
    table.uuid('document_id').references('id').inTable('documents');
    table.primary(['sample_id', 'item_number']);
  });
};

exports.down = async (knex: Knex) => {
  await knex.schema.dropTable('sample_items');
};