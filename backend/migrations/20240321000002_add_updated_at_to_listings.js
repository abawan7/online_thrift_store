exports.up = async function(knex) {
  await knex.schema.table('listings', function(table) {
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.table('listings', function(table) {
    table.dropColumn('updated_at');
  });
};