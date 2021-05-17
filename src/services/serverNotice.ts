// import { JobsOptions } from "bullmq"

import usersData from "../usersData"
import { createQueue } from "../batch/serverNoticeQueue"
import { ServerNoticeJob, ServerNoticeJobModel } from "../models/ServerNotice"

// const defaultJobOptions: JobsOptions = {
// 	attempts: 3,
// 	backoff: {
// 		type: "fixed",
// 		delay: 1000,
// 	},
// }

export const simulateServerNotice = async (): Promise<void> => {
	const platform = 1
	const notice = "Test notice"

	const job = await saveJob(platform, notice)
	if (!job) {
		console.error("Failed to save job")
		return
	}

	const queue = createQueue(job.id)

	usersData.users
		.filter(isValidUser)
		.map(toObjectId)
		.forEach(async (userId) => {
			await queue.add("send-notice", {
				jobId: job.id,
				userId,
			})
		})
}

function isValidUser(user) {
	const id = toObjectId(user)

	if (!id) {
		return false
	}

	// mongodb objectid 24 chars
	if (id.length !== 24) {
		return false
	}

	if (user.admin === 1) {
		return false
	}

	return true
}

function toObjectId(user) {
	const id = user.name.split(":")[0].replace("@", "")

	return id
}

async function saveJob(platform: number, notice: string) {
	const data = {
		platform: getPlatform(platform),
		notice,
	} as Omit<ServerNoticeJob, "id">

	return await ServerNoticeJobModel.create(data)
}

function getPlatform(platform: number) {
	switch (platform) {
		case 1:
			return "IOS"
		case 2:
			return "ANDROID"
		case 3:
			return "ALL"
		default:
			return undefined
	}
}
