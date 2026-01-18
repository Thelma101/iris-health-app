import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import connectDB from "./database/connectDb";
import { PORT } from "./secret";
import rootRoutes from "./routes/index.route";

const app: Express = express();

// CORS configuration - Allow all origins for development
const corsOptions: cors.CorsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Secure HTTP headers (relaxed for development)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));
app.disable('x-powered-by');

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  res.removeHeader('X-Powered-By');
  next();
});

// Large body parser
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    next();
  } else {
    express.json({ limit: '10gb' })(req, res, next);
  }
});
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    next();
  } else {
    express.urlencoded({ extended: true, limit: '10gb' })(req, res, next);
  }
});

// API Routes
app.use("/api", rootRoutes);

// Health check
app.use("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global error handler - ensures JSON responses
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`❌ Error: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler - ensures JSON response for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.url} not found` 
  });
});

// Create HTTP server with extended timeout
const server = http.createServer(app);

// Connect DB and start server
connectDB()
  .then(() => {
    server.listen(PORT || 8080, () => {
      console.log(`✅ Server running at http://localhost:${PORT || 8080}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to DB", err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("🔴 Gracefully shutting down...");
  process.exit(0);
});
