const app = require("../backend/index"); // Pastikan ini benar
const request = require("supertest");
const { sequelize, Drama, Country, Genre, Actor } = require("../backend/models");
const fetch = require('node-fetch');

describe("Drama Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Membuat database untuk testing
  });

  afterAll(async () => {
    await sequelize.close(); // Menutup koneksi setelah pengujian selesai
  });

  

  test("should create a drama successfully", async () => {
    const country = await Country.create({ id: 1, name: "Indonesia" });

    const drama = await Drama.create({
      title: "Test Drama",
      year: 2024,
      country_id: country.id,
      synopsis: "This is a test drama.",
      availability: "Available",
      link_trailer: "http://example.com/trailer",
    });

    expect(drama).toHaveProperty("id");
    expect(drama.title).toBe("Test Drama");
    expect(drama.year).toBe(2024);
    expect(drama.country_id).toBe(country.id);
  });
  test("should get dramas successfully", async () => {
    const dramas = await Drama.findAll();
    expect(dramas).toHaveLength(1);

  });

  test("should associate drama with genres and actors", async () => {
    const drama = await Drama.create({
      title: "Drama with Actors and Genres",
      year: 2024,
      country_id: 1,
      synopsis: "Drama with associations.",
      availability: "Available",
      link_trailer: "http://example.com/trailer",
    });

    const genre = await Genre.create({ name: "Action" });
    const actor = await Actor.create({ name: "John Doe" });

    await drama.addGenre(genre);
    await drama.addActor(actor);

    const dramaWithAssociations = await Drama.findByPk(drama.id, {
      include: [Genre, Actor],
    });

    expect(dramaWithAssociations.Genres).toHaveLength(1);
    expect(dramaWithAssociations.Actors).toHaveLength(1);
  });

  test("should update a drama successfully", async () => {
    const drama = await Drama.findOne({ where: { title: "Test Drama" } });

    await drama.update({ title: "Updated Drama" });

    const updatedDrama = await Drama.findByPk(drama.id);

    expect(updatedDrama.title).toBe("Updated Drama");
  });

  test("should delete a drama successfully", async () => {
    const drama = await Drama.findOne({ where: { title: "Updated Drama" } });

    await drama.destroy();

    const deletedDrama = await Drama.findByPk(drama.id);

    expect(deletedDrama).toBeNull();
  });
});

describe("Drama API", () => {
  it("should fetch dramas successfully", async () => {
    const res = await fetch('http://localhost:3000/api/dramas');
    expect(res.ok).toBe(true); // Add assertions as needed
  });

  it("should create a drama successfully", async () => {
    const res = await fetch('http://localhost:3000/api/dramas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Drama',
        year: 2024,
        country_id: 1,
        synopsis: 'This is a test drama.',
        availability: 'Available',
        link_trailer: 'http://example.com/trailer',
      }),
    });
    expect(res.ok).toBe(true); // Add assertions as needed
  });

  it("should update a drama successfully", async () => {
    const drama = await Drama.findOne({ where: { title: "Test Drama" } });

    const res = await fetch(`http://localhost:3000/api/dramas/${drama.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Updated Drama',
      }),
    });
    expect(res.ok).toBe(true); // Add assertions as needed
  });
  it("should delete a drama successfully", async () => {
    const drama = await Drama.findOne({ where: { title: "Updated Drama" } });

    const res = await fetch(`http://localhost:3000/api/dramas/${drama.id}`, {
      method: 'DELETE',
    });
    expect(res.ok).toBe(true); // Add assertions as needed
  });

});

describe("Actor Model", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Membuat database untuk testing
  });

  afterAll(async () => {
    await sequelize.close(); // Menutup koneksi setelah pengujian selesai
  });


  test("should create an actor successfully", async () => {
    const actor = await Actor.create({ name: "John Doe" });

    expect(actor).toHaveProperty("id");
    expect(actor.name).toBe("John Doe");
  });

  test("should get actors successfully", async () => {
    const actors = await Actor.findAll();
    expect(actors).toHaveLength(1);
  });

  test("should update an actor successfully", async () => {
    const actor = await Actor.findOne({ where: { name: "John Doe" } });

    await actor.update({ name: "Jane Doe" });

    const updatedActor = await Actor.findByPk(actor.id);

    expect(updatedActor.name).toBe("Jane Doe");
  });

  test("should delete an actor successfully", async () => {
    const actor = await Actor.findOne({ where: { name: "Jane Doe" } });

    await actor.destroy();

    const deletedActor = await Actor.findByPk(actor.id);

    expect(deletedActor).toBeNull();
  });
});

describe("Actor API", () => {
  it("should fetch actors successfully", async () => {
    const res = await fetch('http://localhost:3000/api/actors');
    expect(res.ok).toBe(true); // Add assertions as needed
  });

  it("should create an actor successfully", async () => {
    const res = await fetch('http://localhost:3000/api/actors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'John Doe',
      }),
    });
    expect(res.ok).toBe(true); // Add assertions as needed
  });

  it("should update an actor successfully", async () => {
    const actor = await Actor.findOne({ where: { name: "John Doe" } });

    const res = await fetch(`http://localhost:3000/api/actors/${actor.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Jane Doe',
      }),
    });
    expect(res.ok).toBe(true); // Add assertions as needed
  });
  it("should delete an actor successfully", async () => {
    const actor = await Actor.findOne({ where: { name: "Jane Doe" } });

    const res = await fetch(`http://localhost:3000/api/actors/${actor.id}`, {
      method: 'DELETE',
    });
    expect(res.ok).toBe(true); // Add assertions as needed
  });
});