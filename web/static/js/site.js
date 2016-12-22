/*!
 * Start Bootstrap - SB Admin 2 v3.3.7+1 (http://startbootstrap.com/template-overviews/sb-admin-2)
 * Copyright 2013-2016 Start Bootstrap
 * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap/blob/gh-pages/LICENSE)
 */
$(function() {
    $('#side-menu').metisMenu();
});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {

    function size_wrapper() {
        var win = window;
        var topOffset = document.getElementById('navbar').offsetHeight;
        var bottomOffset = document.getElementById('site-footer').offsetHeight
            + document.getElementById('footer-hr').offsetHeight
            + document.getElementById('pre-footer').offsetHeight;
        var width = (win.window.innerWidth > 0) ? win.window.innerWidth : win.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((win.window.innerHeight > 0) ? win.window.innerHeight : win.screen.height) - 1;
        height = height - topOffset - bottomOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
        $(".fill_parent_height").each(function(i, obj) {
            var parent_height = $(obj).parent().height();
            $(obj).css("min-height", parent_height + "px");
        });
    }

    $(window).bind("load resize", size_wrapper);
    $(document).bind("ready", size_wrapper);

    var url = window.location;
    // var element = $('ul.nav a').filter(function() {
    //     return this.href == url;
    // }).addClass('active').parent().parent().addClass('in').parent();
    var element = $('ul.nav a').filter(function() {
        if (this.getAttribute("href") == '/') {
            return false;
        }
        return url.pathname.search(new RegExp(this.getAttribute("href") + "[^#]*$", 'i')) >= 0;
    }).addClass('active').parent();

    while (true) {
        if (element.is('li')) {
            element = element.parent().addClass('in').parent();
        } else {
            break;
        }
    }
});
