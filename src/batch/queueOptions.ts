import { QueueOptions, WorkerOptions } from "bullmq"

import config from "../config"

export const queueOptions: QueueOptions = {
	connection: {
		host: config.REDIS_URL,
		port: parseInt(config.REDIS_PORT),
	},
	defaultJobOptions: {
		attempts: parseInt(config.QUEUE_MAX_FAILED_ATTEMPTS),
		backoff: {
			type: "fixed",
			delay: 1000,
		},
	},
}

export const workerOptions: WorkerOptions = {
	connection: {
		host: config.REDIS_URL,
		port: parseInt(config.REDIS_PORT),
	},
	concurrency: parseInt(config.QUEUE_MAX_WORKER),
}
