import express from 'express';
const PORT = process.env.PORT ?? 3000;

export function startServer() {
  const app = express();
  app.get('/', (req, res) => res.send('Hello world'));
  app.listen(PORT, () => console.log(`Server start on ${PORT} port`));
}