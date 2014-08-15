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
    $drawcon = $('#draw_con');
var firstPageClickTime = 0;
var canMove = false;

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

// 视差
var scene = document.getElementById('scene');
new Parallax(scene);

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
    startP1();
    animatePage(curPage);

    var audioDom = document.getElementById('audioSource');
    audioDom.play();
}

function orientationChange() {
    setTimeout(function() {
        initPage();
    }, 400);
}

$(document).ready(function () {
    setTimeout(function() {
        initPage();
    }, 400);
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
        initP3();
    } else {
    }
}

function startP1() {
    var h = window.innerHeight,
        w = window.innerWidth;
    $canvas.each(function () {
        this.height = h;
        this.width = w;
    });

    $('#p1_w1').addClass('up');

    setTimeout(function() {
        $('#p1_w1').addClass('hide');
        $('#p1_w2').addClass('up');

        setTimeout(function() {
            $('#p1_w2').addClass('hide');
            $('#p1_w3').addClass('up');

            $('#draw-grey').show();

            $('#test_aaa').off('click').on('click', function (e) {
                renderBroken(e);
                $('#test_aaa').off('click');
            });
        }, 2000);
    }, 2000);
}

function renderBroken(e) {
    var opt = $.extend(DEFAULT_OPTIONS, {
        height: $drawcon[0].clientHeight,
        width: $drawcon[0].clientWidth,
        center: {
            x: e.clientX,
            y: e.clientY
        }
    });
    if(firstPageClickTime === 0) {
        opt.radialLines = 5;
        opt.mainline.strength = 1;
    } else if(firstPageClickTime === 1) {
        opt.radialLines = 10;
        opt.mainline.strength = 5;
    } else if(firstPageClickTime === 2) {
        opt.radialLines = 18;
        opt.mainline.strength = 10;

        setTimeout(function() {
            $('#draw-grey,.broken-canvas').remove();
            $('#broke_1').show();
            setTimeout(function() {
                $('#broke_1').hide();
                $('#broke_2').show();
                $('#p1_mask').hide();
                $('#p1_maskb').show();
                setTimeout(function() {
                    $('#broke_1,#broke_2').remove();

                    setTimeout(function() {
                        $('#first_next').show();
                        animatePage(1);
                        canMove = true;
                    }, 500)
                }, 150);
            }, 300);
        }, 150);
    } else {
        return;
    }

    var paths = findCrackEffectPaths(opt);
    clearDrawing($canvas);
    renderCrackEffectAll($canvas, [], paths, opt);

    firstPageClickTime++;

    setTimeout(function() {
        renderBroken(e);
    }, 100);
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

function onMove(e) {
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

var p3_inited = false;
function initP3() {
    if(p3_inited) return;
    p3_inited = true;
    var v4 = new ClkUnit("p3_n_1",0);
    var v3 = new ClkUnit("p3_n_2",0);
    var v2 = new ClkUnit("p3_n_3",0);
    var v1 = new ClkUnit("p3_n_4",5);
    new ClkUnit("p3_n_w", "万");

    setTimeout(function() {
        var v1_it = setInterval(function () {
            var v1_ret = v1.turnDown();
            if (v1_ret >= 10) {
                clearInterval(v1_it);
            }
        }, 300);
    }, 500);

    setTimeout(function() {
        var v2_it = setInterval(function(){
            var v2_ret = v2.turnDown();
            if(v2_ret >= 10) {
                clearInterval(v2_it);
            }
        }, 300);
    }, 1000);

    setTimeout(function() {
        var v3_it = setInterval(function () {
            var v3_ret = v3.turnDown();
            if (v3_ret >= 10) {
                clearInterval(v3_it);
                setTimeout(function () {
                    v4.turnDown();
                }, 300);
            }
        }, 300);
    }, 1500);
}


var clkTopCls = "p3n_top";
var clkBtmCls = "p3n_btm";

function transform(obj, tran) {
    obj.style.WebkitTransform = tran;
    obj.style.transform = tran;
}

var ClkUnit = function(id, val){
    this.update = function() {
        this.updateTxt();
    }
    this.incVal = function() {
        if(this.val === 0) {
            this.val++;
        } else {
            this.val+=2;
        }
        this.update();
    }
    this.updateTxt = function() {
        this.text = this.val >= 10 ? 0 : this.val;
    }
    this.setVal = function(v) {
        this.val = v; this.updateTxt();
    }

    this.pane = document.getElementById(id);
    this.setVal(val);
    this.topbak = document.createElement("div");this.topbak.txt = document.createElement("span");this.topbak.className = clkTopCls;
    this.topfnt = document.createElement("div");this.topfnt.txt = document.createElement("span");this.topfnt.className = clkTopCls;
    this.btmbak = document.createElement("div");this.btmbak.txt = document.createElement("span");this.btmbak.className = clkBtmCls;
    this.btmfnt = document.createElement("div");this.btmfnt.txt = document.createElement("span");this.btmfnt.className = clkBtmCls;
    this.pane.appendChild(this.topbak); this.topbak.appendChild(this.topbak.txt);
    this.pane.appendChild(this.topfnt); this.topfnt.appendChild(this.topfnt.txt);
    this.pane.appendChild(this.btmbak); this.btmbak.appendChild(this.btmbak.txt);
    this.pane.appendChild(this.btmfnt); this.btmfnt.appendChild(this.btmfnt.txt);
    this.mtx = false;

    this.animateReset = function(){
        transform(this.btmfnt,"");
        transform(this.btmbak,"");

        this.btmfnt.txt.innerHTML=this.text;
        this.topbak.txt.innerHTML=this.text;
        this.topfnt.txt.innerHTML=this.text;
        this.btmbak.txt.innerHTML=this.text;

        transform(this.topfnt,"");
        transform(this.topbak,"");
    }

    this.period = null;

    this.turnDown = function(){
        var u = this;
        if(this.mtx) return; //this.mtx = true;
        this.incVal();
        var topDeg = 0;var btmDeg = 90;

        this.topbak.txt.innerHTML=this.text;

        transform(u.topfnt,"rotateX(0deg)");

        var timer1 = setInterval(function(){
            transform(u.topfnt,"rotateX("+topDeg+"deg)"); topDeg-=10;
            if(topDeg<=-90){
                transform(u.topfnt,"rotateX(0deg)");
                u.topfnt.txt.innerHTML=u.text;
                transform(u.btmfnt,"rotateX(90deg)");
                u.btmfnt.txt.innerHTML=u.text;
                var timer2 = setInterval(function(){
                    if(btmDeg<=0) {
                        clearInterval(timer2);u.animateReset(); u.mtx=false;
                    }
                    transform(u.btmfnt,"rotateX("+btmDeg+"deg)"); btmDeg-=10;
                },30);
                clearInterval(timer1);
            }
        },30);

        return this.val;
    }

    this.animateReset();
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