import TelegramApi from 'node-telegram-bot-api'
import options from "./options.js";

const token = `5267256734:AAECM_TtGHPcHXfRtmDhyUbojmyvtaJR9cw`;

const bot = new TelegramApi(token, {polling: true})

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен его отгадать')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber
    await bot.sendMessage(chatId, `TEST: Бот загадал число ${randomNumber}`)
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = () => {
    bot.setMyCommands([
        {command: '/start', description: "Начальное приветствие"},
        {command: '/info', description: "Получение информации о пользователе"},
        {command: '/game', description: 'Игра "Угадай число"'},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id
        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/d97/c1e/d97c1e8a-943c-37c4-963f-8db69b18db05/7.webp')
            return bot.sendMessage(chatId, `Добро пожаловать в телеграм бот.`)
        }
        if (text === '/info') {
            return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`)
        }
        if (text === '/game') {
            return startGame(chatId)
        }
        return bot.sendMessage(chatId, 'Прости, я тебя не понимаю')
    })

    bot.on('callback_query', msg => {
        const data = msg.data
        const chatId = msg.message.chat.id
        if (data === '/again') {
            return startGame(chatId)
        }
        if (data == chats[chatId]) {
            return bot.sendMessage(chatId, `Поздравляю, вы отгадали цифру: ${chats[chatId]}`, againOptions)
        } else {
            return bot.sendMessage(chatId, `К сожалению вы не угадали, бот загадал число ${chats[chatId]}`, againOptions)
        }
        // bot.sendMessage(chatId, `Ты выбрал кнопку ${data}`)
        // console.log(msg)
    })
}

start();