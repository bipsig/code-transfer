import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const port = 3001;
const mongo_uri = `mongodb+srv://admin:admin@cluster0.eudjrrc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const app = express();
app.use(express.json());

app.use(express.json({ limit: '100mb' })); // Adjust size as needed
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const allowedOrigins = [
  "http://localhost:5173",               // local dev
  "https://crovixa-client.onrender.com"  // hosted frontend
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));




// 1️⃣ Define a schema and model
const fileSchema = new mongoose.Schema({
  filename: String,
  content: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const File = mongoose.model("File", fileSchema);

// 2️⃣ Connect to MongoDB
const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongo_uri);
    console.log("Connected to MongoDB Atlas using Mongoose");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
connectMongoDB();

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});


// 3️⃣ Create/Update endpoint - replaces file if filename exists
app.post("/upload", async (req, res) => {
  try {
    const { filename, content } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ message: "Filename and content are required" });
    }

    // Check if file with same name exists
    const existingFile = await File.findOne({ filename });

    if (existingFile) {
      // Update existing file
      existingFile.content = content;
      existingFile.createdAt = new Date();
      await existingFile.save();
      res.status(200).json({ message: "File updated successfully", file: existingFile });
    } else {
      // Create new file
      const newFile = new File({ filename, content });
      await newFile.save();
      res.status(201).json({ message: "File stored successfully", file: newFile });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error storing file", error: err.message });
  }
});

// 4️⃣ Get all stored files
app.get("/files", async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 }); // Sort by newest first
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching files", error: err.message });
  }
});

// 5️⃣ Get a specific file by ID
app.get("/files/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json(file);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching file", error: err.message });
  }
});

app.get ('/', (req, res) => {
  res.send('Hello World');
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});