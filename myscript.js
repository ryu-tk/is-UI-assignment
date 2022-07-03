var imageX = 0;
var imageY = 0;
var prev_x = 0;
var prev_y = 0;
var zoomScale = 1;

function makeCoord(x, y){
    var coord = {};
    coord.x = x;
    coord.y = y;
    return coord;
}

function coordEqual(c1, c2){
    return (c1.x == c2.x && c1.y == c2.y);

}
function coordLength(c1, c2){
    return (Math.sqrt((c1.x - c2.x) * (c1.x - c2.x) + (c1.y - c2.y) * (c1.y - c2.y)) )
}


function getCanvasCoord(e){
    var canvas = document.getElementById('test_canvas');
        
    // relative to page
    var clickX = e.pageX;
    var clickY = e.pageY;

    var canvasRect = canvas.getBoundingClientRect();
    var canvasX = canvasRect.left + window.pageXOffset;
    var canvasY = canvasRect.top + window.pageYOffset;

    return makeCoord(
        (clickX - canvasX),
        (clickY - canvasY)
    );
}

// relative to Image origin, and when zoom scale == 1
function getImageCoord(e){
    var canvas = document.getElementById('test_canvas');
        
    // relative to page
    var clickX = e.pageX;
    var clickY = e.pageY;

    var canvasRect = canvas.getBoundingClientRect();
    var canvasX = canvasRect.left + window.pageXOffset;
    var canvasY = canvasRect.top + window.pageYOffset;

    return makeCoord(
        Math.round((clickX - canvasX) / zoomScale  - imageX + 0.5),
        Math.round((clickY - canvasY)/ zoomScale   - imageY + 0.5)
    );
}


function addDot(e){
    var imageClick = getImageCoord(e);

    if (selectedDots.some((item) => coordEqual(item, imageClick))){
        selectedDots = selectedDots.filter(
            (item) => !(coordEqual(item, imageClick))
        );
    } else{
        selectedDots.push(imageClick);
    }
    
}

// delete
function isDeleteMode(e){
    return e.shiftKey && e.which == 1
}
var clearingCenter = makeCoord(-1, -1);
var clearingRadius = 5;

function setClearingRegion(e){
    clearingCenter = getImageCoord(e);
    clearingRadius = 5;
}

function clearDots(){
    selectedDots = selectedDots.filter(
        (item) => !(coordLength(item, clearingCenter) < clearingRadius)
    );

}


// zoom
function isZoomInMode(e){
    return e.ctrlKey;
}
function isZoomOutMode(e){
    return e.altKey;
}

var scalingFactor = 3;
function incrZoomScale(e){
   

    var canvas = document.getElementById('test_canvas');
    var context = canvas.getContext('2d');
    context.scale(scalingFactor, scalingFactor);
    zoomScale *= scalingFactor;

    clickPoint = getCanvasCoord(e);
    imageX -= clickPoint.x * (scalingFactor  - 1) / zoomScale;
    imageY -= clickPoint.y * (scalingFactor  - 1) / zoomScale


}
function decrZoomScale(e){
    var canvas = document.getElementById('test_canvas');
    var context = canvas.getContext('2d');
    context.scale(1 / scalingFactor, 1 / scalingFactor);
    zoomScale /= scalingFactor;

    clickPoint = getCanvasCoord(e);
    imageX -= clickPoint.x * (1 / scalingFactor - 1) / zoomScale;
    imageY -= clickPoint.y * (1 / scalingFactor - 1) / zoomScale;
}

function resetZoomScale(e){
    var canvas = document.getElementById('test_canvas');
    var context = canvas.getContext('2d');
    context.scale(1 / zoomScale, 1 / zoomScale);
    
    clickPoint = getCanvasCoord(e);
    imageX -= clickPoint.x * (1 / zoomScale - 1) ;
    imageY -= clickPoint.y * (1 / zoomScale - 1) ;

    zoomScale = 1;

}

function MouseDown(e) {
    prev_x = e.pageX;
    prev_y = e.pageY;

    if(e.buttons == 1){
        if(isDeleteMode(e)){
            setClearingRegion(e);
        }
        else{
            addDot(e);
        }
    }
    else if(e.buttons == 2){
        if(isZoomInMode(e)){
            incrZoomScale(e);
        }else if(isZoomOutMode(e)){
            //decrZoomScale(e);
            resetZoomScale(e);

        }
    }
    repaint(e);
}

function MouseMove(e) {
    if (e.buttons == 1 && isDeleteMode(e)){
        setClearingRegion(e);
        clearDots();
    }
    if (e.buttons == 2){
        imageX += (e.pageX - prev_x) / zoomScale;
        imageY += (e.pageY - prev_y) / zoomScale;
        prev_x = e.pageX;
        prev_y = e.pageY;
        
    }
    repaint(e);
}

function MouseUp(event){

    return;
}


var timeCount = -1;
function incrTimeCount(){
    timeCount += 1;
}

function writeTime(){
    var canvas = document.getElementById('test_canvas');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, 300 / zoomScale, 30 / zoomScale);

    context.font 
        = "bold " + String(32 / zoomScale) + "px 'MS PGothic', san-serif";
        // = " san-serif";

    var writeText = "Time: " + String(timeCount) +
        " Dots: " + String(selectedDots.length);
    
    context.fillStyle = 'rgba(0, 0, 0, 255)';
    context.fillText(writeText, 10 / zoomScale, 26 / zoomScale);

}

var selectedDots = [];
function repaint(e){
    var canvas = document.getElementById('test_canvas');
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width / zoomScale, canvas.height / zoomScale);
    context.drawImage(original_image, imageX, imageY);
    
    // time
    writeTime();
    if(timeCount == -1){
        timeCount = 0;
        setInterval(incrTimeCount, 1000);
    }

    // selectedDot
    context.fillStyle = 'rgba(255, 0, 0, 255)';
    
    selectedDots.forEach(dot => {
        console.log(imageX); console.log(dot.x);
        console.log(imageX + dot.x - 1.0, imageY +dot.y - 1);
        context.fillRect(imageX + dot.x - 1, imageY +dot.y - 1, 1, 1);
    });

    // clearing
    if(isDeleteMode(e)){
        context.fillStyle = 'rgba(128, 128, 128, 0.5)';
        // context.beginPath();
        // context.arc(clearingCenter.x + imageX, clearingCenter.y + imageY,
        //                 clearingRadius, 0, Math.PI*2, false);
        // context.fill();

        var region = ([...Array(2 * clearingRadius + 1).keys()]).map((x) => x - clearingRadius);
        region.forEach((x) =>
            region.forEach((y) =>{
                if (x * x + y * y < clearingRadius * clearingRadius){
                    context.fillRect(x + clearingCenter.x + imageX - 1,
                                     y + clearingCenter.y + imageY - 1, 1, 1); 
                }
            })
        );
    }
    
        



}
var original_image;

function onImageSetted(e) {
    var cv = document.getElementById('test_canvas');
    cv.width = e.target.width;
    cv.height = e.target.height;

    cv.getContext('2d').drawImage(original_image, 0, 0);
    cv.getContext('2d').imageSmoothingEnabled = false;
    writeTime();
}


window.onload = function () {
    original_image = new Image();

    original_image.onload = onImageSetted;
    original_image.src = "image.jpg";

}
