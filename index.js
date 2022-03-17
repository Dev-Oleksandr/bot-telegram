import TelegramApi from 'node-telegram-bot-api'
import options from "./options.js";
import sequelize from "./db.js";
import UserModel from "./model.js";

const token = `5267256734:AAECM_TtGHPcHXfRtmDhyUbojmyvtaJR9cw`;

const bot = new TelegramApi(token, {polling: true})

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен его отгадать')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber
    await bot.sendMessage(chatId, `TEST: Бот загадал число ${randomNumber}`)
    await bot.sendMessage(chatId, 'Отгадывай', options.gameOptions)
}

const start = async() => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log(`Ошибка подключения к БД`)
    }

    bot.setMyCommands([
        {command: '/start', description: "Начальное приветствие"},
        {command: '/info', description: "Получение информации о пользователе"},
        {command: '/game', description: 'Игра "Угадай цифру"'},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id

        try {
            if (text === '/start') {
                await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/d97/c1e/d97c1e8a-943c-37c4-963f-8db69b18db05/7.webp')
                return bot.sendMessage(chatId, `Добро пожаловать в телеграм бот.`)
            }
            if (text === '/info') {
                const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}. В игре правильных ответов: ${user.right}, неправильных: ${user.wrong}`)
            }
            if (text === '/game') {
                return startGame(chatId)
            }
            return bot.sendMessage(chatId, 'Прости, я тебя не понимаю')
        } catch (e) {
            // console.log(e);
            return bot.sendMessage(chatId, 'Произошла какая-то ошибочка')
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id
        if (data === '/again') {
            return startGame(chatId)
        }
        const user = await UserModel.findOne({chatId})
        if (data == chats[chatId]) {
            user.right += 1
            await bot.sendMessage(chatId, `Поздравляю, вы отгадали цифру: ${chats[chatId]}`, options.againOptions)
        } else {
            user.wrong += 1
            await bot.sendMessage(chatId, `К сожалению вы не угадали, бот загадал число ${chats[chatId]}`, options.againOptions)
        }
        await user.save()
    })
}

start();