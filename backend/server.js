const express = require('express');
const cors = require('cors');
const { query } = require('./db');  
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken here
require('dotenv').config();

const app = express();
const port = 3000;

const secretKey = process.env.JWT_SECRET; // Ensure JWT secret is in your .env file

// Middleware setup
// Make sure these lines are at the top of your server.js file
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Sign-Up Route
app.post('/signup', async (req, res) => {
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

// Get User Profile Route
app.get('/getUserProfile', async (req, res) => {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user profile from the database using the decoded user_id
    const result = await query('SELECT user_id, name, email, phone, access_level FROM public.users WHERE user_id = $1', [decoded.user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send user profile data
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

  const pythonScriptPath = path.resolve(__dirname, "..", "hooks", "keyword_extraction.py");
  const pythonProcess = spawn("python", [pythonScriptPath]);

  // Send JSON data to Python script
  pythonProcess.stdin.write(JSON.stringify(wishlistItems));
  pythonProcess.stdin.end();

  let data = "";

  pythonProcess.stdout.on("data", (chunk) => {
    data += chunk.toString();
  });

  pythonProcess.stderr.on("data", (error) => {
    console.error("Error:", error.toString());
  });

  pythonProcess.stdout.on("end", () => {
    try {
      const keywords = JSON.parse(data);
      res.json({ keywords });
      console.log("extracted keywords are: ", keywords);
    } catch (error) {
      res.status(500).json({ error: "Failed to process data" });
    }
  });
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




// Get user's wishlist
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




// Listen on the specified port
// At the bottom of your server.js file
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add this temporary route to test if the endpoint is accessible
app.get('/listing/:id', async (req, res) => {
  res.status(200).json({ message: 'Endpoint is accessible', id: req.params.id });
});


