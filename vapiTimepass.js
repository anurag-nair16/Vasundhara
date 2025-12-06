import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import axios from "axios";

const app = express();
const PORT = 8002;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---------------------
// Create /logs folder
// ---------------------
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
  console.log("📁 Created logs folder");
}

// ---------------------
// WEBHOOK ENDPOINT
// ---------------------
app.post("/vapi/webhook", async (req, res) => {
  try {
    const message = req.body.message;
    if (!message) return res.status(200).send("ok");

    const eventType = message.type;
    console.log("🔔 Event:", eventType);

    // =====================================================
    // HANDLE END-OF-CALL REPORT (final structured output)
    // =====================================================
    if (eventType === "end-of-call-report") {
      const artifact = message.artifact;
      const analysis = message.analysis;

      let finalOutput = null;

      // 1️⃣ Preferred: artifact.structuredOutputs
      if (artifact?.structuredOutputs?.length > 0) {
        finalOutput = artifact.structuredOutputs[0]?.arguments;
        console.log("✨ Structured Output (artifact):", finalOutput);
      }
      // 2️⃣ Fallback: analysis.structuredData
      else if (analysis?.structuredData) {
        finalOutput = analysis.structuredData;
        console.log("✨ Structured Output (analysis):", finalOutput);
      }

      // No structured output found
      if (!finalOutput) {
        console.log("⚠️ No structured output found.");
        return res.status(200).json({ success: true });
      }

      // ---------------------------
      // Save structured output locally
      // ---------------------------
      const filename = `structured_output_${Date.now()}.json`;
      const filepath = path.join(logsDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(finalOutput, null, 2));
      console.log(`💾 Saved structured output → ${filepath}`);

      // ---------------------------
      // MAP TO DJANGO EXPECTED FIELDS
      // ---------------------------
      const mapped = {
        issue: finalOutput["Issue Category"],
        description: finalOutput["Issue Description"],
        name: finalOutput["Caller Name"],
        phone: finalOutput["Mobile Number"],
        address: finalOutput["Address"]
      };

      console.log("📤 Sending to Django:", mapped);

      // ---------------------------
      // Send to Django
      // ---------------------------
      try {
        await axios.post(
          "http://localhost:8000/api/save-issue/",
          mapped,
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("📨 Sent structured output to Django successfully!");
      } catch (err) {
        console.error("❌ Django error:", err.response?.data || err.message);
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ Webhook Processing Errosr:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ---------------------
// START SERVER
// ---------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
