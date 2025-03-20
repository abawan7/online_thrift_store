exports.up = function(knex) {
    return knex.schema.createTable('user_summary_memory', function(table) {
      table.string('user_id').primary();  // user_id as the primary key
      table.text('summary');  // Store the conversation summary
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('user_summary_memory');
  };
  