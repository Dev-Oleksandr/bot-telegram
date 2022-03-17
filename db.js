import {Sequelize} from 'sequelize'

export default new Sequelize(
    'telega_bot',
    'postgres',
    'qwerty',
    {
        host: 'localhost',
        port: 5432,
        dialect: "postgres"
    }
)