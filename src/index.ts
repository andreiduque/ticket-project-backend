import Fastify from "fastify";
import { connect } from "v1/config/mongodb";
import "reflect-metadata";
import { setUserController } from "v1/api/user/user.controller";
import { setTicketController } from "v1/api/ticket/ticket.controller";

const PORT = 3000;

const server = async () => {
	if (process.env.NODE_ENV !== "production") {
		const { config } = await import("dotenv");
		config();
	}

	const fastify = Fastify({
		logger: true,
	});

	await connect();

	setUserController(fastify);
	setTicketController(fastify);

	fastify.listen(PORT, err => {
		if (err) throw err;
	});
};

server();
