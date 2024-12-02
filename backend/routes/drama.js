// routes/drama.js
const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const { multerUploads, uploadToCloudinary } = require("../midleware/upload");
const authenticateToken = require("../midleware/authMiddleware");
const {
  Drama,
  Actor,
  Genre,
  ActorDrama,
  GenreDrama,
  Country,
  Award,
  User,
  AwardDrama,
  Comment,
  Bookmark,
} = require("../models"); // Sesuaikan dengan model

// GET /api/dramas - Ambil semua drama beserta aktor dan genre terkait
router.get("/test", async (req, res) => {
  try {
    res.json({ message: "Hello World" });
  } catch (error) {
    console.error("Error in /api/test:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/dramas", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    // Parse sort parameter
    const sortParam = req.query.sort || "";
    let order = [];

    if (sortParam) {
      const [field, direction] = sortParam.split("_");
      const allowedFields = ["title", "year"];
      const allowedDirections = ["asc", "desc"];

      if (
        allowedFields.includes(field.toLowerCase()) &&
        allowedDirections.includes(direction.toLowerCase())
      ) {
        order.push([field, direction.toUpperCase()]);
      }
    }

    // Cari drama dengan pagination dan sorting
    const { rows: dramas, count } = await Drama.findAndCountAll({
      limit,
      offset,
      order: [
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
      include: [
        {
          model: Genre,
          through: GenreDrama,
          attributes: ["id", "name"], // Genre terkait
        },
        {
          model: Award,
          through: AwardDrama,
          attributes: ["id", "name", "year"],
        },
        {
          model: Actor,
          through: ActorDrama,
          attributes: ["id", "name", "photo"],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);
    const adjustedTotalPages = totalPages > 13 ? 13 : totalPages;
    res.json({
      dramas,
      totalItems: count,
      currentPage: page,
      totalPages: adjustedTotalPages,
    });
  } catch (error) {
    console.error("Error fetching dramas:", error);
    res.status(500).json({ message: "Failed to fetch dramas" });
  }
});

router.get("/dramas2", async (req, res) => {
  try {
    // Cari drama dengan pagination
    const dramas = await Drama.findAll({
      include: [
        {
          model: Genre,
          through: GenreDrama,
          attributes: ["id", "name"], // Genre terkait
        },
        {
          model: Award,
          through: AwardDrama,
          attributes: ["id", "name"],
        },
        {
          model: Actor,
          through: ActorDrama,
          attributes: ["id", "name"],
        },
      ],
    });

    res.json(dramas);
  } catch (error) {
    console.error("Error fetching dramas:", error);
    res.status(500).json({ message: "Failed to fetch dramas" });
  }
});

router.get("/latest-dramas", async (req, res) => {
  try {
    const dramas = await Drama.findAll({
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json(dramas);
  } catch (error) {
    console.error("Error fetching dramas:", error);
    res.status(500).json({ message: "Failed to fetch dramas" });
  }
});


router.post("/dramas", multerUploads, uploadToCloudinary, async (req, res) => {
  try {
    const {
      title,
      alt_title,
      year,
      country_id,
      synopsis,
      availability,
      link_trailer,
      awards,
      genres,
      actors,
    } = req.body;

    const poster = req.body.photo;

    const newDrama = await Drama.create({
      title,
      alt_title,
      year,
      country_id,
      synopsis,
      availability,
      link_trailer,
      poster,
    });

    if (newDrama && awards) {
      // Pastikan `awards` selalu berupa array
      const awardsArray = JSON.parse(awards);

      // Hanya eksekusi jika awardsArray berisi setidaknya satu elemen yang valid
      if (awardsArray.length > 0) {
        await Promise.all(
          awardsArray.map(async (award_id) => {
            await AwardDrama.create({
              award_id,
              drama_id: newDrama.id,
            });
          })
        );
      }
    }

    if (newDrama && genres) {
      const genresArray = JSON.parse(genres);
      if (genresArray.length > 0) {
        await Promise.all(
          genresArray.map(async (genre_id) => {
            await GenreDrama.create({
              genre_id,
              drama_id: newDrama.id,
            });
          })
        );
      }
    }

    if (newDrama && actors) {
      const actorsArray = JSON.parse(actors);
      if (actorsArray.length > 0) {
        await Promise.all(
          actorsArray.map(async (actor_id) => {
            await ActorDrama.create({
              actor_id,
              drama_id: newDrama.id,
            });
          })
        );
      }
    }

    res.status(201).json(newDrama);
  } catch (error) {
    console.error("Error adding drama:", error);
    res.status(500).json({ message: "Failed to add drama" });
  }
});

router.put("/dramas/:id", multerUploads, uploadToCloudinary, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      alt_title,
      year,
      country_id,
      synopsis,
      availability,
      link_trailer,
      awards,
      genres,
      actors,
    } = req.body;

    const poster = req.body.photo;

    const drama = await Drama.findByPk(id);
    if (!drama) {
      return res.status(404).json({ message: "Drama not found" });
    }

    await AwardDrama.destroy({ where: { drama_id: id } });
    await GenreDrama.destroy({ where: { drama_id: id } });
    await ActorDrama.destroy({ where: { drama_id: id } });

    drama.title = title;
    drama.alt_title = alt_title;
    drama.year = year;
    drama.country_id = country_id;
    drama.synopsis = synopsis;
    drama.availability = availability;
    drama.link_trailer = link_trailer;
    drama.poster = poster;

    await drama.save();

    // console.log(awards, genres, actors);
    // Hapus semua award, genre, dan actor terkait

    if (drama && awards) {
      // Pastikan `awards` selalu berupa array
      const awardsArray = JSON.parse(awards);
      // Hanya eksekusi jika awardsArray berisi setidaknya satu elemen yang valid
      if (awardsArray.length > 0) {
        await Promise.all(
          awardsArray.map(async (award_id) => {
            await AwardDrama.create({
              award_id,
              drama_id: drama.id,
            });
          })
        );
      }
    }

    if (drama && genres) {
      const genresArray = JSON.parse(genres)
      if (genresArray.length > 0) {
        await Promise.all(
          genresArray.map(async (genre_id) => {
            await GenreDrama.create({
              genre_id,
              drama_id: drama.id,
            });
          })
        );
      }
    }

    if (drama && actors) {
      const actorsArray = JSON.parse(actors)
      if (actorsArray.length > 0) {
        await Promise.all(
          actorsArray.map(async (actor_id) => {
            await ActorDrama.create({
              actor_id,
              drama_id: drama.id,
            });
          })
        );
      }
    }
    res.json(drama);
  } catch (error) {
    console.error("Error updating drama:", error);
    res.status(500).json({ message: "Failed to update drama" });
  }
});

router.get("/drama/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const drama = await Drama.findByPk(id, {
      include: [
        {
          model: Genre,
          through: GenreDrama,
          attributes: ["id", "name"],
          required: false, // Tetap return meskipun Genre tidak ada
        },
        {
          model: Actor,
          through: ActorDrama,
          attributes: ["id", "name", "photo"],
          required: false, // Tetap return meskipun Actor tidak ada
        },
        {
          model: Award,
          through: AwardDrama,
          attributes: ["id", "name", "year"],
          required: false, // Tetap return meskipun Award tidak ada
        },
        {
          model: Country,
          attributes: ["id", "name"],
          required: false, // Tetap return meskipun Country tidak ada
        },
        {
          model: Comment,
          where: { status: "Approved" },
          attributes: ["id", "content", "rate"],
          include: [
            {
              model: User,
              attributes: ["id", "username"],
            },
          ],
          required: false, // Tetap return meskipun Comment tidak ada
        },
      ],
    });
    if (!drama) {
      return res.status(404).json({ message: "Drama not found" });
    }
    res.json(drama);
  } catch (error) {
    console.error("Error fetching drama:", error);
    res.status(500).json({ message: "Failed to fetching drama" });
  }
});

router.delete("/dramas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const drama = await Drama.findByPk(id);
    if (!drama) {
      return res.status(404).json({ message: "Drama not found" });
    }
    await drama.destroy();
    res.json({ message: "Drama deleted successfully" });
  } catch (error) {
    console.error("Error deleting drama:", error);
    res.status(500).json({ message: "Failed to delete drama" });
  }
});

router.put("/update-drama-status", async (req, res) => {
  const { drama_id, status } = req.body;

  try {
    await Drama.update({ status: status }, { where: { id: drama_id } });
    res.status(200).json({ message: "Status updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update status." });
  }
});

router.get("/countries", async (req, res) => {
  const { page, limit } = req.query;

  const pageNumber = parseInt(page, 10) || 1; // Halaman saat ini
  const limitNumber = parseInt(limit, 10) || 10; // Jumlah item per halaman
  const offset = (pageNumber - 1) * limitNumber; // Hitung offset untuk pagination

  try {
    const { count, rows: countries } = await Country.findAndCountAll({
      attributes: ["id", "name", "createdAt", "updatedAt"], // Tambahkan createdAt dan updatedAt
      limit: limitNumber,
      offset,
      order: [
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json({
      totalItems: count, // Total item di database
      totalPages: Math.ceil(count / limitNumber), // Total halaman
      currentPage: pageNumber, // Halaman saat ini
      countries, // Data Country
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: "Failed to fetch countries" });
  }
});

// POST /api/countries - Tambah negara baru
router.post(
  "/countries",
  [check("name").not().isEmpty().withMessage("Country name is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name } = req.body;
      const newCountry = await Country.create({ name });
      res.status(201).json(newCountry);
    } catch (error) {
      console.error("Error adding country:", error);
      res.status(500).json({ message: "Failed to add country" });
    }
  }
);

// PUT /api/countries/:id - Edit negara berdasarkan ID
router.put("/countries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const country = await Country.findByPk(id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    country.name = name;
    await country.save();

    res.json(country);
  } catch (error) {
    console.error("Error updating country:", error);
    res.status(500).json({ message: "Failed to update country" });
  }
});

// DELETE /api/countries/:id - Hapus negara berdasarkan ID
router.delete("/countries/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const country = await Country.findByPk(id);
    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    await country.destroy();
    res.json({ message: "Country deleted successfully" });
  } catch (error) {
    console.error("Error deleting country:", error);
    res.status(500).json({ message: "Failed to delete country" });
  }
});

// GENRES
// GET /api/genres - Ambil semua genre dengan pagination
router.get("/genres", async (req, res) => {
  const { page, limit } = req.query;

  const pageNumber = parseInt(page, 10) || 1; // Halaman saat ini
  const limitNumber = parseInt(limit, 10) || 10; // Jumlah item per halaman
  const offset = (pageNumber - 1) * limitNumber; // Hitung offset untuk pagination

  try {
    const { count, rows: genres } = await Genre.findAndCountAll({
      attributes: ["id", "name", "createdAt", "updatedAt"],
      limit: limitNumber,
      offset,
      order: [
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json({
      totalItems: count, // Total item di database
      totalPages: Math.ceil(count / limitNumber), // Total halaman
      currentPage: pageNumber, // Halaman saat ini
      genres, // Data genre
    });
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({ message: "Failed to fetch genres" });
  }
});

// POST /api/genres - Tambah genre baru
router.post(
  "/genres",
  [check("name").not().isEmpty().withMessage("Genre name is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name } = req.body;
      const newGenre = await Genre.create({ name });
      res.status(201).json(newGenre);
    } catch (error) {
      console.error("Error adding genre:", error);
      res.status(500).json({ message: "Failed to add genre" });
    }
  }
);

router.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "username"],
        },
        {
          model: Drama,
          attributes: ["id", "title"],
        },
      ],
      order: [
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

router.post("/comment", async (req, res) => {
  try {
    const { rating, comment, user, drama } = req.body;

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ error: "Rating and comment are required." });
    }

    // Save the comment to the database (adjust this according to your database setup)
    const newComment = await Comment.create({
      rate: rating,
      content: comment,
      user_id: user,
      drama_id: drama,
      // Add any other fields you might have, like userId, movieId, etc.
    });

    res.status(201).json(newComment); // Return the saved comment
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/update-status", async (req, res) => {
  const { commentIds, newStatus } = req.body;

  if (!Array.isArray(commentIds) || typeof newStatus !== "string") {
    return res.status(400).json({ message: "Invalid data format." });
  }

  try {
    await Comment.update({ status: newStatus }, { where: { id: commentIds } });
    res.status(200).json({ message: "Status updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update status." });
  }
});

// PUT /api/genres/:id - Edit genre berdasarkan ID
router.put("/genres/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const genre = await Genre.findByPk(id);
    if (!genre) {
      return res.status(404).json({ message: "Genre not found" });
    }

    genre.name = name;
    await genre.save();

    res.json(genre);
  } catch (error) {
    console.error("Error updating genre:", error);
    res.status(500).json({ message: "Failed to update genre" });
  }
});

// DELETE /api/genres/:id - Hapus genre berdasarkan ID
router.delete("/genres/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const genre = await Genre.findByPk(id);
    if (!genre) {
      return res.status(404).json({ message: "Genre not found" });
    }

    await genre.destroy();
    res.json({ message: "Genre deleted successfully" });
  } catch (error) {
    console.error("Error deleting genre:", error);
    res.status(500).json({ message: "Failed to delete genre" });
  }
});

// AWARD
// GET /api/awards - Ambil semua award beserta negara terkait
router.get("/awards", async (req, res) => {
  try {
    const awards = await Award.findAll({
      order: [
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
    res.json(awards);
  } catch (error) {
    console.error("Error fetching awards:", error);
    res.status(500).json({ message: "Failed to fetch awards" });
  }
});

// POST /api/awards - Tambah award baru
router.post(
  "/awards",
  [
    check("name").not().isEmpty().withMessage("Award name is required"),
    check("year").isInt().withMessage("Year must be a valid integer"),
    check("country_id")
      .isInt()
      .withMessage("Country ID must be a valid integer"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, year, country_id } = req.body;
      const newAward = await Award.create({ name, year, country_id });
      res.status(201).json(newAward);
    } catch (error) {
      console.error("Error adding award:", error);
      res.status(500).json({ message: "Failed to add award" });
    }
  }
);

// PUT /api/awards/:id - Edit award berdasarkan ID
router.put("/awards/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, year, country_id } = req.body;

    const award = await Award.findByPk(id);
    if (!award) {
      return res.status(404).json({ message: "Award not found" });
    }

    award.name = name;
    award.year = year;
    award.country_id = country_id;
    await award.save();

    res.json(award);
  } catch (error) {
    console.error("Error updating award:", error);
    res.status(500).json({ message: "Failed to update award" });
  }
});

// DELETE /api/awards/:id - Hapus award berdasarkan ID
router.delete("/awards/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const award = await Award.findByPk(id);
    if (!award) {
      return res.status(404).json({ message: "Award not found" });
    }

    await award.destroy();
    res.json({ message: "Award deleted successfully" });
  } catch (error) {
    console.error("Error deleting award:", error);
    res.status(500).json({ message: "Failed to delete award" });
  }
});

// GET /api/users - Ambil semua user
router.get("/users", async (req, res) => {
  const { page, limit } = req.query;

  const pageNumber = parseInt(page, 10) || 1; // Halaman saat ini
  const limitNumber = parseInt(limit, 10) || 10; // Jumlah item per halaman
  const offset = (pageNumber - 1) * limitNumber; // Hitung offset untuk pagination

  try {
    const { count, rows: users } = await User.findAndCountAll({
      attributes: ["id", "username", "email", "role", "is_suspended"],
      limit: limitNumber,
      offset,
      order: [
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json({
      totalItems: count, // Total item di database
      totalPages: Math.ceil(count / limitNumber), // Total halaman
      currentPage: pageNumber, // Halaman saat ini
      users, // Data users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Suspend User
router.put("/users/:id/suspend", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.is_suspended = true;
    await user.save();

    res.json({ message: "User has been suspended successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Activate User
router.put("/users/:id/activate", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.is_suspended = false;
    await user.save();

    res.json({ message: "User has been activated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users - Tambah user baru
router.post(
  "/users",
  [
    check("username").not().isEmpty().withMessage("Username is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("role").not().isEmpty().withMessage("Role is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, role } = req.body;
      const newUser = await User.create({ username, email, role });
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error adding user:", error);
      res.status(500).json({ message: "Failed to add user" });
    }
  }
);

// PUT /api/users/:id - Edit user berdasarkan ID
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username;
    user.email = email;
    user.role = role;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// DELETE /api/users/:id - Hapus user berdasarkan ID
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Actor
// GET /api/actors - Ambil semua actor beserta negara terkait
router.get("/actors", async (req, res) => {
  try {
    const actors = await Actor.findAll({
      order: [
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
    res.json(actors);
  } catch (error) {
    console.error("Error fetching actors:", error);
    res.status(500).json({ message: "Failed to fetch actors" });
  }
});

// POST /api/actors - Tambah actor baru
router.post("/actors", multerUploads, uploadToCloudinary, async (req, res) => {
  try {
    const { name, birth_date, country_id } = req.body;
    const photo = req.body.photo; // This will contain the Cloudinary URL from middleware

    const newActor = await Actor.create({
      name,
      birth_date,
      country_id,
      photo, // Cloudinary URL
    });

    res.status(201).json(newActor);
  } catch (error) {
    console.error("Error adding actor:", error);
    res.status(500).json({ message: "Failed to add actor" });
  }
});

// PUT /api/actors/:id - Edit actor berdasarkan ID
router.put("/actors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, birth_date, country_id } = req.body;

    const actor = await Actor.findByPk(id);
    if (!actor) {
      return res.status(404).json({ message: "Actor not found" });
    }

    actor.name = name;
    actor.birth_date = birth_date;
    actor.country_id = country_id;
    await actor.save();

    res.json(actor);
  } catch (error) {
    console.error("Error updating actor:", error);
    res.status(500).json({ message: "Failed to update actor" });
  }
});

// DELETE /api/actors/:id - Hapus actor berdasarkan ID
router.delete("/actors/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const actor = await Actor.findByPk(id);
    if (!actor) {
      return res.status(404).json({ message: "Actor not found" });
    }

    await actor.destroy();
    res.json({ message: "Actor deleted successfully" });
  } catch (error) {
    console.error("Error deleting actor:", error);
    res.status(500).json({ message: "Failed to delete actor" });
  }
});

// Get all bookmarks for a user
router.get("/bookmarks", authenticateToken, async (req, res) => {
  try {
    const bookmarks = await Bookmark.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Drama,
          include: ["Genres"], // Include genres if needed
        },
      ],
    });
    res.json(bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ message: "Failed to fetch bookmarks" });
  }
});

// Add a bookmark
router.post("/bookmarks", authenticateToken, async (req, res) => {
  try {
    const { drama_id } = req.body;
    const user_id = req.user.id;

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      where: { user_id, drama_id },
    });

    if (existingBookmark) {
      return res.status(400).json({ message: "Drama already bookmarked" });
    }

    const bookmark = await Bookmark.create({
      user_id,
      drama_id,
    });

    res.status(201).json(bookmark);
  } catch (error) {
    console.error("Error adding bookmark:", error);
    res.status(500).json({ message: "Failed to add bookmark" });
  }
});

// Remove a bookmark
router.delete("/bookmarks/:drama_id", authenticateToken, async (req, res) => {
  try {
    const { drama_id } = req.params;
    const user_id = req.user.id;

    const deleted = await Bookmark.destroy({
      where: { user_id, drama_id },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.json({ message: "Bookmark removed successfully" });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({ message: "Failed to remove bookmark" });
  }
});

// Check if a drama is bookmarked
router.get(
  "/bookmarks/check/:drama_id",
  authenticateToken,
  async (req, res) => {
    try {
      const { drama_id } = req.params;
      const user_id = req.user.id;

      const bookmark = await Bookmark.findOne({
        where: { user_id, drama_id },
      });

      res.json({ isBookmarked: !!bookmark });
    } catch (error) {
      console.error("Error checking bookmark:", error);
      res.status(500).json({ message: "Failed to check bookmark status" });
    }
  }
);

module.exports = router;
