import dotenv from 'dotenv'; // Environment variable management
import express from 'express';
import connectDB from './src/database'; // Your database connection function
import authRoutes from './routes/auth'; // Auth routes
import resumeRoute from './routes/resume'; // Resume routes
import session from 'express-session'; // Session management
import MongoStore from 'connect-mongo'; // ← added for Mongo-backed sessions
import cookieParser from 'cookie-parser'; // Cookie handling
import cors from 'cors'; // CORS handling
import portfolioRoute from "./routes/portfolio";

dotenv.config(); // Load environment variables
connectDB(); // Connect to the database

const app: express.Application = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS setup
app.use(cors({
  origin: process.env.FRONTEND, // Frontend URL (adjust if needed)
  credentials: true, // Allow cookies to be sent and received
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

// Session setup (using MongoStore instead of MemoryStore)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: false, // Don't create sessions unless something is saved
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI!,      // re‑use your DB URI
      collectionName: "sessions",            // optional: name of the collection
      ttl: 24 * 60 * 60,                     // session lifetime in seconds
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // true if HTTPS
      httpOnly: true,                                // protect from JS access
      maxAge: 24 * 60 * 60 * 1000,                   // 1 day in ms
    },
  })
);

// Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/resume", resumeRoute); // Resume-related routes
app.use("/api/portfolio", portfolioRoute);

// Default route
app.get('/', (_req, res) => {
  res.send("TypeScript with Express");
});

// Start the server
const port: number = parseInt(process.env.PORT!); // Use Railway's assigned port
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
