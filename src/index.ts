import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Recipe, RecipeDatabase } from "./db";

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "Recipes Documentation",
          version: "1.0.0",
        },
        tags: [
          { name: "App", description: "Recipes endpoints" },
          { name: "Auth", description: "Authentication endpoints" },
        ],
      },
    })
  )
  .decorate("db", new RecipeDatabase())
  .group("/recipe", (app) =>
    app
      .get("/list", ({ db }) => db.getRecipes(), {
        detail: {
          tags: ["App"],
        },
      })
      .get(
        "/:id",
        ({ db, params }) => {
          console.log(params);
          return db.getRecipe(params.id);
        },
        {
          params: t.Object({
            id: t.Numeric(),
          }),
          detail: {
            tags: ["App"],
          },
        }
      )
      .post(
        "/create",
        async ({ db, body }) => {
          console.log(body);
          const id = await db.createRecipe(body as Recipe);
          console.log("create result:", id);
        },
        {
          detail: {
            tags: ["App"],
          },
        }
      )
      .put(
        "/update",
        async ({ db, params, body }) => {
          try {
            console.log(params);
            console.log(body);
            await db.updateRecipe(body as Recipe);
          } catch (e) {
            console.log(e);
          }
        },
        {
          detail: {
            tags: ["App"],
          },
        }
      )
      .delete(
        "/remove:id",
        async ({ db, params }) => {
          try {
            console.log(params);
            await db.deleteRecipe(parseInt(params.id));
          } catch (e) {
            console.log(e);
          }
        },
        {
          detail: {
            tags: ["App"],
          },
        }
      )
  )
  .listen(3000);

app
  .group("/auth", (app) =>
    app
      .get("/profile", () => "Hello Recipes", {
        detail: {
          tags: ["Auth"],
        },
      })
      .post("/sign-up", async ({ body }) => body, {
        detail: {
          tags: ["Auth"],
        },
      })
      .post("/log-in", async ({ body }) => body, {
        detail: {
          tags: ["Auth"],
        },
      })
      .post("/log-out", async ({ body }) => body, {
        detail: {
          tags: ["Auth"],
        },
      })
      .post("/change-password", async ({ body }) => body, {
        detail: {
          tags: ["Auth"],
        },
      })
      .put("/update", async ({ body }) => body, {
        detail: {
          tags: ["Auth"],
        },
      })
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running recipes api at ${app.server?.hostname}:${app.server?.port}`
);
