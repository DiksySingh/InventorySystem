require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
//const path = require("path");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const itemRoute = require("./routes/itemRoute");
const authRoute = require("./routes/authRoute");
const transactionRoute = require("./routes/transactionRoute");

const URI = process.env.MONGO_URL;

main()
    .then(()=>{
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use('../uploads/video_proofs', express.static(path.join(__dirname, '..uploads/videos_proofs')));

app.get("/", (req, res) => {
    res.send("Working Fine");
});

app.use("/user", authRoute);
app.use("/admin", itemRoute);
app.use("/admin", transactionRoute);
app.use("/warehouse-admin", itemRoute);
app.use("/warehouse-admin", transactionRoute);
app.use("/service-person", transactionRoute);

app.listen(8080, () => {
    console.log("Server running at port 8080");
});

