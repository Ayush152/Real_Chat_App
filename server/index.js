import http from 'http';
import express from 'express';
import socketio from 'socket.io';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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'
});

import { addUser, removeUser, getUser, getUsersInRoom } from './users.js';
import { router } from './router.js'

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);

io.on('connect', (socket) => {
	socket.on('join', ({ name, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, name, room });

		if (error) return callback(error);

		socket.join(user.room);

		socket.emit('message', {
			user: 'admin',
			text: `${user.name}, welcome to room ${user.room}.`,
		});
		socket.broadcast
			.to(user.room)
			.emit('message', { user: 'admin', text: `${user.name} has joined!` });

		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room),
		});

		callback();
	});

	socket.on('sendMessage', (message, callback) => {
		// io.to(user.room).emit('message', { user: user.name, text: message });

		const user = getUser(socket.id);

		// Call OpenAI API to generate response
		openai.chat.completions.create({
			messages: [{ role: "system", content: "You are a helpful assistant." }],
    		model: "babbage-002",
			temperature: 0.7, // Adjust creativity level
			max_tokens: 500, // Adjust response length
		})
		.then((response) => {
			const gptResponse = response.choices[0].message;

			// Broadcast both user message and GPT response
			io.to(user.room).emit('message', { user: user.name, text: message });
			io.to(user.room).emit('message', { user: 'GPT-3', text: gptResponse });

			callback();
		})
		.catch((error) => {
			console.error('OpenAI API error:', error);
			// Handle API errors gracefully (e.g., send error message to user)
			callback();
		});

	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.room).emit('message', {
				user: 'Admin',
				text: `${user.name} has left.`,
			});
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
