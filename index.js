import { serve } from "bun";
import mysql from "mysql2/promise";

const dbConfig = {
  host: "192.168.0.130",
  user: "appuser",
  password: "apppass",
  database: "appdb",
  port: 3306,
};

serve({
  port: 3003,
  hostname: "0.0.0.0",
  fetch: async (req) => {
    const url = new URL(req.url);

    // 🩺 Health check endpoint
    if (req.method === "GET" && url.pathname === "/health") {
      return Response.json({ status: "ok", service: "wisdom-api" });
    }

    const conn = await mysql.createConnection(dbConfig);

    // GET random wisdom
    if (req.method === "GET" && url.pathname === "/") {
      const [rows] = await conn.query(
        "SELECT text FROM wisdom_words ORDER BY RAND() LIMIT 1"
      );
      await conn.end();
      return Response.json(rows[0] || { text: "no data" });
    }

    // GET all
    if (req.method === "GET" && url.pathname === "/all") {
      const [rows] = await conn.query("SELECT * FROM wisdom_words");
      await conn.end();
      return Response.json(rows);
    }

    // POST add
    if (req.method === "POST" && url.pathname === "/add") {
      const body = await req.json();
      if (!body.text) {
        return new Response("Missing 'text' field", { status: 400 });
      }
      await conn.query("INSERT INTO wisdom_words (text) VALUES (?)", [body.text]);
      await conn.end();
      return Response.json({ message: "Added successfully" });
    }

    // PUT edit/:id
    if (req.method === "PUT" && url.pathname.startsWith("/edit/")) {
      const id = url.pathname.split("/")[2];
      const body = await req.json();
      if (!body.text) {
        return new Response("Missing 'text' field", { status: 400 });
      }
      await conn.query("UPDATE wisdom_words SET text=? WHERE id=?", [body.text, id]);
      await conn.end();
      return Response.json({ message: "Updated successfully" });
    }

    // DELETE /delete/:id
    if (req.method === "DELETE" && url.pathname.startsWith("/delete/")) {
      const id = url.pathname.split("/")[2];
      await conn.query("DELETE FROM wisdom_words WHERE id=?", [id]);
      await conn.end();
      return Response.json({ message: "Deleted successfully" });
    }

    await conn.end();
    return new Response("Not found", { status: 404 });
  },
});
