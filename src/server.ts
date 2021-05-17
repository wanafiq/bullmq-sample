import express from "express"
import { createBullBoard } from "bull-board"

import { listenToDatabaseEvents, connectToDatabase } from "./db"
import { simulateServerNotice } from "./services/serverNotice"

const app = express()
const port = process.env.PORT || 8888

const { router } = createBullBoard([])

app.use("/admin/queue", router)

app.get("/", (req, res) => {
	console.log(`${req.method} - ${req.url}`)
	res.status(200).send({ msg: "Im Alive!" })
})

listenToDatabaseEvents()

app.listen(port, async () => {
	await connectToDatabase()

	console.log(`Server is listening on port ${port}`)

	simulateServerNotice()
})
