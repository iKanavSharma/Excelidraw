import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private currentPencilPoints: { x: number; y: number }[] = [];
  private selectedTool: Tool = "rect";
  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: "circle" | "pencil" | "rect") {
    this.selectedTool = tool;
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type == "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        // re-render everything
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // render all existing shapes
    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeStyle = "white";
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius),
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil") {
        this.drawPencil(shape.points);
      }
    });

    // draw live pencil stroke if in progress
    if (this.selectedTool === "pencil" && this.clicked) {
      this.drawPencil(this.currentPencilPoints);
    }
  }

  private drawPencil(points: { x: number; y: number }[]) {
    if (!points || points.length < 2) return;

    this.ctx.beginPath();
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "white";

    this.ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    this.ctx.quadraticCurveTo(
      points[points.length - 2].x,
      points[points.length - 2].y,
      points[points.length - 1].x,
      points[points.length - 1].y
    );

    this.ctx.stroke();
    this.ctx.closePath();
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.offsetX;
    this.startY = e.offsetY;

    if (this.selectedTool === "pencil") {
      this.currentPencilPoints = [{ x: this.startX, y: this.startY }];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const width = e.offsetX - this.startX;
    const height = e.offsetY - this.startY;

    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        height,
        width,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "circle",
        radius: radius,
        centerX: this.startX + radius,
        centerY: this.startY + radius,
      };
    } else if (selectedTool === "pencil") {
      if (this.currentPencilPoints.length > 1) {
        shape = {
          type: "pencil",
          points: [...this.currentPencilPoints],
        };
      }
    }

    if (!shape) return;

    this.existingShapes.push(shape);

    // send the message to socket
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );

    this.currentPencilPoints = [];
    this.clearCanvas();
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    const width = e.offsetX - this.startX;
    const height = e.offsetY - this.startY;

    if (this.selectedTool === "pencil") {
      this.currentPencilPoints.push({ x: e.offsetX, y: e.offsetY });
    }

    this.clearCanvas();

    this.ctx.strokeStyle = "white";
    const selectedTool = this.selectedTool;

    if (selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    } else if (selectedTool === "circle") {
      const centerX = this.startX + width / 2;
      const centerY = this.startY + height / 2;
      const radius = Math.max(width, height) / 2;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
