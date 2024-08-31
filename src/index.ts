import express, { Application, Request, Response } from 'express';
import { NODE_PORT } from './config/config';
import routes from './routes/routes';
// import database from './config/database';


class App {
    public app: Application

    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.setupHomeRoute();
    }

    // private databaseSync(): void {
    //     const db = database;
    //     db.connection;
    // }

    private initializeMiddlewares(): void {
        this.app.use(express.json());
    }

    private initializeRoutes(): void {
        this.app.use('', routes);
    }

    private setupHomeRoute(): void {
        this.app.get('/', (req: Request, res: Response) => {
            res.send('🚀 FlowMeterAI server is up and running!');
        });
    }

    public start(): void {
        this.app.listen(NODE_PORT, () => {
            console.log('\x1b[36m%s\x1b[0m', this.getServerStartMessage());
        });
    }

    private getServerStartMessage(): string {
        return `
            🚀 FlowMeterAI server is up and running!
            🌐 Listening on: http://localhost:${NODE_PORT}
            🛠️  API endpoints ready for action
            📊 Real-time flow meter data processing engaged
            🔧 Happy coding! Press Ctrl+C to stop the server
        `;
    }
}

const app = new App();
app.start();