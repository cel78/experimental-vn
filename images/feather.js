const canvas = document.querySelector("#veil");
const ctx = canvas.getContext("2d");

const scanCanvas = document.querySelector("#scanEffect");
const scanCtx = scanCanvas.getContext("2d");


const foreground = new Image();

foreground.src = "images/peter crashing out.gif";




const circleRadius = 100;


const scanDuration = 700;


const stampDistance = 20;


function resizeCanvas() {

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    scanCanvas.width = innerWidth;
    scanCanvas.height = innerHeight;

    drawForeground();
}


foreground.onload = resizeCanvas;

window.addEventListener("resize", resizeCanvas);


\

function drawForeground() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const imageRatio =
        foreground.width / foreground.height;

    const screenRatio =
        canvas.width / canvas.height;


    let width;
    let height;
    let x;
    let y;


    if (screenRatio > imageRatio) {

        width = canvas.width;
        height = width / imageRatio;

        x = 0;
        y = (canvas.height - height) / 2;

    } else {

        height = canvas.height;
        width = height * imageRatio;

        x = (canvas.width - width) / 2;
        y = 0;
    }


    ctx.drawImage(
        foreground,
        x,
        y,
        width,
        height
    );
}




function revealCircleProgress(x, y, progress) {


    const scanY =
        y - circleRadius +
        progress * circleRadius * 2;


    ctx.save();


 

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        circleRadius,
        0,
        Math.PI * 2
    );

    ctx.clip();



    ctx.globalCompositeOperation =
        "destination-out";


    ctx.fillStyle = "black";

    ctx.fillRect(
        x - circleRadius,
        y - circleRadius,
        circleRadius * 2,
        scanY - (y - circleRadius)
    );


    ctx.restore();
}




function drawScan(scan, progress) {

    const x = scan.x;
    const y = scan.y;


    const scanY =
        y - circleRadius +
        progress * circleRadius * 2;


    scanCtx.save();


   \

    scanCtx.beginPath();

    scanCtx.arc(
        x,
        y,
        circleRadius,
        0,
        Math.PI * 2
    );

    scanCtx.clip();


    const glow =
        scanCtx.createLinearGradient(
            0,
            scanY - 25,
            0,
            scanY + 25
        );


    glow.addColorStop(
        0,
        "rgba(255,255,255,0)"
    );

    glow.addColorStop(
        0.5,
        "rgba(129, 199, 240, 0.25)"
    );

    glow.addColorStop(
        1,
        "rgba(255,255,255,0)"
    );


    scanCtx.fillStyle = glow;

    scanCtx.fillRect(
        x - circleRadius,
        scanY - 25,
        circleRadius * 2,
        50
    );



    scanCtx.strokeStyle =
        "rgba(217, 249, 255, 0.9)";

    scanCtx.lineWidth = 2;

    scanCtx.beginPath();

    scanCtx.moveTo(
        x - circleRadius,
        scanY
    );

    scanCtx.lineTo(
        x + circleRadius,
        scanY
    );

    scanCtx.stroke();



    for (let i = 0; i < 5; i++) {

        const offset =
            Math.random() * 30 - 15;

        scanCtx.fillStyle =
            `rgba(255,255,255,${
                Math.random() * 0.15
            })`;

        scanCtx.fillRect(
            x - circleRadius,
            scanY + offset,
            circleRadius * 2,
            Math.random() * 2 + 1
        );
    }


    scanCtx.restore();
}




function animate(time) {

    scanCtx.clearRect(
        0,
        0,
        scanCanvas.width,
        scanCanvas.height
    );


    for (
        let i = activeScans.length - 1;
        i >= 0;
        i--
    ) {

        const scan = activeScans[i];


        const progress =
            Math.min(
                (time - scan.start) /
                scanDuration,
                1
            );


        revealCircleProgress(
            scan.x,
            scan.y,
            progress
        );


        drawScan(
            scan,
            progress
        );
\

        if (progress >= 1) {
\

            ctx.save();

            ctx.globalCompositeOperation =
                "destination-out";

            ctx.beginPath();

            ctx.arc(
                scan.x,
                scan.y,
                circleRadius,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();


            activeScans.splice(i, 1);
        }
    }


    requestAnimationFrame(animate);
}


requestAnimationFrame(animate);




canvas.addEventListener(
    "mousemove",
    event => {

        const x = event.clientX;
        const y = event.clientY;


        const distance =
            Math.hypot(
                x - prevX,
                y - prevY
            );



        if (distance < stampDistance) {
            return;
        }


        activeScans.push({

            x: x,

            y: y,

            start: performance.now()

        });


        prevX = x;
        prevY = y;

    }
);