import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http"; // Needed for setting timeout
import connectDB from "./database/connectDb";
import { PORT } from "./secret";
import rootRoutes from "./routes/index.route";

const app: Express = express();

// Enable CORS - restrict to allowed origins
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : process.env.NODE_ENV === 'production'
    ? ['https://medtrack.com', 'https://www.medtrack.com']
    : ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Secure HTTP headers
app.use(helmet());
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
})

// Large body parser
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use((req, res, next) => {
  if (req.is('multipart/form-data')) {
    next();
  } else {
    express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
  }
});

// API Routes
app.use("/api", rootRoutes);

// Temporary seed route - REMOVE AFTER USE
app.post("/seed-users", async (req, res) => {
  try {
    const bcrypt = await import('bcryptjs');
    const adminModel = (await import('./models/admin.model')).default;
    const fieldAgentModel = (await import('./models/fieldAgent.model')).default;

    const results: string[] = [];

    // Create admin
    const existingAdmin = await adminModel.findOne({ email: 'admin@mail.com' });
    if (!existingAdmin) {
      const hashedAdmin = await bcrypt.default.hash('12345', 10);
      await adminModel.create({ name: 'Admin', email: 'admin@mail.com', password: hashedAdmin });
      results.push('Admin created: admin@mail.com');
    } else {
      results.push('Admin already exists: admin@mail.com');
    }

    // Create field agent
    const existingAgent = await fieldAgentModel.findOne({ email: 'agent@mail.com' });
    if (!existingAgent) {
      const hashedAgent = await bcrypt.default.hash('12345', 10);
      await fieldAgentModel.create({ firstName: 'Field', lastName: 'Agent', email: 'agent@mail.com', password: hashedAgent });
      results.push('Field Agent created: agent@mail.com');
    } else {
      results.push('Field Agent already exists: agent@mail.com');
    }

    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.use("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = (err as any).statusCode || 500;
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
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
