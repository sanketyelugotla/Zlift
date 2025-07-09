const mongoose = require("mongoose")

const connectDB = async () => {
    const maxRetries = 5
    let retries = 0

    while (retries < maxRetries) {
        try {
            const mongoOptions = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10, // Maintain up to 10 socket connections
                serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
                bufferCommands: false, // Disable mongoose buffering
            }
            await mongoose.connect(process.env.MONGODB_URI, mongoOptions)
            console.log("✅ Connected to MongoDB")

            // Handle connection events
            mongoose.connection.on("error", (err) => {
                console.error("❌ MongoDB connection error:", err)
            })

            mongoose.connection.on("disconnected", () => {
                console.log("⚠️ MongoDB disconnected")
            })

            mongoose.connection.on("reconnected", () => {
                console.log("✅ MongoDB reconnected")
            })

            break
        } catch (error) {
            retries++
            console.error(`❌ MongoDB connection attempt ${retries} failed:`, error.message)

            if (retries === maxRetries) {
                console.error("❌ Max retries reached. Exiting...")
                process.exit(1)
            }

            // Wait before retrying (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000))
        }
    }
}

module.exports = {
    connectDB,
}
