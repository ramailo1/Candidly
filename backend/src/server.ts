// Placeholder server entry
import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('Candidly backend'));
export default app;
