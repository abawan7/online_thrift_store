const express = require('express');
const cors = require('cors');
const { query } = require('./db');  
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken here
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const secretKey = process.env.JWT_SECRET; // Ensure JWT secret is in your .env file

// Middleware setup
// Make sure these lines are at the top of your server.js file
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Sign-Up Route
app.post('/signup', async (req, res) => {
  console.log('signup endpoint called');
  const { email, username, password, phone_number } = req.body;

  try {
    // Log the input data for debugging purposes
    console.log('Signup Request Body:', req.body);

    // Check if the email already exists
    const selectQuery = 'SELECT * FROM public.users WHERE email = $1';
    const selectParams = [email];

    // Log the query and parameters
    console.log('SQL Query:', selectQuery);
    console.log('SQL Params:', selectParams);

    const result = await query(selectQuery, selectParams);

    if (result.rows.length > 0) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare insert query and parameters with the correct schema name
    const insertQuery = `
      INSERT INTO public.users (email, name, password, phone, access_level) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const insertParams = [email, username, hashedPassword, phone_number, 1];  // access_level defaults to 1

    // Log the insert query and parameters
    console.log('Insert SQL Query:', insertQuery);
    console.log('Insert SQL Params:', insertParams);

    const insertResult = await query(insertQuery, insertParams);
    const user = insertResult.rows[0];

    // Log the inserted user data (for debugging purposes)
    console.log('Inserted User:', user);

    res.status(201).json({ message: 'User created! Please check your email for verification (email functionality is now removed).' });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Email Verification Route (JWT Verification Removed)
app.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Decode the token to get user information
    const decoded = jwt.verify(token, secretKey); // Decode JWT token to retrieve user data

    // Use the decoded email from the token for updating the user as verified
    const result = await query('UPDATE public.users SET verified = true WHERE email = $1 RETURNING *', [decoded.email]);

    if (result.rows.length > 0) {
      res.json({ message: 'Email verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid verification token' });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// Sign-In Route (Login Route)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Request body:', req.body);

  try {
    // Check if the user exists
    const result = await query('SELECT * FROM public.users WHERE email = $1', [email]);
    const user = result.rows[0];

    // If no user found, return an error indicating the email does not exist
    if (!user) {
      return res.status(400).json({ message: 'Email does not exist' });
    }

    console.log('User from database:', user);
    // Compare the password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // If the password is invalid, return an error indicating the password is incorrect
      return res.status(400).json({ message: 'Incorrect password' });
    }

    console.log('Password match result:', isPasswordValid);

    console.log('User location:', user.location); // Log location field

    // Generate JWT token if email and password are correct
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, phone: user.phone, access_level: user.access_level },
      secretKey,
      { expiresIn: '1h' }
    );

    // Get the user's location from the database
    const location = user.location || "Unknown location"; // Set default value if location is null
    console.log('Location to be sent:', location); // Log the location that will be sent
    
    // Send the JWT token, user info, and location data
    res.json({
      message: 'Login successful',
      token,  // Include the token in the response
      user: {
        user_id: user.user_id,
        email: user.email,
        phone: user.phone,
        access_level: user.access_level,
        location: location  // Include location field (could be null)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Test endpoint to verify server is running
app.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Server is running' });
});

// Get User Profile Route
app.get('/api/getUserProfile', async (req, res) => {
  try {
    console.log('getUserProfile endpoint called');
    console.log('Query parameters:', req.query);
    console.log('Headers:', req.headers);

    const { email } = req.query;
    const token = req.headers.authorization?.split(' ')[1];

    console.log('Email from query:', email);
    console.log('Token from headers:', token ? 'Present' : 'Missing');

    // If email is provided, use it to find the user
    if (email) {
      console.log('Fetching profile for email:', email);
      const result = await query(
        'SELECT user_id, name, email, phone, access_level FROM public.users WHERE email = $1',
        [email]
      );

      console.log('Database query result:', result.rows);

      if (result.rows.length === 0) {
        console.log('No user found for email:', email);
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Found user by email:', result.rows[0]);
      return res.json({ user: result.rows[0] });
    }

    // If no email provided, use token to get user profile
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Get user profile from the database using the decoded user_id
    const result = await query(
      'SELECT user_id, name, email, phone, access_level FROM public.users WHERE user_id = $1',
      [decoded.user_id]
    );

    console.log('Database query result for user_id:', result.rows);

    if (result.rows.length === 0) {
      console.log('No user found for user_id:', decoded.user_id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Send user profile data
    console.log('Sending user profile:', result.rows[0]);
    res.json({ user: result.rows[0] });

  } catch (err) {
    console.error('Error in getUserProfile:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get User Profile by Email
app.get('/users/profile', async (req, res) => {
  try {
    const { email } = req.query;
    console.log('Fetching profile for email:', email);
    
    if (!email) {
      console.log('Email is missing from request');
      return res.status(400).json({ message: 'Email is required' });
    }

    // Get user profile from the database using the email
    const result = await query(
      'SELECT user_id, name, email, phone, access_level FROM public.users WHERE email = $1',
      [email]
    );

    console.log('Query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('No user found for email:', email);
      return res.status(404).json({ message: 'User not found' });
    }

    // Send user profile data
    console.log('Sending user profile:', result.rows[0]);
    res.json({ user: result.rows[0] });

  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Dummy route for extracting keywords (just for demonstration)
app.post("/extract-keywords", (req, res) => {
  console.log('inside extract keywords of server.js');
  const { wishlistItems } = req.body;

  try {
    // Simple keyword extraction in Node.js
    const keywords = {};
    const commonWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'want', 'one', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could']);

    wishlistItems.forEach(item => {
      if (!item) return;
      
      // Split into words and clean them
      const words = item.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter(word => 
          word.length > 3 && // Keep words longer than 3 characters
          !commonWords.has(word) // Remove common words
        );
      
      keywords[item] = words;
    });

    console.log("extracted keywords are: ", keywords);
    res.json({ keywords });
  } catch (error) {
    console.error("Error extracting keywords:", error);
    res.status(500).json({ error: "Failed to process data" });
  }
});

app.put('/updateLocation/:userId', async (req, res) => {
  const { location } = req.body;  // Get the new location from the request body
  const { userId } = req.params;  // Get the userId from the URL parameter

  try {
    // Check if location is provided
    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }


    // Update the user's location and access level in the database
    const updateQuery = `
      UPDATE public.users 
      SET location = $1, access_level = 2 
      WHERE user_id = $2 
      RETURNING *
    `;
    const updateParams = [location, userId];

    const result = await query(updateQuery, updateParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return updated user data (excluding password)
    res.json({
      message: 'Location and access level updated successfully',
      user: result.rows[0],
    });

  } catch (err) {
    console.error('Error updating location and access level:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/listing', async (req, res) => {
  const { user_id, name, description, price, location, tags, images } = req.body;

  console.log('123');
  try {
    // Check if user exists (optional check)
    const userCheckQuery = 'SELECT * FROM public.users WHERE user_id = $1';
    const userCheckResult = await query(userCheckQuery, [user_id]);

    if (userCheckResult.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Insert the listing into the 'listings' table
    const insertListingQuery = `
      INSERT INTO public.listings (user_id, name, description, price, location) 
      VALUES ($1, $2, $3, $4, $5) RETURNING listing_id
    `;
    const insertListingParams = [user_id, name, description, price, location];
    
    const listingResult = await query(insertListingQuery, insertListingParams);
    const listingId = listingResult.rows[0].listing_id;

    // If there are tags, insert them into the 'listing_tag' table
    if (tags && tags.length > 0) {
      const insertTagsQuery = `
        INSERT INTO public.listing_tag (listing_id, tag_name) 
        VALUES ($1, $2)
      `;
      for (const tag of tags) {
        await query(insertTagsQuery, [listingId, tag]);
      }
    }

    // If there are images, insert them into the 'images' table
    if (images && images.length > 0) {
      const insertImagesQuery = `
        INSERT INTO public.images (listing_id, filename) 
        VALUES ($1, $2)
      `;
      for (const image of images) {
        await query(insertImagesQuery, [listingId, image]);
      }
    }

    // Send success response
    res.status(201).json({ message: 'Listing created successfully', listingId });
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Make sure this route is defined outside of any other route handlers
app.put('/listing/:id', async (req, res) => {
  const listingId = req.params.id;
  const { 
    user_id, 
    name, 
    description, 
    quality, 
    location, 
    category, 
    images, 
    tags, 
    price 
  } = req.body;

  try {
    // First, verify that the listing exists and belongs to the user
    const checkListing = await query(
      'SELECT * FROM listings WHERE listing_id = $1 AND user_id = $2',
      [listingId, user_id]
    );

    if (checkListing.rows.length === 0) {
      return res.status(404).json({ 
        message: 'Listing not found or you do not have permission to update it' 
      });
    }

    // Update the listing details
    const updateResult = await query(
      `UPDATE listings 
       SET name = $1, description = $2, quality = $3, location = $4, 
           category = $5, price = $6
       WHERE listing_id = $7 RETURNING *`,
      [name, description, quality, location, category, price, listingId]
    );

    // Delete existing images for this listing
    await query('DELETE FROM images WHERE listing_id = $1', [listingId]);

    // Insert new images
    if (images && images.length > 0) {
      for (const image of images) {
        await query(
          'INSERT INTO images (listing_id, filename) VALUES ($1, $2)',
          [listingId, image]
        );
      }
    }

    // Delete existing tags for this listing
    await query('DELETE FROM listing_tag WHERE listing_id = $1', [listingId]);

    // Insert new tags
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await query(
          'INSERT INTO listing_tag (listing_id, tag_name) VALUES ($1, $2)',
          [listingId, tag]
        );
      }
    }

    // Fetch the updated listing with its images and tags
    const updatedListing = await query(
      'SELECT * FROM listings WHERE listing_id = $1',
      [listingId]
    );

    const updatedImages = await query(
      'SELECT filename FROM images WHERE listing_id = $1',
      [listingId]
    );

    const updatedTags = await query(
      'SELECT tag_name FROM listing_tag WHERE listing_id = $1',
      [listingId]
    );

    // Combine all data for response
    const responseData = {
      ...updatedListing.rows[0],
      images: updatedImages.rows,
      tags: updatedTags.rows.map(tag => tag.tag_name)
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/listings_with_user_and_images', async (req, res) => {
  console.log('1234');
  try {
      const queryText = `
          SELECT 
              l.listing_id,
              l.name,
              l.description,
              l.price,
              l.location,
              l.created_at,
              u.name AS user_name,
              u.email AS user_email,
              i.filename AS image_filename
          FROM listings l
          JOIN users u ON l.user_id = u.user_id
          LEFT JOIN images i ON l.listing_id = i.listing_id
          ORDER BY l.created_at DESC;
      `;

      
      const result = await query(queryText);

      if (result.rows.length > 0) {
        // Extract the image URL from the filename JSON
        const listingsWithImageUrl = result.rows.map((listing) => {
            if (listing.image_filename) {
                try {
                    // Parse the image_filename JSON and extract the 'url'
                    const image = JSON.parse(listing.image_filename);
                    listing.image_url = image.url.replace(/\\$/, ''); // Remove trailing backslash
                } catch (error) {
                    console.error("Error parsing image filename:", error);
                }
            }
            return listing;
        });

        console.log(listingsWithImageUrl);
        // Return the result with image URLs
        res.json(listingsWithImageUrl);
    } else {
        res.status(404).json({ message: 'No listings found' });
    }
  } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: 'Error fetching listings' });
  }
});




// Add item to wishlist - New endpoint that matches your API call format
app.post('/wishlist', async (req, res) => {
  try {
    const { user_id, item_description } = req.body;
    
    // Extract keywords from item_description (simplified example)
    const keywords = item_description.split(' ')
      .filter(word => word.length > 3)
      .map(word => word.toLowerCase());
    
    // Check if user has a wishlist
    const wishlistResult = await query(
      'SELECT * FROM wishlists WHERE user_id = $1',
      [user_id]
    );
    
    if (wishlistResult.rows.length === 0) {
      // Create a new wishlist with the item
      await query(
        'INSERT INTO wishlists (user_id, products) VALUES ($1, $2)',
        [user_id, [item_description]]
      );
    } else {
      // Add item to existing wishlist
      const currentProducts = wishlistResult.rows[0].products || [];
      
      // Check if item already exists
      if (!currentProducts.includes(item_description)) {
        const updatedProducts = [...currentProducts, item_description];
        
        await query(
          'UPDATE wishlists SET products = $1 WHERE user_id = $2',
          [updatedProducts, user_id]
        );
      }
    }
    
    res.status(201).json({ message: 'Item added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
});

// Get user's wishlist - Keep this endpoint as it matches your API call
app.get('/wishlist/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user has a wishlist
    const wishlistResult = await query(
      'SELECT * FROM wishlists WHERE user_id = $1',
      [userId]
    );
    
    if (wishlistResult.rows.length === 0) {
      // Create a new wishlist for the user
      await query(
        'INSERT INTO wishlists (user_id, products) VALUES ($1, $2)',
        [userId, []]
      );
      
      return res.json({ products: [] });
    }
    
    // Return the existing wishlist
    res.json(wishlistResult.rows[0]);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

// Add item to wishlist
app.post('/wishlist/:userId/add', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { item } = req.body;
    
    if (!item) {
      return res.status(400).json({ message: 'Item name is required' });
    }
    
    // Check if user has a wishlist
    const wishlistResult = await query(
      'SELECT * FROM wishlists WHERE user_id = $1',
      [userId]
    );
    
    if (wishlistResult.rows.length === 0) {
      // Create a new wishlist with the item
      await query(
        'INSERT INTO wishlists (user_id, products) VALUES ($1, $2)',
        [userId, [item]]
      );
    } else {
      // Add item to existing wishlist
      const currentProducts = wishlistResult.rows[0].products || [];
      
      // Check if item already exists
      if (!currentProducts.includes(item)) {
        const updatedProducts = [...currentProducts, item];
        
        await query(
          'UPDATE wishlists SET products = $1 WHERE user_id = $2',
          [updatedProducts, userId]
        );
      }
    }
    
    res.status(201).json({ message: 'Item added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Error adding to wishlist' });
  }
});

// Remove item from wishlist
app.delete('/wishlist/:userId/remove', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { item } = req.body;
    
    if (!item) {
      return res.status(400).json({ message: 'Item name is required' });
    }
    
    // Get current wishlist
    const wishlistResult = await query(
      'SELECT * FROM wishlists WHERE user_id = $1',
      [userId]
    );
    
    if (wishlistResult.rows.length === 0) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Remove item from products array
    const currentProducts = wishlistResult.rows[0].products || [];
    const updatedProducts = currentProducts.filter(product => product !== item);
    
    // Update wishlist
    await query(
      'UPDATE wishlists SET products = $1 WHERE user_id = $2',
      [updatedProducts, userId]
    );
    
    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Error removing from wishlist' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join_room', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);
  });

  socket.on('leave_room', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User left room: ${conversationId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { conversationId, content, senderId } = data;
      
      // Save message to database
      const result = await query(
        'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
        [conversationId, senderId, content]
      );

      const message = result.rows[0];
      
      // Broadcast message to all clients in the conversation room
      io.to(conversationId).emit('receive_message', message);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Error saving message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Listen on the specified port
// At the bottom of your server.js file
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Add this temporary route to test if the endpoint is accessible
app.get('/listing/:id', async (req, res) => {
  res.status(200).json({ message: 'Endpoint is accessible', id: req.params.id });
});

// Create a new conversation
app.post('/api/conversations', async (req, res) => {
  try {
    const { seller_id, buyer_id } = req.body;
    console.log('Received conversation creation request:', { seller_id, buyer_id });

    // Validate required fields
    if (!seller_id || !buyer_id) {
      console.log('Missing required fields:', { seller_id, buyer_id });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if users exist
    const sellerCheck = await query(
      'SELECT * FROM users WHERE user_id = $1',
      [seller_id]
    );
    console.log('Seller check result:', sellerCheck.rows);

    const buyerCheck = await query(
      'SELECT * FROM users WHERE user_id = $1',
      [buyer_id]
    );
    console.log('Buyer check result:', buyerCheck.rows);

    if (sellerCheck.rows.length === 0 || buyerCheck.rows.length === 0) {
      console.log('User not found:', { seller_id, buyer_id });
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if conversation already exists
    const existingConversation = await query(
      'SELECT * FROM conversations WHERE seller_id = $1 AND buyer_id = $2',
      [seller_id, buyer_id]
    );
    console.log('Existing conversation check:', existingConversation.rows);

    if (existingConversation.rows.length > 0) {
      console.log('Found existing conversation:', existingConversation.rows[0]);
      return res.json(existingConversation.rows[0]);
    }

    // Create new conversation
    const result = await query(
      'INSERT INTO conversations (seller_id, buyer_id) VALUES ($1, $2) RETURNING *',
      [seller_id, buyer_id]
    );

    console.log('Created new conversation:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating conversation:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error creating conversation', error: error.message });
  }
});

// Get all conversations for a user
app.get('/api/conversations', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;

    const result = await query(
      `SELECT c.*, 
              u1.name as seller_name,
              u1.user_id as seller_id,
              u2.name as buyer_name,
              u2.user_id as buyer_id
       FROM conversations c
       JOIN users u1 ON c.seller_id = u1.user_id
       JOIN users u2 ON c.buyer_id = u2.user_id
       WHERE c.seller_id = $1 OR c.buyer_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// Get messages for a conversation
app.get('/api/messages/:conversationId', async (req, res) => {
  try {
    console.log('Received GET request to /api/messages/:conversationId');
    console.log('Conversation ID:', req.params.conversationId);
    console.log('Request headers:', req.headers);

    const { conversationId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user_id;
    console.log('Decoded user ID:', userId);

    // Verify user is part of the conversation
    const conversationCheck = await query(
      'SELECT * FROM conversations WHERE conversation_id = $1 AND (seller_id = $2 OR buyer_id = $2)',
      [conversationId, userId]
    );

    console.log('Conversation check result:', conversationCheck.rows);

    if (conversationCheck.rows.length === 0) {
      console.log('User not authorized to view these messages');
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const result = await query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );

    console.log('Found messages:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Create a new message
app.post('/api/messages', async (req, res) => {
  try {
    console.log('Received POST request to /api/messages');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    const { conversationId, content, senderId } = req.body;
    console.log('Extracted data:', { conversationId, content, senderId });

    // Validate required fields
    if (!conversationId || !content || !senderId) {
      console.log('Missing required fields:', { conversationId, content, senderId });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify user is part of the conversation
    const conversationCheck = await query(
      'SELECT * FROM conversations WHERE conversation_id = $1 AND (seller_id = $2 OR buyer_id = $2)',
      [conversationId, senderId]
    );

    console.log('Conversation check result:', conversationCheck.rows);

    if (conversationCheck.rows.length === 0) {
      console.log('User not authorized to send message in this conversation');
      return res.status(403).json({ message: 'Not authorized to send message in this conversation' });
    }

    // Create new message
    const result = await query(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [conversationId, senderId, content]
    );

    console.log('Created new message:', result.rows[0]);
    
    // Emit the message through socket.io
    io.to(conversationId).emit('receive_message', result.rows[0]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating message:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error creating message', error: error.message });
  }
});


