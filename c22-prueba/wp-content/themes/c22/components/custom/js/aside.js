$(window).scroll(function() {
	var windscroll = $(window).scrollTop();
	if (windscroll >= 100) {
		$('.aside-target').each(function(i) {
			if ($(this).position().top <= windscroll + 100) {
				$('aside a.active').removeClass('active');
				$('aside a').eq(i).addClass('active');
			}
		});
	} else {
		$('aside a.active').removeClass('active');
		$('aside a:first').addClass('active');
	}
}).scroll();