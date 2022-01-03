import React, { useEffect } from "react";
import { fabric } from "fabric";
import _ from "lodash";

// Import static Polygon data from the json file
import polygonData from "./polygon-data.json";

// Static variables
const GRID_W = 3;
const GRID_H = 3;

const CANVAS_W = 1000;
const CANVAS_H = 500;

// Border lines
const borderLines = [
  { x1: 0, y1: 0, x2: CANVAS_W, y2: 0 },
  { x1: 0, y1: CANVAS_H, x2: CANVAS_W, y2: CANVAS_H },
  { x1: 0, y1: 0, x2: 0, y2: CANVAS_H },
  { x1: CANVAS_W, y1: 0, x2: CANVAS_W, y2: CANVAS_H },
];

let fabricCanvas;
let polygons = [];

// Create Polygon with center points and polygon type
function createPolygon(x, y, index) {
  return new fabric.Polygon(polygonData[index].points, {
    stroke: "blue",
    left: x,
    top: y,
    originX: "center",
    originY: "center",
  });
}

// Get the absolute position data of polygon lines from Vector data
// original polygon data is relative Vector data from the clicking point
function getLines(polygon) {
  const points = polygon.points.map((p) => {
    const x1 = p.x * (polygon.scaleX || 1);
    const y1 = p.y * (polygon.scaleY || 1);
    const cos = Math.cos((Math.PI / 180) * (polygon.angle || 0));
    const sin = Math.sin((Math.PI / 180) * (polygon.angle || 0));
    const x = polygon.left + cos * x1 - sin * y1;
    const y = polygon.top + sin * x1 + cos * y1;
    return { x, y };
  });

  return points.map((p, i) => {
    const p1 = points[(i + 1) % points.length];
    return { x1: p.x, y1: p.y, x2: p1.x, y2: p1.y };
  });
}

// Function to detect the collision between two lines.
function collideLines(l1, l2) {
  var det, gamma, lambda;
  det = (l1.x2 - l1.x1) * (l2.y2 - l2.y1) - (l2.x2 - l2.x1) * (l1.y2 - l1.y1);
  if (det !== 0) {
    lambda =
      ((l2.y2 - l2.y1) * (l2.x2 - l1.x1) + (l2.x1 - l2.x2) * (l2.y2 - l1.y1)) /
      det;
    gamma =
      ((l1.y1 - l1.y2) * (l2.x2 - l1.x1) + (l1.x2 - l1.x1) * (l2.y2 - l1.y1)) /
      det;
    if (0 < lambda && lambda < 1 && 0 < gamma && gamma < 1) {
      return true;
    }
  }
  return false;
}

// Function to detect the collision between two polygons
// So logic is 
// - to create a function to detect the collision between two lines
// - devide the polygons into lines and 
// - check whether each line of the new polygon has collision with the existing polygon lines including border lines
function collidePolygons(p1, p2) {
  const lines1 = getLines(p1);
  const lines2 = [...getLines(p2), ...borderLines];
  for (let i1 = 0, n1 = lines1.length; i1 < n1; i1++) {
    for (let i2 = 0, n2 = lines2.length; i2 < n2; i2++) {
      if (collideLines(lines1[i1], lines2[i2])) return true;
    }
  }
  return false;
}

// Check whether the grid cell is empty or not
function isEmpty(data, index) {
  return (
    // Image data is 4 byte
    !data[4 * index] &&
    !data[4 * index + 1] &&
    !data[4 * index + 2] &&
    !data[4 * index + 3]
  );
}


function findPos(kind) {
  // Get canvas element
  const canvas = document.querySelector("#my-fabric-canvas");
  const ctx = canvas.getContext("2d");
  // Devide the canvas into grid cells and get the grid cell count for canvas width and height
  const gw = Math.floor(CANVAS_W / GRID_W) + 1;
  const gh = Math.floor(CANVAS_H / GRID_H);

  const pw = gw * GRID_W;
  const ph = gh * GRID_H;

  // Get image data from the Canvas
  const data = ctx.getImageData(0, 0, pw, ph).data;
  console.log('--- data: ', data);
  const canvasMap = [];
  for (let j = 0; j < gh; j++) {
    for (let i = 0; i < gw - 1; i++) {
    // Convert the Canvas image data to string with 0 and 1
    // 1 means that grid cell is filled and 0 means that cell is empty
      canvasMap.push(
        isEmpty(data, j * GRID_H * pw + i * GRID_W) &&
          isEmpty(data, ((j + 1) * GRID_H - 1) * pw + i * GRID_W) &&
          isEmpty(data, j * GRID_H * pw + (i + 1) * GRID_W - 1) &&
          isEmpty(data, ((j + 1) * GRID_H - 1) * pw + (i + 1) * GRID_W - 1)
          ? 0
          : 1
      );
    }
    // Add the ending point
    canvasMap.push(1);
  }
  // Convert canvas map data to string
  const canvasMapStr = canvasMap.join("");

  // get polygon map

  const { points } = polygonData[kind];
  const minX = _.minBy(points, "x").x;
  const maxX = _.maxBy(points, "x").x;
  const minY = _.minBy(points, "y").y;
  const maxY = _.maxBy(points, "y").y;
  const gw1 = gw;
  const gh1 = Math.round((-minY + maxY) / GRID_H);
  const pw1 = pw;
  const ph1 = gh1 * GRID_H;

  // Create another invisible canvas for the new polygon
  const canvas1 = document.createElement("canvas");
  const fc = new fabric.Canvas(canvas1);
  const p = createPolygon(-minX, -minY, kind);
  fc.add(p);
  fc.renderAll();

  // Process the same process for the new polygon
  const ctx1 = canvas1.getContext("2d");
  const data1 = ctx1.getImageData(0, 0, pw1, ph1).data;
  const polygonMap = [];
  for (let j = 0; j < gh1; j++) {
    const flags = [];
    for (let i = 0; i < gw1; i++) {
      flags.push(
        isEmpty(data1, j * GRID_H * pw1 + i * GRID_W) &&
          isEmpty(data1, ((j + 1) * GRID_H - 1) * pw1 + i * GRID_W) &&
          isEmpty(data1, j * GRID_H * pw1 + (i + 1) * GRID_W - 1) &&
          isEmpty(data1, ((j + 1) * GRID_H - 1) * pw1 + (i + 1) * GRID_W - 1)
          ? 0
          : 1
      );
    }
    polygonMap.push(flags.join(""));
  }

  const polygonMapStr = polygonMap.join("").replace(/0+$/, "");

  const arr1 = polygonMapStr.match(/1+/g).map((str) => `0{${str.length}}`);
  const arr0 = polygonMapStr.match(/0+/g).map((str) => `[01]{${str.length}}`);
  let reg;
  if (polygonMapStr[0] === "0") {
    reg = arr0.map((str, i) => `${str}${arr1[i] || ""}`).join("");
  } else {
    reg = arr1.map((str, i) => `${str}${arr0[i] || ""}`).join("");
  }
  const regex = new RegExp(reg, "g");
  if (regex.exec(canvasMapStr)) {
    // find the possible position to draw the polygon using regex in string
    const index = regex.lastIndex - polygonMapStr.length;
    // and convert it to absolute position
    const x = (index % gw) * GRID_W - minX;
    const y = Math.floor(index / gw) * GRID_H - minY;
    return { x, y };
  }
  return null;
}

const CanvasComponent = () => {
  useEffect(() => {
    fabricCanvas = new fabric.Canvas("my-fabric-canvas");

    // Mouse clicking event
    const handleMouseClick = (options) => {
      if (options.target) return;

      // Find the polygon type and create a polygon with the existing sets of points
      const type = polygons.length % polygonData.length;
      const newPolygon = createPolygon(
        options.e.clientX,
        options.e.clientY,
        type
      );

      // 
      const collisionPolygon = polygons.find((p) =>
        collidePolygons(newPolygon, p)
      );
      // Draw polygons at the clicking point if there is no collision.
      if (!collisionPolygon) {
        fabricCanvas.add(newPolygon);
        fabricCanvas.renderAll();
        polygons.push(newPolygon);
      } else {
        // find the empty position when there is a collision
        const pos = findPos(type);
        if (pos) {
          const newPolygon = createPolygon(pos.x, pos.y, type);
          fabricCanvas.add(newPolygon);
          fabricCanvas.renderAll();
          polygons.push(newPolygon);
        }
      }
    };

    // Initially draw the first polygon
    fabricCanvas.on("mouse:down", handleMouseClick);
    const p = createPolygon(200, 200, 0);
    fabricCanvas.add(p);
    fabricCanvas.renderAll();
    polygons = [p];

    return () => {
      fabricCanvas.off("mouse:down", handleMouseClick);
    };
  }, []);

  return (
    <div className="App">
      <canvas
        id="my-fabric-canvas"
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ border: "1px solid" }}
      />
    </div>
  );
};

export default CanvasComponent;
