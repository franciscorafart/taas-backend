import mongoose from "mongoose";
import { superAdmin } from "../../tests/fixtures/users";

import {
  createUser,
  findByEmail,
  findUserById,
  updateUser,
} from "../../gateway/user";

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";

const mongoUrl = process.env.MONGO;

beforeAll(async () => {
  await mongoose.connect(mongoUrl, {});
  mongoose.connection.on("error", (err) => {
    console.log("err", err);
  });
  mongoose.connection.on("connected", (err, res) => {
    console.log("mongoose is connected");
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  // TODO: Delete everything
  await createUser(superAdmin);
});

describe("createUser", () => {
  describe("For new user data", () => {
    it("creates a user", async () => {
      const u = await findByEmail("francisco.rafart@gmail.com");

      expect(u.firstName).toBe("Francisco");
      expect(u.lastName).toBe("Rafart");
      expect(u.confirmed).toBe(false);
    });
  });
  describe("for existing user id", () => {
    it("doesn't create users", async () => {
      let u = await findByEmail("francisco.rafart@gmail.com");

      await createUser({
        ...superAdmin,
        id: u.id,
        lastName: "Rafartiano",
        firstName: "Franciscano",
        confirmed: true,
      });

      u = await findByEmail("francisco.rafart@gmail.com");

      expect(u.firstName).toBe("Francisco");
      expect(u.lastName).toBe("Rafart");
      expect(u.confirmed).toBe(false);
    });
  });
  // describe("for same data but different uuid", () => {
  //   it("creates new user", async () => {
  //     await createUser({ ...superAdmin });

  //     const count = await repository.query(`Select count(*) FROM public.user`);

  //     expect(count[0].count).toBe("2");
  //   });
  // });
});

describe("For created user,", () => {
  it("finds user by id", async () => {
    const u = await findUserById(superAdmin.id);
  });
});

describe("updateUser", () => {
  describe("for existing user data", () => {
    it("should update user", async () => {
      let u = await findByEmail("francisco.rafart@gmail.com");

      await updateUser(u, { confirmed: true, lastName: "Rafartiano" });
      u = await findByEmail("francisco.rafart@gmail.com");

      expect(u.confirmed).toBe(true);
      expect(u.lastName).toBe("Rafartiano");
      expect(u.firstName).toBe("Francisco");
    });
  });
});
