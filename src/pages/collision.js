import React, { useState, useRef, useEffect, useCallback } from 'react';
import { System } from 'detect-collisions';

import { fabric } from "fabric";

const width = 1000;
const height = 500;

const polygonsPoints = [
  {
    points: [
      {
        "x": -50.24731233,
        "y": 23.15201165
      },
      {
        "x": -29.46402287,
        "y": 2.34225007
      },
      {
        "x": 29.46402287,
        "y": 2.34225007
      },
      {
        "x": 50.24731233,
        "y": 23.15201165
      },
      {
        "x": 68.29000767,
        "y": 5.13226835
      },
      {
        "x": 40.03597713,
        "y": -23.15775007
      },
      {
        "x": -40.03597713,
        "y": -23.15775007
      },
      {
        "x": -68.29000767,
        "y": 5.13226835
      }
    ]
  },
  {
    points: [
      {
        "x": -45,
        "y": 40.75
      },
      {
        "x": -45.00000002,
        "y": -15.25000002
      },
      {
        "x": 44.00000002,
        "y": -15.25000002
      },
      {
        "x": 44,
        "y": 40.75
      },
      {
        "x": 69.5,
        "y": 40.75
      },
      {
        "x": 69.49999998,
        "y": -40.74999998
      },
      {
        "x": -70.49999998,
        "y": -40.74999998
      },
      {
        "x": -70.5,
        "y": 40.75
      }
    ]
  },
  {
    points: [
      {
        "x": -12,
        "y": 16.5
      },
      {
        "x": -22.50000002,
        "y": 16.50000002
      },
      {
        "x": -22.50000002,
        "y": -16.50000002
      },
      {
        "x": 22.50000002,
        "y": -16.50000002
      },
      {
        "x": 22.5,
        "y": 42
      },
      {
        "x": 48,
        "y": 42
      },
      {
        "x": 47.99999998,
        "y": -41.99999998
      },
      {
        "x": -47.99999998,
        "y": -41.99999998
      },
      {
        "x": -47.99999998,
        "y": 41.99999998
      },
      {
        "x": -12,
        "y": 42
      }
    ]
  },
  {
    points: [
      {
        "x": -48.17834047,
        "y": 30.22517196
      },
      {
        "x": -13.25256233,
        "y": -4.72880996
      },
      {
        "x": 66.2132,
        "y": -4.72881
      },
      {
        "x": 66.2132,
        "y": -30.22881
      },
      {
        "x": -23.82103767,
        "y": -30.22881004
      },
      {
        "x": -66.21683953,
        "y": 12.20122804
      }
    ]
  },
  {
    points: [
      {
        "x": 55.98768968,
        "y": 35.50852722
      },
      {
        "x": 55.98768966,
        "y": -61.2414765
      },
      {
        "x": -144.75003992,
        "y": -61.2414765
      },
      {
        "x": -144.75003992,
        "y": 63.75852778
      },
      {
        "x": -52.25438535,
        "y": 63.75852778
      },
      {
        "x": -52.25438535,
        "y": 3.25852526
      },
      {
        "x": -10.00921154,
        "y": 3.25852526
      },
      {
        "x": -10.00921156,
        "y": 51.75852783
      },
      {
        "x": 15.49078844,
        "y": 51.75852783
      },
      {
        "x": 15.49078842,
        "y": -22.2414747
      },
      {
        "x": -77.75438531,
        "y": -22.2414747
      },
      {
        "x": -77.75438531,
        "y": 38.25852782
      },
      {
        "x": -119.25003996,
        "y": 38.25852782
      },
      {
        "x": -119.25003996,
        "y": -35.74147654
      },
      {
        "x": 30.4876897,
        "y": -35.74147654
      },
      {
        "x": 30.48768968,
        "y": 35.50852722
      }
    ]
  },
  {
    points: [
      {
        "x": -73.75100418,
        "y": 33.50852713
      },
      {
        "x": -73.7510042,
        "y": -37.99147664
      },
      {
        "x": -35.50678027,
        "y": -37.99147664
      },
      {
        "x": -35.50678027,
        "y": 52.50852726
      },
      {
        "x": 69.48566082,
        "y": 52.50852726
      },
      {
        "x": 69.48566084,
        "y": -53.99147677
      },
      {
        "x": 43.98566084,
        "y": -53.99147677
      },
      {
        "x": 43.98566086,
        "y": 27.0085273
      },
      {
        "x": -10.00678031,
        "y": 27.0085273
      },
      {
        "x": -10.00678031,
        "y": -63.4914766
      },
      {
        "x": -99.25100416,
        "y": -63.4914766
      },
      {
        "x": -99.25100418,
        "y": 33.50852713
      }
    ]
  },
]

const CanvasComponent = () => {
  const divRef = useRef()
  const canvasRef = useRef()
  const [collisions, setCollisions] = useState();
  const [bodies, setBodies] = useState([]);
  const [polygons, setPolygons] = useState(0);
  const [count, setCount] = useState(1)

  const fabricCanvas = useRef()
  const context = useRef()
  const collisionSystem = useRef()


  // INIT
  useEffect(() => {
    fabricCanvas.current = new fabric.Canvas("my-fabric-canvas");
    context.current = canvasRef.current.getContext("2d");
    collisionSystem.current = new System();
    setCollisions(collisionSystem.current);
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    context.current.font = "24px Arial";
    const bounds = [
      collisionSystem.current.createPolygon({ x: 0, y: 0 }, [
        { x: 0, y: 0 },
        { x: width, y: 0 },
      ]),
      collisionSystem.current.createPolygon({ x: 0, y: 0 }, [
        { x: width, y: 0 },
        { x: width, y: height },
      ]),
      collisionSystem.current.createPolygon({ x: 0, y: 0 }, [
        { x: width, y: height },
        { x: 0, y: height },
      ]),
      collisionSystem.current.createPolygon({ x: 0, y: 0 }, [
        { x: 0, y: height },
        { x: 0, y: 0 },
      ]),
    ];
    const firstPolygonFabric = new fabric.Polygon(
      polygonsPoints[0].points,
      {
        stroke: 'white',
        left: 200,
        top: 100,
        originX: 'center',
        originY: 'center'
      });
    const firstPolygonCollision = collisionSystem.current.createPolygon(
      {
        x: 200,
        y: 100,
      },
      polygonsPoints[0].points,
    );
    fabricCanvas.current.add(firstPolygonFabric)
    fabricCanvas.current.renderAll();

    context.current.strokeStyle = "#F00";
    context.current.beginPath();
    collisionSystem.current.draw(context.current);
    context.current.stroke();

  }, []);

  useEffect(() => {
    fabricCanvas.current.off('mouse:down');
    fabricCanvas.current.on('mouse:down', handleMouseClick);
  }, [count])

  const handleMouseClick = (options) => {
    if (options.target) {
      return;
    }
    const index = count % polygonsPoints.length;
    const newFabricPolygon = new fabric.Polygon(
      polygonsPoints[index].points,
      {
        stroke: 'blue',
        left: options.e.clientX,
        top: options.e.clientY,
        originX: 'center',
        originY: 'center'
      });
    const aa = collisionSystem.current.createPolygon(
      {
        x: options.e.clientX,
        y: options.e.clientY,
      },
      polygonsPoints[index].points,
    );
    console.log('---- options: ', options, aa);
    const newCount = count + 1
    setCount(newCount)
    fabricCanvas.current.add(newFabricPolygon);
    fabricCanvas.current.renderAll();
    context.current.strokeStyle = "#F00";
    context.current.beginPath();
    collisionSystem.current.draw(context.current);
    context.current.stroke();

    collisionSystem.current.update();
    let potentials = collisionSystem.current.getPotentials(aa)

    let actualCollisions = 0
    let totalLoop = 5
    while (potentials.length > 0 && totalLoop > 0) {
      potentials.forEach((collider) => {
        if (collisionSystem.current.checkCollision(aa, collider)) {
          // handleCollisions(system.response);
          const { overlapV } = collisionSystem.current.response

          aa.pos.x -= Math.floor(overlapV.x) - 1;
          aa.pos.y -= Math.floor(overlapV.y) - 1;
          console.log(aa)

          newFabricPolygon.left -= overlapV.x;
          newFabricPolygon.top -= overlapV.y;
          actualCollisions++;

          fabricCanvas.current.renderAll()
        }
      });
      if (actualCollisions > 0) {
        potentials = collisionSystem.current.getPotentials(aa);
        actualCollisions = 0;
        
      } else {
        fabricCanvas.current.renderAll()
        break;
      }
      totalLoop--;
    }

    if(totalLoop === 0) {
      let directionX = 10;
      let directionY = 10;

      while (aa.pos.y < height && potentials.length > 0) {
        actualCollisions = 0;

        potentials = collisionSystem.current.getPotentials(aa);
        potentials.forEach((collider) => {
          if (collisionSystem.current.checkCollision(aa, collider)) {
            actualCollisions++;
          }
        });

        if (actualCollisions === 0) {
          break;
        }

        aa.pos.x += directionX;
        newFabricPolygon.left += directionX;

        
        if (((aa.pos.x + aa.maxX / 2) > (width - directionX)) || (aa.pos.x < directionX)) {
          directionX *= -1;
          aa.pos.y += directionY;
          newFabricPolygon.top += directionY;
        }
      }

      fabricCanvas.current.renderAll()
      collisionSystem.current.draw(context.current);
      collisionSystem.current.update();
    }
  }



  return (
    <div ref={divRef} className="App" >
      <canvas ref={canvasRef} id="my-fabric-canvas" width="1000" height="500" />
    </div>
  );
};

export default CanvasComponent;