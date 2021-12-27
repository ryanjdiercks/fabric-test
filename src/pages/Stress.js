import React, { useEffect, useRef } from 'react';
import { System } from 'detect-collisions';
import { fabric } from "fabric";

function random(min, max) {
  return Math.floor(Math.random() * max) + min;
}

const width = 1000;
const height = 500;
const count = 100;
const speed = 1;
const size = 5;

let frame = 0;
let fps_total = 0;
class Stress {
  constructor(element, canvas) {
    this.element = element;
    this.canvas = canvas;
    this.fabric = new fabric.Canvas(this.canvas);
    this.context = this.canvas.getContext("2d");
    this.collisions = new System();
    this.bodies = [];
    this.polygons = 0;
    this.circles = 0;

    this.canvas.width = width;
    this.canvas.height = height;
    this.context.font = "24px Arial";

    // World bounds
    this.bounds = [
      this.collisions.createPolygon({ x: 0, y: 0 }, [
        { x: 0, y: 0 },
        { x: width, y: 0 },
      ]),
      this.collisions.createPolygon({ x: 0, y: 0 }, [
        { x: width, y: 0 },
        { x: width, y: height },
      ]),
      this.collisions.createPolygon({ x: 0, y: 0 }, [
        { x: width, y: height },
        { x: 0, y: height },
      ]),
      this.collisions.createPolygon({ x: 0, y: 0 }, [
        { x: 0, y: height },
        { x: 0, y: 0 },
      ]),
    ];

    for (let i = 0; i < count; ++i) {
      this.createShape(!random(0, 49));
    }
    this.fabric.renderAll()

    this.context.strokeStyle = "#F00";
    this.context.beginPath();
    this.collisions.draw(this.context);
    this.context.stroke();

    this.element.innerHTML = `
      <div><b>Total:</b> ${count}</div>
      <div><b>Polygons:</b> ${this.polygons}</div>
      <div><b>Circles:</b> ${this.circles}</div>
      <div><label><input id="bvh" type="checkbox"> Show Bounding Volume Hierarchy</label></div>
    `;

    this.bvh_checkbox = this.element.querySelector("#bvh");

    if (this.canvas instanceof Node) {
      this.element.appendChild(this.canvas);
    }

    const self = this;

    let time = performance.now();

    this.frame = requestAnimationFrame(function frame() {
      const current_time = performance.now();

      try {
        self.update(1000 / (current_time - time));
      } catch (err) {
        console.warn(err.message || err);
      }

      self.frame = requestAnimationFrame(frame);

      time = current_time;
    });
  }

  update(fps) {
    ++frame;
    fps_total += fps;

    const average_fps = Math.round(fps_total / frame);

    if (frame > 100) {
      frame = 1;
      fps_total = average_fps;
    }

    this.bodies.forEach((body) => {
      body.collisions.pos.x += body.direction_x * speed;
      body.collisions.pos.y += body.direction_y * speed;
      body.fabric.left += body.direction_x * speed;
      body.fabric.top += body.direction_y * speed;
    });

    this.collisions.update();
    this.collisions.checkAll(({ a, overlapV }) => {
      if (this.bounds.includes(a)) {
        return;
      }

      const direction = (random(0, 360) * Math.PI) / 180;
      const body = this.bodies.find(b => b.collisions === a)

      a.pos.x -= overlapV.x;
      a.pos.y -= overlapV.y;

      body.fabric.left -= overlapV.x;
      body.fabric.top -= overlapV.y;

      body.direction_x = Math.cos(direction);
      body.direction_y = Math.sin(direction);

    });

    // Clear the canvas
    this.context.fillStyle = "#000000";
    this.context.fillRect(0, 0, width, height);

    this.fabric.renderAll()

    // Disable Render the bodies
    // this.context.strokeStyle = "#F00";
    // this.context.beginPath();
    // this.collisions.draw(this.context);
    // this.context.stroke();

    // Render the BVH
    if (this.bvh_checkbox.checked) {
      this.context.strokeStyle = "#00FF00";
      this.context.beginPath();
      this.collisions.drawBVH(this.context);
      this.context.stroke();
    }

    // Render the FPS
    this.context.fillStyle = "#FFCC00";
    this.context.fillText(average_fps, 10, 30);
  }

  createShape(large) {
    const min_size = size * 0.5 * (large ? 3 : 1);
    const max_size = size * 1.25 * (large ? 5 : 1);
    const x = random(0, width);
    const y = random(0, height);
    const direction = (random(0, 360) * Math.PI) / 180;

    let body;
    let c1;
    let c2;

    if (random(0, 2)) {
      const radius = random(min_size, max_size)
      c1 = this.collisions.createCircle({ x, y }, radius);
      c2 = new fabric.Circle({
        left: x,
        top: y,
        radius,
        originX: 'center',
        originY: 'center'
      })

      ++this.circles;
    } else {
      const points = [
        { x: -random(min_size, max_size), y: -random(min_size, max_size) },
        { x: random(min_size, max_size), y: -random(min_size, max_size) },
        { x: random(min_size, max_size), y: random(min_size, max_size) },
        { x: -random(min_size, max_size), y: random(3, size) },
      ]
      c1 = this.collisions.createPolygon(
        {
          x,
          y,
        },
        points,
      );

      c2 = new fabric.Polygon(
        points, {
        stroke: 'white',
        left: x,
        top: y,
        originX: 'center',
        originY: 'center'
      })

      ++this.polygons;
    }

    body = {
      collisions: c1,
      fabric: c2
    }

    this.fabric.add(c2)

    body.direction_x = Math.cos(direction);
    body.direction_y = Math.sin(direction);

    this.bodies.push(body);
  }
};


const StressTest = () => {
  const divRef = useRef()
  const canvasRef = useRef()

  useEffect(() => {
    new Stress(divRef.current, canvasRef.current)
  }, [])

  return (
    <div ref={divRef}>
      <canvas id="c" ref={canvasRef} width={1000} height={500} style={{marginTop: '100px', marginLeft: '100px'}}></canvas>
    </div>
  )
}

export default StressTest;