$('document').ready(function(){

	sidebar();
	$('.slick-next').html('<img src="/ep-prueba/plugins/themes/ceptheme/img/arrow-right-new.png">'); 
  	$('.slick-prev').html('<img src="/ep-prueba/plugins/themes/ceptheme/img/arrow-left-new.png">');
});
 
var contador2 = 1;
/*function setSuscription(){ 
	let name_newsletter = $('#fide-embed-form > [name="subscription[firstName]"]').val();
	let lastname_newsletter = $('#fide-embed-form > [name="subscription[lastName]"]').val();
	let email_newsletter = $('#fide-embed-form > [subscription[email]]').val();
    $.get('/ep-prueba/ep-datos/desactivado.json'+name_newsletter+'&apellido='+lastname_newsletter+'&email='+email_newsletter+'', function(data){
        console.log(data.status);
    })
}*/				 
function sidebar(){
		
	$('.btn-sidebar').click(function(){
			 
		if (contador2 == 1) {
				
			$('.sidebar-responsive').animate({
				
				right: '0',
								
			});
			
			contador2 = 0;

			$('body').css('pointer-events', 'none');
			$('body').css('overflow', 'hidden');
			$('.btn-sidebar').css('pointer-events', 'auto').css('background-image','url(/ep-prueba/plugins/themes/ceptheme/img/x.png)').css('background-size','20px');
			$('.sidebar-responsive').css('pointer-events', 'auto');
			$('.sidebar-responsive').css('overflow', 'auto');
				
		} else {
				
			contador2 = 1;
				
			$('.sidebar-responsive').animate({
				
				right: '-200%'
				
			});

			$('body').css('pointer-events', 'auto');
			$('body').css('overflow', 'auto');
			$('.btn-sidebar').css('pointer-events', 'auto').css('background-image','url(/ep-prueba/plugins/themes/ceptheme/img/user.svg)').css('background-size','30px');
			$('.sidebar-responsive').css('pointer-events', 'auto');
			$('.sidebar-responsive').css('overflow', 'auto');
				
		}
			 
	});
			 
};



		
// AGREGAR DIFUMINADO
/*function openFilter() {

    $('.container').addClass('blur');

    $('.container').css('pointer-events', 'none');

    $('body').css('overflow', 'hidden');

}

// QUITAR DIFUMINADO
function cerrarSidebar() {

    $('.container').removeClass('blur');

    $('.container').css('pointer-events', 'auto');

    $('body').css('overflow', 'auto');

}*/

