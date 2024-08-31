import Sequelize from 'sequelize';
import { DATABASE_URL, DB_NAME, DB_PASSWORD, DB_USER, DB_PORT, DB_HOST } from './config';
import { Client } from 'pg';


class Database{
    public connection!: Sequelize.Sequelize;

    constructor(){
        this.connection = new Sequelize.Sequelize(DATABASE_URL);
        this.connectToPostgreSQL();
        this.syncModels();
    }


    private async connectToPostgreSQL(): Promise<void> {        
        try{            
            await this.createDatabaseIfNotExists();        
        
            await this.connection.authenticate();
            console.log("✅ PostgreSQL Connection has been established successfully.");
        }catch(error){
            console.error("❌ Unable to connect to the PostgreSQL database:", error);
        }
    }

    private async syncModels(): Promise<void> {
        try {
            await this.connection.sync({ alter: true });
            // Creates tables if they don't exist, drops and recreates them if they do
            console.log("✅ All models were synchronized successfully.");
            console.log("✅ All models were (re)created!");
        } catch (error) {
            console.error("❌ Error syncing models:", error);
        }
    }

    private async createDatabaseIfNotExists(): Promise<void> {
        const client = new Client({
            host: DB_HOST,
            port: Number(DB_PORT),
            user: DB_USER,
            password: DB_PASSWORD,
        });
        
        try {
            await client.connect();
            const result = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`);
            if (result.rowCount === 0) {
                await client.query(`CREATE DATABASE ${DB_NAME}`);
                console.log(`✅ Database '${DB_NAME}' created successfully.`);
            } else {
                console.log(`✅ Database '${DB_NAME}' already exists.`);
            }
        } catch (error) {
            console.error('❌ Error creating database: ', error);
            throw new Error('Error creating database');
        } finally {
            await client.end();
        }
    }
}

const database: Database = new Database();
export default database;