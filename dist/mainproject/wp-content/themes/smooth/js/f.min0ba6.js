var view = view || {},
    events = events || {},
    utils = utils || {},
    windowObj = {},
    gridDrag = !1,
    movement = 500,
    prevY, prevX = 0,
    storeColor = -1,
    scrollTimer, lastScrollPosX, lastScrollPosY, lastScrollFireTime = 0,
    gridUpdate = 50,
    grid, projectClickLeft = 0,
    projectClickTop = 0,
    projectClickRadius = 5,
    ignoreHitarea = !1,
    iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform),
    faviconString =
    "data:image/png;".split(" ");

view.init = function() {
    "/" !== location.pathname ? (history.pushState({
        url: location.pathname
    }, "limitless " + location.pathname, location.pathname), view.direct(location.pathname)) : history.pushState({
        url: "/"
    }, "limitless", "/");
    "scrollRestoration" in history && (history.scrollRestoration = "manual");
    grid = $("aside.projects nav").masonry({
        columnWidth: 2000,
        itemSelector: "aside.projects nav a"
    });
    grid.masonry();
    $(window).resize(function() {
        view.resizer()
    });
    view.resizer();
    view.introCenter();
    view.introVideo();
    view.favicon()
};
view.resizer = function() {
    windowObj.w = $(window).width();
    windowObj.h = $(window).height();
    storeColor = -3
};
view.preload = function() {
    var a = $("body img").length,
        b = 0;
    $("body img").each(function(c) {
        c = new Image;
        c.onload = function() {
            b++;
            b == a && $("body").addClass("loaded")
        };
        c.src = $(this).attr("src")
    })
};
view.direct = function(a) {
    view.lazyLoadGrid();
    $("body").hasClass("page-template-page-project") && $("article section:eq(0)").addClass("peek")
};

view.load = function(a, b) {
    var c = window.location.pathname.replace(/^\/|\/$/g, "");
    if ("" == c) $("article").css({
        opacity: 0,
        display: "none"
    }).html(""), $("article").removeClass("press up"), $("body").removeClass("page-template-page-project project page-template-page-about about"), window.scrollTo(0, 0);
    else {
        var f = c.toLowerCase(); - 1 !== f.indexOf("/") && (f = "project");
        view.loadStart();
        $.ajax({
            url: ajax_object.ajax_url,
            type: "post",
            data: {
                action: "page_load",
                url: c
            },
            success: function(d) {
                if (0 !== d) {
                    $("body").addClass(f);
                    $("article").css({
                        opacity: 0,
                        display: "block"
                    }).html(d);
                    $("article header h1, article header a, article section.about div h1").css({
                        opacity: 0
                    });

                    d = document.querySelectorAll("article img[sizes], article source[sizes]");
                    for (var e = 0; e < d.length; e++) d[e].sizes += "";
                    if (b)
                        if (a[0].hasAttribute("style") && "none" !== a.css("transform") ? (d = a.css("transform").split("(")[1], d = d.split(")")[0], d = d.split(","), scale = d[0], $("article section .zoom").css({
                                top: a.offset().top,
                                left: a.offset().left,
                                width: a.find("span").first().width(),
                                height: a.find("span").first().height(),
                                transform: "matrix(" + scale + ", 0, 0," + scale + ", 0, 0 )"
                            })) : $("article section .zoom").css({
                                top: a.offset().top,
                                left: a.offset().left,
                                width: a.find("span").first().width(),
                                height: a.find("span").first().height()
                            }), a.find("video").length) {
                            var g = a.find("video")[0].currentTime,
                                h = $("article .zoom video")[0];
                            h.load();
                            var k = function() {
                                h.play();
                                h.currentTime = g;
                                setTimeout(function() {
                                    view.loadScale(f)
                                }, 500);
                                h.removeEventListener("loadedmetadata", k)
                            };
                            h.addEventListener("loadedmetadata", k)
                        } else $("article .zoom img").on("load",
                            function() {
                                setTimeout(function() {
                                    view.loadScale(f)
                                }, 100)
                            });
                    else $("article").css({
                        opacity: 1
                    }), view.loadStop()
                }
            },
            fail: {}
        });
        return !1
    }
};

view.introVideo = function() {
    $("aside.cover video").length && $("aside.cover video").get(0).addEventListener("loadeddata", function() {
        $("aside.cover span").remove()
    })
};

view.introCenter = function() {
    if ($(".projects nav a.active").length) var a = $(".projects nav a.active");
    $("article header").length && (a = $('.projects nav a[data-title="' + $("article header").data("title") + '"]'));
    if (a.length) {
        var b = a.offset().top - a.parent().offset().top - windowObj.h / 2 + a.find("span").first().outerHeight() / 2,
            c = a.offset().left - a.parent().offset().left - windowObj.w / 2 + a.find("span").first().outerWidth() / 2;
        $(".projects").scrollTop(b);
        $(".projects").scrollLeft(c);
        $(".projects nav").css({
            "background-color": a.data("color")
        })
    }
    $("article header").length &&
        events.projectsScroll()
};

view.inViewport = function(a, b, c) {
    view.rect = a.getBoundingClientRect();
    view.html = document.documentElement;
    return view.rect.top >= 0 - b && view.rect.left >= 0 - c && view.rect.bottom <= (window.innerHeight || view.html.clientHeight) + b && view.rect.right <= (window.innerWidth || view.html.clientWidth) + c
};

view.loadProjectsSequence = function() {
    var a = $(".projects nav a span img").length,
        b = $(".projects nav a span video").length,
        c = a + b,
        f = imgCounter = vidCounter = 0,
        d = setInterval(function() {
            console.log(f);
            f >= c ? (console.log("loaded"), clearInterval(d), view.introCenter()) : ($(".projects nav a span img").each(function(e) {
                if (e == imgCounter) {
                    var g = $(this);
                    g.hasClass("load") || (g.addClass("load"), g.on("load", function() {
                        imgCounter++;
                        f++;
                        g.addClass("loaded")
                    }).each(function() {
                        if (this.complete || void 0 === this.complete) {
                            var h =
                                this.src;
                            this.src = "";
                            this.src = h
                        }
                    }))
                }
            }), imgCounter == a && $(".projects nav a span video").each(function(e) {
                e == vidCounter && (e = $(this), e.hasClass("load") || (e.addClass("load"), e.attr("preload", "auto"), e[0].pause(), e[0].load()), 4 !== e[0].readyState || e.hasClass("loaded") || (vidCounter++, f++, e.addClass("loaded")))
            }))
        }, 100)
};

view.lazyLoadGrid = function() {
    $(".projects nav a img").each(function(a) {
        a = $(this);
        var b = a.height(),
            c = a.width();
        view.inViewport(a[0], b, c) && !a.hasClass("loaded") && (a.addClass("loaded"), a.attr("src", a.data("src")), a.attr("srcset", a.data("srcset")), a.removeAttr("data-src"), a.removeAttr("data-srcset"))
    });

    $(".projects nav a video").each(function(a) {
        var b = $(this),
            c = b.get(0);
        a = b.height();
        var f = b.width();
        if (view.inViewport(c, a, f)) {
            if (!b.hasClass("loading") && !b.hasClass("loaded")) {
                c.load();
                b.addClass("loading");
                var d = function() {
                    b.removeClass("loading");
                    b.addClass("loaded");
                    c.removeEventListener("loadedmetadata", d)
                };
                c.addEventListener("loadedmetadata", d)
            }
            b.hasClass("loaded") && c.paused && c.play()
        } else b.hasClass("loaded") && !c.paused && c.pause()
    })
};

view.favicon = function() {
    var a = 0,
        b = faviconString.length;
    setInterval(function() {
        a < b - 1 ? a++ : a = 0;
        document.querySelector('link[rel="icon"]').href = faviconString[a]
    }, 100)
};
events.init = function() {
    window.onpopstate = function(a) {
        a.state && view.load(!1, !1)
    };
    $(window).scroll(function() {
        events.scroll()
    });
    $("body > header a.index").click(function(a) {
        a.preventDefault();
        $("body").addClass("index");
        $(".projects nav a").css("opacity", "")
    });
    $("body > header a.about").click(function(a) {
        a.preventDefault();
        a = $(".projects nav a").last();
        var b = parseInt(a.css("top"), 10) - windowObj.h / 2 + a.find("span").first().height() / 2,
            c = parseInt(a.css("left"), 10) - windowObj.w / 2 + a.find("span").first().width() /
            2;
        $(".projects").stop(!0, !1).scrollTop(b).scrollLeft(c);
        ignoreHitarea = !0;
        a.mouseup();
        ignoreHitarea = !1
    });
    $(".cover").click(function(a) {
        a.preventDefault();
        $("body").addClass("");
        $(".projects nav a.active");
        a = $(".projects nav a.active span:eq(0)").outerWidth();
        var b = $(".projects nav a.active span:eq(0)").outerHeight();
        $("aside.cover").css({
            width: a,
            height: b,
            top: $(".projects nav a.active").offset().top,
            left: $(".projects nav a.active").offset().left
        });
        $(".projects nav a").css({
            opacity: 0
        });
        setTimeout(function() {
            $(".cover").remove();
            $(".projects nav a");
            var c = $(".projects nav a.active").index();
            $(".projects nav a").each(function(f) {
                f < c ? $(this).stop(!0, !1).delay(40 * (c - f)).animate({
                    opacity: 1
                }, {
                    duration: 400
                }) : f > c ? $(this).stop(!0, !1).delay(40 * (f - c)).animate({
                    opacity: 1
                }, {
                    duration: 400
                }) : $(this).stop(!0, !1).css({
                    opacity: 1
                })
            });
            events.projectsScroll()
        }, 1400)
    });
    if (!utils.is_touch_device()) $(".projects nav").on("mousedown", function(a) {
        gridDrag = !0;
        var b = $(this).addClass("drag");
        height = b.outerHeight();
        width = b.outerWidth();
        max_left = b.parent().offset().left +
            b.parent().width() - b.width();
        max_top = b.parent().offset().top + b.parent().height() - b.height();
        min_left = b.parent().offset().left;
        min_top = b.parent().offset().top;
        ypos = $(this).offset().top;
        xpos = $(this).offset().left;
        startYpos = a.pageY;
        startXpos = a.pageX;
        $(".projects").on("mousemove", function(c) {
            b.hasClass("drag") && ($(".projects").scrollTop(-ypos + (startYpos - c.pageY)), $(".projects").scrollLeft(-xpos + (startXpos - c.pageX)))
        }).on("mouseup", function(c) {
            b.removeClass("drag");
            gridDrag = !1
        })
    });
    $(".projects").scroll(function(a) {
        events.projectsScroll()
    });
    $(".projects nav a").click(function(a) {
        a.preventDefault()
    });
    $(".projects nav a").on({
        mousedown: function(a) {
            projectClickLeft = a.pageX;
            projectClickTop = a.pageY
        },
        mouseup: function(a) {
            var b = a.pageX - projectClickLeft;
            a = a.pageY - projectClickTop;
            if (Math.sqrt(b * b + a * a) < projectClickRadius || ignoreHitarea) b = $(this).attr("href"), a = $(this), history.pushState({
                url: b
            }, "limitless" + b, b), view.load(a, !0)
        }
    });
    $("aside.index nav a").mouseenter(function(a) {
        $("aside.index nav a").css({
            opacity: .5
        });
        $(this).css({
            opacity: 1
        });
        var b = $('.projects nav a[data-title="' +
            $(this).text() + '"]');
        b.hasClass("sharp") || b.addClass("sharp");
        a = parseInt(b.css("top"), 10) - windowObj.h / 2 + b.find("span").first().height() / 2;
        b = parseInt(b.css("left"), 10) - windowObj.w / 2 + b.find("span").first().width() / 2;
        $(".projects").stop(!0, !1).scrollTop(a).scrollLeft(b);
        prevY = a;
        prevX = b
    });
    $("aside.index nav a").mouseleave(function(a) {
        $("body").hasClass("loading") || $(".projects nav a").removeClass("sharp");
        $("aside.index nav a").css({
            opacity: 1
        })
    });
    $("aside.index nav a").click(function(a) {
        a.preventDefault();
        a = $(this).attr("href");
        var b = $('.projects nav a[data-title="' + $(this).text() + '"]');
        history.pushState({
            url: a
        }, "limitless" + a, a);
        view.load(b, !0)
    });
    $("aside.index header a").click(function(a) {
        a.preventDefault();
        $(".index").removeAttr("style");
        $("body").removeClass("index");
        $("aside.index nav a").removeAttr("style")
    });
    $("article").on("click", "header a, footer", function(a) {
        a.preventDefault();
        $("article").fadeOut(400, "easeOutCubic", function() {
            history.pushState({
                url: "/"
            }, "limitless/", "/");
            view.load(!1, !1)
        })
    })
};

events.scroll = function() {
    0 < $("article section").length && events.articleScroll()
};
events.lazyLoad = function() {
    $("img").each(function(a) {
        yPos = $(this).offset().top - $(window).scrollTop() - 1 * windowObj.h;
        0 > yPos && ($(this).hasClass("loaded") || $(this).on("load", function() {
            $(this).addClass("loaded")
        }).attr("src", $(this).data("src")))
    })
};

events.projectsScroll = function() {
    function a() {
        $(".projects nav a").each(function(c) {
            var f = $(this).offset().left,
                d = $(this).offset().top,
                e = $(this)[0].getBoundingClientRect().width,
                g = $(this)[0].getBoundingClientRect().height;
            c = Math.floor(Math.sqrt(Math.pow(d + g / 2 - windowObj.h / 2, 2) + Math.pow(f + e / 4 - windowObj.w / 4, 2)));
            var h = Math.round(c / 4E4 * movement);
            f = windowObj.w / 2 > f + e / 2 ? -h : h;
            d = windowObj.h / 2 > d + g / 2 ? -h : h;
            c = Number((1 - c / 3E3).toFixed(1));
            .2 > c && (c = .2);
            1 < c && (c = 1);
            $(this).css({
                transform: "matrix( " + c + ", 0, 0," + c +
                    ", " + f + "," + d + ")"
            });
            !$("aside.cover").hasClass("active") && 0.8 < c && !$(this).hasClass("active") && ($(".projects nav a").removeClass("active"), $(this).hasClass("active"), "undefined" !== typeof $(this).data("color") ? $(".projects nav").css({
                "background-color": $(this).data("color")
            }) : $(".projects nav").css({
                "background-color": "#fff"
            }))
        });
        view.lazyLoadGrid()
    }
    var b = (new Date).getTime();
    scrollTimer || (b - lastScrollFireTime > 3 * gridUpdate && (a(), lastScrollFireTime = b, lastScrollPosY = $(".projects").scrollTop(), lastScrollPosX =
        $(".projects").scrollLeft()), scrollTimer = setTimeout(function() {
        scrollTimer = null;
        lastScrollFireTime = (new Date).getTime();
        var c = $(".projects").scrollTop(),
            f = $(".projects").scrollLeft();
        c === lastScrollPosY && f === lastScrollPosX || a();
        lastScrollPosY = c;
        lastScrollPosX = f
    }, gridUpdate))
};

events.articleScroll = function() {
    var a = $(window).scrollTop(),
        b = 0;
    $("main article section").each(function() {
        b += $(this).outerHeight()
    });
    var c = windowObj.h;
    iOS && (c = $("main article .zoom").parent().height());
    b -= c;
    5 < a ? $("article header").hasClass("fade") || $("article header").addClass("fade") : $("article header").hasClass("fade") && $("article header").removeClass("fade");
    if (!$("body").hasClass("preventLoad")) {
        0 < $("article .slides").length && $("article .slides > div").each(function(d) {
            yPos = $(this).offset().top -
                $(window).scrollTop();
            start = .5 * windowObj.h;
            end = .5 * windowObj.h;
            yPos <= start && yPos + $(this).height() >= end ? $(this).hasClass("show") || $(this).addClass("show") : $(this).hasClass("show") && $(this).removeClass("show")
        });
        0 < $("article .slides").length && (a > $("article .slides > div:eq(0)").offset().top - windowObj.h / 2 ? 760 > windowObj.w ? $("article .slides > div > div").each(function(d) {
            var e = $(this).offset().top,
                g = $(this).offset().top - windowObj.h / 2;
            e = e + $(this).outerHeight() - windowObj.h / 2;
            a > g && a < e && d !== storeColor && ($("article .slides").css({
                    "background-color": $(this).data("color")
                }),
                storeColor = d)
        }) : $("article .slides > div").each(function(d) {
            var e = $(this).offset().top,
                g = $(this).offset().top - windowObj.h / 2;
            e = e + $(this).outerHeight() - windowObj.h / 2;
            a > g && a < e && d !== storeColor && ($("article .slides").css({
                "background-color": $(this).find("> div:first-child").data("color")
            }), storeColor = d)
        }) : -1 !== storeColor && ($("article .slides").css({
            "background-color": "#fff"
        }), storeColor = -1));
        0 < $("article .slides").length && $("article .slides video.autoplay").each(function(d) {
            d = $(this).get(0);
            var e = $(this).height();
            view.inViewport(d, e, 0) ? 0 < d.currentTime && !d.paused && !d.ended && 2 < d.readyState || d.play() : d.paused || d.pause()
        });
        if (0 < $("article .about").length) {
            var f = $("article .about > div:eq(1) h1");
            200 > a ? (f.hasClass("end") && f.removeClass("end"), yMove = a - 200, scale = 760 <= windowObj.w ? .3 + a / 200 * .7 : .65 + a / 200 * .35, f.css({
                transform: "matrix( " + scale + ", 0, 0," + scale + ", 0," + yMove + ")"
            })) : f.hasClass("end") || (f.addClass("end"), f.css({
                transform: "matrix( 1, 0, 0, 1, 0, 0)"
            }));
            $("article .about > div").each(function(d) {
                var e = $(this).offset().top,
                    g = $(this).offset().top - windowObj.h / 2;
                e = e + $(this).outerHeight() - windowObj.h / 2;
                a > g && a < e && d !== storeColor && ($("article .about").css({
                    "background-color": $(this).data("color")
                }), storeColor = d)
            })
        }
        0 < $("article .press").length && (a > $("article .press").position().top - windowObj.h / 2 ? $("article").hasClass("press") || $("article").addClass("press") : $("").hasClass("press") && $("article").removeClass("press"))
    }
    a > b ? (f = Math.floor(100 * (1 - (a - b) / c)) / 100, $("article footer").css({
            opacity: f
        }), $("article").hasClass("up") ||
        $("article").addClass("up"), a > b + c - 1 && (history.pushState({
            url: "/"
        }, "limitless/", "/"), view.load(!1, !1))) : $("article").hasClass("up") && $("article").removeClass("up")
};
utils.is_touch_device = function() {
    try {
        return document.createEvent("TouchEvent"), !0
    } catch (a) {
        return !1
    }
};
$(document).ready(function() {
    view.init();
    events.init()
});
