import { Queue, QueueScheduler, Worker, Job } from "bullmq"
import { createBullBoard } from "bull-board"
import { BullMQAdapter } from "bull-board/bullMQAdapter"

import config from "../config"
import { queueOptions, workerOptions } from "./queueOptions"
import serverNoticeProcessor from "./serverNoticeProcessor"

export interface ServerNoticeQueue {
	jobId: string
	userId: string
}

export const createQueue = (suffix: string): Queue<ServerNoticeQueue> => {
	const queueName = `server-notice:${suffix}`
	const schedulerName = `server-notice-scheduler:${suffix}`

	const queue = new Queue<ServerNoticeQueue>(queueName)

	new QueueScheduler(schedulerName, queueOptions)

	const worker = new Worker(queueName, serverNoticeProcessor, workerOptions)

	addBullBoardAdapter(queue)

	worker.on("failed", (job: Job) => {
		if (job.attemptsMade > parseInt(config.QUEUE_MAX_FAILED_ATTEMPTS)) {
			console.log(`Job id ${job.id} failed. ${job.failedReason}`)

			console.log(`${JSON.stringify(job.data)} \n`)
		}
	})

	return queue
}

function addBullBoardAdapter(queue: Queue) {
	createBullBoard([new BullMQAdapter(queue)])
}
