// const express = require("express");
import express from 'express';
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ response: "Server is up and running." }).status(200);
});

// router.post('/gpt', async (req, res) => {
//   const { message } = req.body;

//   // Use the OpenAI client to generate a response
//   const gptResponse = await openaiClient.complete({
//     engine: 'text-davinci-003', 
//     prompt: message,
//     max_tokens: 100, 
//   });

//   // Send the GPT-generated response back to the client
//   res.json({ gptResponse: gptResponse.choices[0].text });
// });


export {router};