window.onerror = function(sMessage, sUrl, sLine){
    alert(sMessages)
};
// 以下是拖动效果
var startX = 0,
    startY = 0,
    margin = 0;
var pages = null;
var curPage = 0;
var pageWidth = 0,
    pageHeight = 0;
var scrollPrevent = false, movePrevent = false, touchDown = false;
var $canvas = $('.broken-canvas'),
    $image = $('#draw-image');
var firstPageClickTime = 0;
var canMove = false;
var clockInterval;

document.body.addEventListener('touchstart', function (e) {
    if(canMove) {
        e = e.changedTouches[0];
        onStart(e);
    }
});

document.body.addEventListener('touchmove', function (e) {
    if(canMove) {
        onMove(e.changedTouches[0], e);
    }
});

document.body.addEventListener('touchend', function (e) {
    if(canMove) {
        onEnd(e.changedTouches[0]);
    }
});

// 翻转的绑定
window.onorientationchange = orientationChange;

function initPage() {
    pageWidth = window.innerWidth;
    pageHeight = window.innerHeight;
    pages = $(".wrap section");
    $(".bg .bg_sec").css("height", pageHeight);

    $(".wrap section").css({
        "width": pageWidth + "px",
        "height": pageHeight + "px"
    });

    $(".sec").addClass("drag");
    initFirstPageSize();
    animatePage(curPage);
}

function orientationChange() {
    initPage();
}

$(document).ready(function () {
    setTimeout(function() {
        initPage();

        // 视差
        var scene = document.getElementById('scene');
        var parallax = new Parallax(scene);
    }, 400)
});

function prevPage() {
    var newPage = curPage - 1;
    animatePage(newPage);

}
function nextPage() {
    var newPage = curPage + 1;
    animatePage(newPage);
}

function animatePage(newPage) {
    if (newPage < 0) {
        newPage = 0;
    }
    if (newPage > $(".wrap section").length - 1) {
        newPage = $(".wrap section").length - 1;
    }

    curPage = newPage;
    var newMarginTop = newPage * (-pageHeight);
    $(".sec").css({
        "-webkit-transform": "matrix(1, 0, 0, 1, 0, " + newMarginTop + ")"
    });

    movePrevent = true;
    setTimeout("movePrevent=false;", 300);

    // 每页动画
    if (!$(pages[curPage]).hasClass("sec0" + (curPage + 1) + "_show")) {
        $(pages[curPage]).addClass("sec0" + (curPage + 1) + "_show");
    }
    $(pages[curPage - 1]).removeClass("sec0" + (curPage) + "_show");
    $(pages[curPage + 1]).removeClass("sec0" + (curPage + 2) + "_show");

    if(curPage == 2) {
        setTimeout(fastRotate, 500);
    } else {
    }
}

function initFirstPageSize() {
    var h = window.innerHeight,
        w = window.innerWidth;
    $canvas.each(function () {
        this.height = h;
        this.width = w;
    });
    $('#draw-grey').width(w).height(h);

    $('#test_aaa').off('click').on('click', function (e) {
        renderBroken(e);
        $('#test_aaa').off('click');
    });
}

function renderBroken(e) {
    var opt = $.extend(DEFAULT_OPTIONS, {
        height: $image[0].clientHeight,
        width: $image[0].clientWidth,
        center: {
            x: e.clientX,
            y: e.clientY
        }
    });
    if(firstPageClickTime === 0) {
        opt.radialLines = 5;
        opt.mainline.strength = 1;
        $('#draw-image').attr('src', '../img/test/P2.png');
    } else if(firstPageClickTime === 1) {
        opt.radialLines = 10;
        opt.mainline.strength = 5;
        $('#draw-image').attr('src', '../img/test/P3.png');
    } else if(firstPageClickTime === 2) {
        opt.radialLines = 18;
        opt.mainline.strength = 10;

        setTimeout(function() {

            $('#draw-grey,.broken-canvas').remove();
            $('#draw-image').attr('src', '../img/test/P4.png');
            canMove = true;
        }, 100);
    } else {
        return;
    }

    var paths = findCrackEffectPaths(opt);
    clearDrawing($canvas);
    renderCrackEffectAll($canvas, $image, paths, opt);

    firstPageClickTime++;

    setTimeout(function() {
        renderBroken(e);
    }, 50);
}

function clearDrawing($canvas) {
    $canvas.each(function () {
        var ctx = this.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    });
}

function onStart(e) {
    if (movePrevent == true) {
        event.preventDefault();
        return false;
    }
    if ($(e.target).parents("#container").length == 1) {
        scrollPrevent = true;
    } else {
        scrollPrevent = false;
    }

    touchDown = true;

    // 起始点，页面位置
    startX = e.pageX;
    startY = e.pageY;

    $(".sec").addClass("drag");

    margin = $(".sec").css("-webkit-transform");
    margin = margin.replace("matrix(", "");
    margin = margin.replace(")", "");
    margin = margin.split(",");
    margin = parseInt(margin[5]);
}

function onMove(e, oe) {
    if (movePrevent == true || touchDown != true) {
        event.preventDefault();
        return false;
    }
    event.preventDefault();
    if (scrollPrevent == false && e.pageY != startY) {
        var temp = margin + e.pageY - startY;
        $(".sec").css("-webkit-transform", "matrix(1, 0, 0, 1, 0, " + temp + ")");
    }
}

function onEnd(e) {
    if (movePrevent == true) {
        event.preventDefault();
        return false;
    }

    touchDown = false;

    if (scrollPrevent == false) {
        // 抬起点，页面位置
        endX = e.pageX;
        endY = e.pageY;
        // swip 事件默认大于50px才会触发，小于这个就将页面归回
        if (Math.abs(endY - startY) <= 50) {
            animatePage(curPage);
        } else {
            if (endY > startY) {
                prevPage();
            } else {
                nextPage();
            }
        }
    }
    $(".sec").removeClass("drag");
}

function fastRotate() {
    var $sp = $('#sec_pointer'),
        orv = parseInt($sp.data('rv'));
    if(orv >= 270) return;
    var rv = orv + 10;
    $sp.data('rv', rv);
    $sp.css('-webkit-transform', 'rotate(' + rv + 'deg)');
    requestAnimationFrame(fastRotate);
}

var DEFAULT_OPTIONS = {
    circles: 10,
    curves: 10,
    debug: false,
    density: 50,
    diagonals: 20,
    fractures: {
        decay: 100,
        opacity: 40,
        size: 20
    },
    mainColor: "rgb(255, 255, 255)",
    mainline: {
        decay: 90,
        highlight: 20,
        offset: 5,
        opacity: 65
    },
    noise: {
        decay: 5,
        freq: 40,
        opacity: 100
    },
    reflect: {
        opacity: 30
    },
    refract: {
        opacity: 80,
        shift: 6,
        size: 3
    },
    wander: 10
};