import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose"
import { Base } from "@typegoose/typegoose/lib/defaultClasses"

export enum Platform {
	IOS = 1,
	ANDROID = 2,
	ALL = 3,
}

@modelOptions({
	schemaOptions: {
		collection: "server_notice_jobs",
	},
})
export class ServerNoticeJob extends Base {
	id!: string

	@prop({ required: true, default: new Date() })
	startAt!: Date

	@prop({ required: true })
	platform!: string

	@prop({ required: true })
	notice!: string
}

export const ServerNoticeJobModel = getModelForClass(ServerNoticeJob)
