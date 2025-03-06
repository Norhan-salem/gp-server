import express from "express";
import routes from "./routes.mjs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.get("/ping", (_req, res) => {
  res.end("pong");
});

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log("Server is running on port :", port);
});