exports.up = async function(knex) {
  await knex.schema.table('conversations', function(table) {
    table.dropColumn('listing_id');
  });
};

exports.down = async function(knex) {
  await knex.schema.table('conversations', function(table) {
    table.integer('listing_id').references('listing_id').inTable('listings').onDelete('CASCADE');
  });
}; 