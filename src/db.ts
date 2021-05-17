import { mongoose } from "@typegoose/typegoose"

import config from "./config"

export const listenToDatabaseEvents = (): void => {
	mongoose.connection.on("connecting", () => {
		console.log("Connecting to database")
	})

	mongoose.connection.on("connected", () => {
		console.log("Connected to database")
	})

	mongoose.connection.on("error", (err) => {
		console.error("Mongoose Error: ", err.message)
	})
}

export const connectToDatabase = async (): Promise<void> => {
	try {
		await mongoose.connect(config.MONGO_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
	} catch (err) {
		console.error("Failed connecting to databse", err)
		process.exit(1)
	}
}
