import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import {
  mevScanner,
  priceOracle,
  onChainState,
  SUPPORTED_CHAINS,
  SUPPORTED_TOKENS,
  MEV_SHARE_ADDRESSES,
} from "@flasharb/shared";

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// MEV Opportunities - Real-time scanning without database
app.get("/api/opportunities", async (req, res) => {
  try {
    const opportunities = mevScanner.getValidOpportunities();
    res.json({
      success: true,
      data: opportunities,
      count: opportunities.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch opportunities",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get specific opportunity by ID
app.get("/api/opportunities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = mevScanner.getOpportunityById(id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        error: "Opportunity not found",
      });
    }

    res.json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch opportunity",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Token prices across chains
app.get("/api/prices/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { chains } = req.query;

    const chainIds = chains
      ? (chains as string).split(",").map(Number)
      : [11155111, 421614, 84532, 11155420]; // Default to all Sepolia chains

    const priceRequests = chainIds.map((chainId) => ({
      tokenSymbol: token.toUpperCase(),
      chainId,
    }));

    const prices = await priceOracle.getBatchPrices(priceRequests);

    const result = Object.fromEntries(
      chainIds.map((chainId) => [
        chainId,
        prices.get(`${token.toUpperCase()}-${chainId}`),
      ])
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch prices",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// User statistics from on-chain data
app.get("/api/users/:address/stats", async (req, res) => {
  try {
    const { address } = req.params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Ethereum address",
      });
    }

    const stats = await onChainState.getUserStats(address);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: "User stats not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...stats,
        totalEarnings: stats.totalEarnings.toString(), // Convert BigInt to string
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch user stats",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// User execution history from on-chain events
app.get("/api/users/:address/executions", async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = "50" } = req.query;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Ethereum address",
      });
    }

    const executions = onChainState.getUserExecutions(address);
    const limitedExecutions = executions.slice(0, parseInt(limit as string));

    // Convert BigInt values to strings for JSON serialization
    const serializedExecutions = limitedExecutions.map((exec) => ({
      ...exec,
      amountIn: exec.amountIn.toString(),
      actualProfit: exec.actualProfit.toString(),
      userShare: exec.userShare.toString(),
      protocolShare: exec.protocolShare.toString(),
    }));

    res.json({
      success: true,
      data: serializedExecutions,
      count: serializedExecutions.length,
      total: executions.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch user executions",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Protocol statistics
app.get("/api/protocol/stats", async (req, res) => {
  try {
    const stats = onChainState.getProtocolStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch protocol stats",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Recent executions (leaderboard data)
app.get("/api/executions/recent", async (req, res) => {
  try {
    const { limit = "50" } = req.query;
    const executions = onChainState.getRecentExecutions(
      parseInt(limit as string)
    );

    // Convert BigInt values to strings
    const serializedExecutions = executions.map((exec) => ({
      ...exec,
      amountIn: exec.amountIn.toString(),
      actualProfit: exec.actualProfit.toString(),
      userShare: exec.userShare.toString(),
      protocolShare: exec.protocolShare.toString(),
    }));

    res.json({
      success: true,
      data: serializedExecutions,
      count: serializedExecutions.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent executions",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Supported chains and tokens
app.get("/api/config", (req, res) => {
  res.json({
    success: true,
    data: {
      supportedChains: Object.entries(SUPPORTED_CHAINS).map(([id, config]) => ({
        chainId: parseInt(id),
        name: (config as any).name,
        rpc: (config as any).rpc,
      })),
      supportedTokens: Object.entries(SUPPORTED_TOKENS).map(
        ([symbol, config]) => ({
          symbol,
          decimals: (config as any).decimals,
          addresses: (config as any).addresses,
        })
      ),
      mevShareAddresses: MEV_SHARE_ADDRESSES,
    },
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("API Error:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Start server and initialize services
async function startServer() {
  try {
    console.log("🚀 Starting MEV-Share Decentralized API...");

    // Initialize decentralized services
    console.log("🔍 Starting MEV scanner...");
    await mevScanner.startScanning();

    console.log("🔗 Starting on-chain event listening...");
    await onChainState.startEventListening();

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`✅ MEV-Share API running on port ${PORT}`);
      console.log(`📡 Decentralized services active`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Shutting down gracefully...");
  mevScanner.stopScanning();
  onChainState.stopEventListening();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Shutting down gracefully...");
  mevScanner.stopScanning();
  onChainState.stopEventListening();
  process.exit(0);
});

startServer();
