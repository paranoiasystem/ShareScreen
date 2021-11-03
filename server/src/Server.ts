import express, { Application } from "express";
import { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import { v4 as uuidv4 } from "uuid";
import { ExpressPeerServer } from "peer";
import path from "path";
import amqp from "amqplib";
import * as dotenv from 'dotenv';
dotenv.config();

export class Server {
  private httpServer: HTTPServer;
  private app: Application;
  private io: SocketIOServer;
  private peerServer: any;
  private readonly DEFAULT_PORT: number = 5000;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*'
      }
    });
    this.peerServer = ExpressPeerServer(this.httpServer);

    this.configureApp();
    this.recordRoutes();
    this.handleSocketConnection();
  }

  private configureApp(): void {
    this.app.set('views', path.join(__dirname, './views'));
    this.app.set("view engine", "ejs");
    this.app.use("/peerjs", this.peerServer);
    this.app.use(express.static(path.join(__dirname, "./public")));
  }

  private recordRoutes(): void {
    this.app.get("/", async (req, res) => {
      try {
        const roomId = uuidv4();
        // const brokerConn = await amqp.connect(`amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASS}@${process.env.RABBIT_HOSTNAME}:5672`);
        // const channel = await brokerConn.createChannel();
        // channel.assertQueue('room', { durable: false });
        // channel.sendToQueue('room', Buffer.from(roomId));
        res.render("cast", { roomId: roomId, userId: uuidv4() });
      } catch(e: any) {
        throw new Error(e.message)
      }
    });
    
    this.app.get("/mirror/:id", (req, res) => {
      res.render("mirror", { roomId: req.params.id, userId: uuidv4() });
    });
  }

  private handleSocketConnection(): void {
    this.io.on("connection", socket => {
      socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);
      });
    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, '0.0.0.0', 511,() =>
      callback(this.DEFAULT_PORT)
    );
  }
}