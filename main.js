/* https://blog.olivierlarose.com/tutorials/paint-reveal 
https://www.youtube.com/watch?v=poohNMew7xU
https://stackoverflow.com/questions/43674061/how-to-animate-scanner-effect-line-with-canvas
https://stackoverflow.com/questions/27407710/reveal-image-on-canvas-with-draw-strokes-paint
*/


const veil = document.querySelector("#veil");
const veilContext = veil.getContext("2d");

const scanCanvas = document.querySelector("#scanEffect");
const scanContext = scanCanvas.getContext("2d");





const foreground = new Image();

foreground.src = "images/stillfg.png";





const SCAN_RADIUS = 120;

const SCAN_DURATION = 700;

const SCAN_DISTANCE = 100;

const SCAN_COOLDOWN = 150;


const revealedAreas = [];




function resizeCanvases() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    const pixelRatio = window.devicePixelRatio || 1;


    veil.width = width * pixelRatio;
    veil.height = height * pixelRatio;

    scanCanvas.width = width * pixelRatio;
    scanCanvas.height = height * pixelRatio;


    veilContext.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );


    scanContext.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );


    redrawForeground();
}



window.addEventListener(
    "resize",
    resizeCanvases
);





function redrawForeground() {

    const width = window.innerWidth;
    const height = window.innerHeight;


    veilContext.globalCompositeOperation =
        "source-over";


    veilContext.clearRect(
        0,
        0,
        width,
        height
    );



    const imageRatio =
        foreground.width /
        foreground.height;

    const screenRatio =
        width /
        height;


    let drawWidth;
    let drawHeight;
    let offsetX;
    let offsetY;



    if (screenRatio > imageRatio) {

        drawWidth = width;

        drawHeight =
            width / imageRatio;

        offsetX = 0;

        offsetY =
            (height - drawHeight) / 2;

    } else {

        drawHeight = height;

        drawWidth =
            height * imageRatio;

        offsetX =
            (width - drawWidth) / 2;

        offsetY = 0;
    }



    veilContext.drawImage(
        foreground,

        offsetX,
        offsetY,

        drawWidth,
        drawHeight
    );



  

    revealedAreas.forEach(area => {

        eraseCircle(
            area.x * width,
            area.y * height,
            area.radius
        );

    });

}



foreground.onload = resizeCanvases;




function eraseCircle(x, y, radius) {

    veilContext.save();



    veilContext.globalCompositeOperation =
        "destination-out";


    const gradient =
        veilContext.createRadialGradient(

            x,
            y,
            radius * 0.70,

            x,
            y,
            radius
        );


    gradient.addColorStop(
        0,
        "rgb(189, 120, 120)"
    );


    gradient.addColorStop(
        0.75,
        "rgba(204, 146, 146, 0.12)"
    );


    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    veilContext.fillStyle = gradient;


    veilContext.beginPath();

    veilContext.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    veilContext.fill();


    veilContext.restore();
}





function eraseScanProgress(
    x,
    y,
    radius,
    scanY
) {

    veilContext.save();



    veilContext.beginPath();

    veilContext.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    veilContext.clip();



    veilContext.globalCompositeOperation =
        "destination-out";


  

    veilContext.fillStyle =
        "rgba(0,0,0,1)";


    veilContext.fillRect(

        x - radius,

        y - radius,

        radius * 2,

        scanY - (y - radius)

    );


    veilContext.restore();
}



/* effect */

function drawScanEffect(
    x,
    y,
    radius,
    scanY
) {

    const width = window.innerWidth;
    const height = window.innerHeight;


    scanContext.clearRect(
        0,
        0,
        width,
        height
    );


    scanContext.save();


    scanContext.beginPath();

    scanContext.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    scanContext.clip();



    /*
        main line 
    */

    scanContext.strokeStyle =
        "rgba(255,255,255,0.9)";

    scanContext.lineWidth = 2;


    scanContext.beginPath();

    scanContext.moveTo(
        x - radius,
        scanY
    );

    scanContext.lineTo(
        x + radius,
        scanY
    );

    scanContext.stroke();



    /*
        glow
    */

    const glow =
        scanContext.createLinearGradient(

            0,
            scanY - 30,

            0,
            scanY + 30
        );


    glow.addColorStop(
        0,
        "rgba(255,255,255,0)"
    );

    glow.addColorStop(
        0.5,
        "rgba(255,255,255,0.20)"
    );

    glow.addColorStop(
        1,
        "rgba(255,255,255,0)"
    );


    scanContext.fillStyle = glow;


    scanContext.fillRect(

        x - radius,
        scanY - 30,

        radius * 2,
        60

    );



    /*
        ts not great (remove?)
    */

    for (let i = 0; i < 7; i++) {

        const randomY =
            scanY +
            Math.random() * 50 -
            25;


        const opacity =
            Math.random() * 0.20;


        scanContext.fillStyle =
            `rgba(255,255,255,${opacity})`;


        scanContext.fillRect(

            x - radius,
            randomY,

            radius * 2,
            Math.random() * 3 + 1

        );

    }



    scanContext.restore();
}



/* run complete */

function scanArea(x, y) {

    const startingTime =
        performance.now();


    function animate(currentTime) {

        const elapsed =
            currentTime -
            startingTime;


        let progress =
            elapsed /
            SCAN_DURATION;


        progress =
            Math.min(progress, 1);



   

        const scanY =

            y -
            SCAN_RADIUS +

            progress *
            SCAN_RADIUS *
            2;




        eraseScanProgress(

            x,
            y,
            SCAN_RADIUS,
            scanY

        );



    

        drawScanEffect(

            x,
            y,
            SCAN_RADIUS,
            scanY

        );



        if (progress < 1) {

            requestAnimationFrame(
                animate
            );

        } else {

        
            

            revealedAreas.push({

    x: x / window.innerWidth,
    y: y / window.innerHeight,

    radius: SCAN_RADIUS

});


updateHotspots();


            scanContext.clearRect(
                0,
                0,
                window.innerWidth,
                window.innerHeight
            );

        }

    }


    requestAnimationFrame(
        animate
    );
}




let previousX = -10000;
let previousY = -10000;

let lastScanTime = 0;



veil.addEventListener(
    "pointermove",
    event => {

        const x =
            event.clientX;

        const y =
            event.clientY;


        const distance =
            Math.hypot(

                x - previousX,
                y - previousY

            );


        const currentTime =
            performance.now();



        if (
            distance > SCAN_DISTANCE &&
            currentTime - lastScanTime >
            SCAN_COOLDOWN
        ) {

            scanArea(
                x,
                y
            );


            previousX = x;
            previousY = y;

            lastScanTime =
                currentTime;
        }

    }
);



/* 3 colomuns (move to html?) */



const hotspots = [

    {
        x: 0.25,
        y: 0.35,

        radius: 0.10,

        window:
            "window1"
    },


    {
        x: 0.52,
        y: 0.55,

        radius: 0.10,

        window:
            "window2"
    },


    {
        x: 0.76,
        y: 0.38,

        radius: 0.10,

        window:
            "window3"
    }

];




function isRevealed(x, y) {

    const width =
        window.innerWidth;

    const height =
        window.innerHeight;


    return revealedAreas.some(
        area => {

            const holeX =
                area.x *
                width;

            const holeY =
                area.y *
                height;


            const distance =
                Math.hypot(

                    x - holeX,
                    y - holeY

                );


            return (
                distance <
                area.radius * 0.8
            );

        }
    );

}



/* click */

veil.addEventListener(
    "click",
    event => {

        const x =
            event.clientX;

        const y =
            event.clientY;



     

        if (
            !isRevealed(x, y)
        ) {

            return;
        }



    

        const normalX =
            x /
            window.innerWidth;


        const normalY =
            y /
            window.innerHeight;



        for (
            const hotspot
            of hotspots
        ) {

            const distance =
                Math.hypot(

                    normalX -
                    hotspot.x,

                    normalY -
                    hotspot.y

                );


            if (
                distance <
                hotspot.radius
            ) {

                openWindow(

                    hotspot.window,

                    event.clientX,
                    event.clientY

                );


                return;
            }

        }

    }
);



/* window*/

function openWindow(
    windowID,
    x,
    y
) {

    const popup =
        document.getElementById(
            windowID
        );


    popup.style.display =
        "block";


    

    const popupX =
        Math.min(

            x + 20,

            window.innerWidth -
            350

        );


    const popupY =
        Math.min(

            y + 20,

            window.innerHeight -
            230

        );


    popup.style.left =
        popupX + "px";


    popup.style.top =
        popupY + "px";
}



/* close buttons (not working*/

document
    .querySelectorAll(
        ".close-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                const popup =
                    button.closest(
                        ".info-window"
                    );


                popup.style.display =
                    "none";

            }
        );

    });




document
    .querySelectorAll(
        ".info-window"
    )
    .forEach(popup => {


        const titleBar =
            popup.querySelector(
                ".window-title"
            );


        let dragging =
            false;


        let offsetX =
            0;


        let offsetY =
            0;



        titleBar.addEventListener(
            "pointerdown",
            event => {

                dragging =
                    true;


                const box =
                    popup.getBoundingClientRect();


                offsetX =
                    event.clientX -
                    box.left;


                offsetY =
                    event.clientY -
                    box.top;


                titleBar.setPointerCapture(
                    event.pointerId
                );

            }
        );



        titleBar.addEventListener(
            "pointermove",
            event => {

                if (!dragging) {
                    return;
                }


                popup.style.left =

                    event.clientX -
                    offsetX +
                    "px";


                popup.style.top =

                    event.clientY -
                    offsetY +
                    "px";

            }
        );



        titleBar.addEventListener(
            "pointerup",
            event => {

                dragging =
                    false;


                titleBar.releasePointerCapture(
                    event.pointerId
                );

            }
        );

    });

    



const hotspotData = [

    {
        x: 0.20,   
        y: 0.40,
        size: 100,
        title: "message",
        text: " where is the opt out option? i want to opt out of this.",
        style: "grey"
    },

    {
        x: 0.50,   
        y: 0.40,
        size: 100,
        title: "notice",
        text: "who gets to define a 'good' gene from a 'bad' one?",
        style: "red"
    },

    {
        x: 0.80,   
        y: 0.40,
        size: 100,
        title: "message",
        text: "what happens to us if we offload all our critical thinking to AI?",
        style: "black"
    }

];

const hotspotLayer =
    document.querySelector("#hotspotLayer");




const hotspotElements = [];




hotspotData.forEach(data => {

    const hotspot =
        document.createElement("div");


    hotspot.classList.add("hotspot");


    hotspot.style.left =
        `${data.x * 100}%`;

    hotspot.style.top =
        `${data.y * 100}%`;

    hotspot.style.width =
        `${data.size}px`;

    hotspot.style.height =
        `${data.size}px`;


   

    const popover =
        document.createElement("div");


    popover.classList.add("popover");

if (data.style) {
    popover.classList.add(data.style);
}

    popover.textContent =
        data.text;


    hotspot.appendChild(popover);

    hotspotLayer.appendChild(hotspot);


    hotspotElements.push({

        element: hotspot,

        data: data,

        active: false

    });

});




function updateHotspots() {

    const width = window.innerWidth;
    const height = window.innerHeight;


    hotspotElements.forEach(hotspot => {

        if (hotspot.active) {
            return;
        }


        const hotspotX =
            hotspot.data.x * width;

        const hotspotY =
            hotspot.data.y * height;

        const hotspotRadius =
            hotspot.data.size / 2;


        const uncovered =
            revealedAreas.some(area => {

                const revealX =
                    area.x * width;

                const revealY =
                    area.y * height;


                const distance =
                    Math.hypot(
                        hotspotX - revealX,
                        hotspotY - revealY
                    );


              

                return distance <
                    area.radius +
                    hotspotRadius * 0.4;
            });


        if (uncovered) {

            hotspot.active = true;

            hotspot.element.classList.add(
                "active"
            );

            console.log(
                "ACTIVATED:",
                hotspot.data.text
            );
        }

    });

}