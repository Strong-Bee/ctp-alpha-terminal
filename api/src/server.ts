import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.API_PORT, env.API_HOST, () => {
  console.log(`CTP Alpha API listening on http://${env.API_HOST}:${env.API_PORT}`);
});