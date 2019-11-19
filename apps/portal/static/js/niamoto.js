// Change style of navbar on scroll
window.onscroll = function () {
  myFunction()
}

function myFunction () {
  var navbar = document.getElementById('navbar')

  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    navbar.className = 'navbar navbar-expand-md navbar-light bg-light  btco-hover-menu  fixed-top w3-animate-top'
  } else {
    navbar.className = navbar.className.replace('w3-animate-top', '')
    navbar.className = navbar.className.replace('bg-light', 'bg-bandeau-default')
    navbar.className = navbar.className.replace('navbar-light', 'navbar-dark')
  }
}

/*!
 * Bootstrap 4 multi dropdown navbar ( https://bootstrapthemes.co/demo/resource/bootstrap-4-multi-dropdown-navbar/ )
 * Copyright 2017.
 * Licensed under the GPL license
 */

$(document).ready(function () {
  $('.dropdown-menu a.dropdown-toggle').on('click', function (e) {
    var $el = $(this)
    var $parent = $(this).offsetParent('.dropdown-menu')
    if (!$(this).next().hasClass('show')) {
      $(this).parents('.dropdown-menu').first().find('.show').removeClass('show')
    }
    var $subMenu = $(this).next('.dropdown-menu')
    $subMenu.toggleClass('show')

    $(this).parent('li').toggleClass('show')

    $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
      $('.dropdown-menu .show').removeClass('show')
    })

    if (!$parent.parent().hasClass('navbar-nav')) {
      $el.next().css({
        top: $el[0].offsetTop,
        left: $parent.outerWidth() - 4
      })
    }

    return false
  })
})
