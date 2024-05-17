import swaggerAutogen from "swagger-autogen";
import { configDotenv } from "dotenv";

configDotenv();

const port = process.env.API_PORT || 3000;
const hostname = process.env.API_HOST || "localhost";

const doc = {
  info: {
    title: "GPT Crawler API",
    description: "GPT Crawler",
  },
  host: `${hostname}:${port}`,
};

const outputFile = "swagger-output.json";
const routes = ["./src/server.ts"];

swaggerAutogen()(outputFile, routes, doc);
