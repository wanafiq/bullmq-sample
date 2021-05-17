import dotenv from "dotenv"

const config = dotenv.config().parsed

if (!config) {
	throw new Error("Env not configure!")
}

if (!config.SYNAPSE_URL) {
	throw new Error("Env is missing SYNAPSE_URL")
}

if (!config.MATRIX_ADMIN_ID) {
	throw new Error("Env is missing MATRIX_ADMIN_ID")
}

if (!config.MATRIX_ADMIN_PASSWORD) {
	throw new Error("Env is missing MATRIX_ADMIN_PASSWORD")
}

if (!config.QUEUE_MAX_WORKER) {
	throw new Error("Env is missing QUEUE_MAX_WORKER")
}

if (!config.QUEUE_MAX_FAILED_ATTEMPTS) {
	throw new Error("Env is missing QUEUE_MAX_FAILED_ATTEMPTS")
}

export default config
