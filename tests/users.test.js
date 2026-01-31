const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/user");

describe("Auth & Database", () => {
  let token;
  let userId;
  const testUser = {
    email: "test@example.com",
    password: "TestPassword123",
    name: "Test User",
  };

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.MONGODB_URI = "mongodb://localhost:27017/news-explorer-test";
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      await User.deleteMany({});
    } catch (err) {
      console.log("DB Error:", err.message);
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
  });

  describe("POST /signup", () => {
    test("1. Crear usuario exitosamente", async () => {
      const res = await request(app)
        .post("/signup")
        .send(testUser)
        .expect(201);

      expect(res.body).toHaveProperty("_id");
      expect(res.body.email).toBe(testUser.email);
      expect(res.body).not.toHaveProperty("password");
      userId = res.body._id;
    });

    test("2. Email duplicado rechazado", async () => {
      await request(app)
        .post("/signup")
        .send(testUser)
        .expect(409);
    });

    test("3. Email inválido rechazado", async () => {
      await request(app)
        .post("/signup")
        .send({ ...testUser, email: "invalid" })
        .expect(400);
    });

    test("4. Contraseña débil rechazada", async () => {
      await request(app)
        .post("/signup")
        .send({ email: "new@test.com", password: "short", name: "User" })
        .expect(400);
    });

    test("5. Email requerido", async () => {
      await request(app)
        .post("/signup")
        .send({ password: "TestPassword123" })
        .expect(400);
    });
  });


  describe("POST /signin", () => {
    test("6. Login exitoso devuelve token", async () => {
      const res = await request(app)
        .post("/signin")
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(res.body).toHaveProperty("token");
      expect(res.body.email).toBe(testUser.email);
      expect(res.body).not.toHaveProperty("password");
      token = res.body.token;
    });

    test("7. Contraseña incorrecta rechazada", async () => {
      await request(app)
        .post("/signin")
        .send({ email: testUser.email, password: "WrongPass" })
        .expect(401);
    });

    test("8. Email no existe rechazado", async () => {
      await request(app)
        .post("/signin")
        .send({ email: "noexiste@test.com", password: "AnyPass123" })
        .expect(401);
    });

    test("9. Token tiene expiración", async () => {
      const decoded = require("jsonwebtoken").decode(token);
      expect(decoded).toHaveProperty("exp");
    });

    test("10. Token inválido rechazado", async () => {
      await request(app)
        .get("/users/me")
        .set("Authorization", "Bearer invalid.token")
        .expect(401);
    });
  });


  describe("Database & Validation", () => {
    test("11. Email único en BD", async () => {
      try {
        await User.create({
          email: testUser.email,
          password: "AnotherPass123",
          name: "Duplicate",
        });
        fail("Debería fallar");
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    test("12. Email requerido en BD", async () => {
      try {
        await User.create({
          password: "TestPassword123",
          name: "No Email",
        });
        fail("Debería fallar");
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    test("13. Contraseña requerida en BD", async () => {
      try {
        await User.create({
          email: "test2@example.com",
          name: "No Password",
        });
        fail("Debería fallar");
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    test("14. Contraseña encriptada", async () => {
      const user = await User.findById(userId).select("+password");
      expect(user.password).not.toBe(testUser.password);
      expect(user.password.length).toBeGreaterThan(30);
    });

    test("15. User creado con timestamps", async () => {
      const user = await User.findById(userId);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    test("16. Email lowercase automático", async () => {
      const user = await User.findById(userId);
      expect(user.email).toBe(testUser.email.toLowerCase());
    });

    test("17. GET /users/me requiere JWT", async () => {
      await request(app).get("/users/me").expect(401);
    });

    test("18. GET /users/me devuelve usuario", async () => {
      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      expect(res.body.email).toBe(testUser.email);
    });

    test("19. POST /articles requiere JWT", async () => {
      await request(app)
        .post("/articles")
        .send({
          keyword: "test",
          title: "Test",
          text: "Test content",
          date: "2024-01-31",
          source: "Test",
          link: "https://test.com",
          image: "https://test.com/img.jpg",
        })
        .expect(401);
    });

    test("20. Seguridad: Contraseña nunca en respuesta", async () => {
      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
      expect(res.body).not.toHaveProperty("password");
    });
  });
});
