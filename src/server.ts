import { createApp } from "./app.js";
import { config } from "./config/index.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`Levana Life Sciences server running on port ${config.port} [${config.env}]`);
  console.log(`Storefront: http://localhost:${config.port}`);
  console.log(`API Health: http://localhost:${config.port}/api/health`);
});
