exports.up = function(knex) {
  return knex.schema
    .createTable('conversations', function(table) {
      table.increments('conversation_id').primary();
      table.integer('listing_id').references('listing_id').inTable('listings').onDelete('CASCADE');
      table.integer('buyer_id').references('user_id').inTable('users').onDelete('CASCADE');
      table.integer('seller_id').references('user_id').inTable('users').onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('messages', function(table) {
      table.increments('message_id').primary();
      table.integer('conversation_id').references('conversation_id').inTable('conversations').onDelete('CASCADE');
      table.integer('sender_id').references('user_id').inTable('users').onDelete('CASCADE');
      table.text('content').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .then(() => {
      return knex.schema.raw(`
        CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
        CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);
        CREATE INDEX idx_conversations_listing_id ON conversations(listing_id);
        CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
        CREATE INDEX idx_messages_sender_id ON messages(sender_id);
      `);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('messages')
    .dropTable('conversations');
}; 