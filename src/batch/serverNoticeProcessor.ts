import { Job } from "bullmq"
import { mongoose } from "@typegoose/typegoose"
import fetch from "node-fetch"

import config from "../config"
import { ServerNoticeQueue } from "./serverNoticeQueue"
import { Platform, ServerNoticeJobModel } from "../models/ServerNotice"

const serverNoticeProcessor = async (
	queue: Job<ServerNoticeQueue>
): Promise<string> => {
	const { jobId, userId } = queue.data

	const adminToken = await getAdminToken()
	if (!adminToken) {
		throw new Error("Failed to get admin's token")
	}

	const job = await getJob(jobId)
	if (!job) {
		throw new Error(`Failed to get job with id ${jobId}`)
	}

	if (getPlatform(job.platform) !== Platform.ALL) {
		const userPlatform = await getUserPlatform(userId, adminToken)
		if (!userPlatform) {
			return
		}

		if (getPlatform(job.platform) !== userPlatform) {
			return
		}
	}

	return await sendNotice(userId, job.notice, adminToken)
}

export async function getAdminToken(): Promise<string | undefined> {
	try {
		const payload = {
			type: "m.login.password",
			identifier: { type: "m.id.user", user: config.MATRIX_ADMIN_ID },
			password: config.MATRIX_ADMIN_PASSWORD,
		}

		const response = await fetch(
			`${config.SYNAPSE_URL}/_matrix/client/r0/login`,
			{
				method: "POST",
				body: JSON.stringify(payload),
				headers: { "Content-Type": "application/json", accept: "*/*" },
			}
		)

		if (response.status === 200) {
			const data = await response.json()

			return data.access_token
		}
	} catch (err) {
		console.error("Failed to get admin token", err.message)
	}
	return undefined
}

async function getJob(jobId: string) {
	return await ServerNoticeJobModel.findOne({
		_id: mongoose.Types.ObjectId(jobId),
	})
}

async function getUserPlatform(userId: string, adminToken: string) {
	try {
		const id = `@${userId}:worqapp.com`

		const response = await fetch(
			`${config.SYNAPSE_URL}/_synapse/admin/v1/users/${id}/pushers?access_token=${adminToken}`,
			{
				method: "GET",
			}
		)

		if (response.status === 200) {
			const data = await response.json()

			const pushers = data.pushers

			if (data.pushers && data.pushers.length > 0) {
				const platform = pushers[0].app_id
				if (platform === "com.nibmeetings.ios") {
					return 1
				} else if (platform === "com.nibmeetings.android") {
					return 2
				}
			}
		}
	} catch (err) {
		console.error("Failed to get user's platform: ", err.message)
	}

	return undefined
}

function getPlatform(platform: string) {
	switch (platform) {
		case "IOS":
			return 1
		case "ANDROID":
			return 2
		case "ALL":
			return 3
		default:
			return undefined
	}
}

export async function sendNotice(
	userId: string,
	notice: string,
	adminToken: string
): Promise<string> {
	try {
		const payload = {
			user_id: `@${userId}:worqapp.com`,
			content: {
				msgtype: "m.text",
				body: notice,
			},
		}

		const response = await fetch(
			`${config.SYNAPSE_URL}/_synapse/admin/v1/send_server_notice?access_token=${adminToken}`,
			{
				method: "POST",
				body: JSON.stringify(payload),
				headers: { "Content-Type": "application/json", accept: "*/*" },
			}
		)

		if (response.status === 200) {
			const data = await response.json()

			return data.event_id
		}
	} catch (err) {
		console.error("Failed to send server notice: ", err.message)
	}

	return undefined
}

export default serverNoticeProcessor
