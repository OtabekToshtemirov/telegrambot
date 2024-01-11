require('dotenv').config();
const {Telegraf} = require("telegraf");
const {OpenAI} = require("openai");
const {MongoClient} = require('mongodb');
const {getChat} = require("./Helper/functions");


const uri = process.env.MONGO_DB; // Replace with your MongoDB URI
const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}


// Create an instance of the Telegraf bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Create an instance of the OpenAI API
const openai = new OpenAI({apiKey: process.env.CHAT_API});


bot.start((ctx) => ctx.reply("Salom, mendan istagan narsani so'rasangiz javobini beraman. So'rovni /savol so'zidan keyin yozing. \n\n"));

bot.help((ctx) => {
    ctx.reply(
        "Bu bot sizga istagan narsani so'rasangiz javobini beradi. So'rovni /savol so'zidan keyin yozing. \n\n" + "Bot haqida batafsil ma'lumot uchun /about so'zidan foydalaning."
    );
});


bot.command("savol", async (ctx) => {
    const message = ctx.message.text.replace("/savol", "");
    try {
        // Construct conversation history, potentially incorporating past interactions
        const conversationHistory = [
            {role: "system", content: "You are a helpful assistant. Your creator is a human named Otabek."},
            {role: "user", content: ctx.message.text}, // Use the current user message
        ];

        const completion = await openai.chat.completions.create({
            messages: conversationHistory,
            model: "gpt-3.5-turbo",
        });

        const response = completion.choices[0].message.content;

        // Consider filtering or refining the response based on specific criteria

        ctx.reply(response);
        // save to database
        const database = client.db("telegrambot");
        const collection = database.collection("self");
        const result = {
            message: ctx.message.text,
            response: response,
            date: new Date(),
            user_id: ctx.message.from.id,
            user_name: ctx.message.from.username,
            first_name: ctx.message.from.first_name,
        };
        await collection.insertOne(result);
        console.log(
            result
        );

    } catch (error) {
        // Implement more informative error handling, potentially with retries
        console.error("Xato yuz berdi:", error);
        ctx.reply("Kechirasiz, xato yuz berdi. Iltimos qayta urinib ko'ring.");
    }
});

bot.command("history", async (ctx) => {
    try {
        const database = client.db("telegrambot");
        const collection = database.collection("self");
        const result = await collection.find({user_id: ctx.message.from.id}).toArray();
        if (!result.length) {
            ctx.reply("No history found.");
            return;
        }
        let message = "";
        result.forEach((item) => {
            message += `${item.message} \n ${item.response} \n\n`;
        });
        ctx.reply(message);
    } catch (error) {
        console.error("Error occurred:", error);
        ctx.reply("Sorry, an error occurred. Please try again.");
    }
});

bot.launch().then(connectToDatabase).catch((error) => {
    console.error("Error launching the bot:", error);
});
bot.launch()