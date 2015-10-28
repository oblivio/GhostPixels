$(document).ready(function () {
	$('#horizontalTab').easyResponsiveTabs({
		type: 'default', //Types: default, vertical, accordion           
		width: 'auto', //auto or any width like 600px
		fit: true,   // 100% fit in a container
		closed: 'accordion', // Start closed if in accordion view
		activate: function(event) { // Callback function if tab is switched
			var $tab = $(this);
			var $info = $('#tabInfo');
			var $name = $('span', $info);

			$name.text($tab.text());

			$info.show();
		}
	});

	$('#verticalTab').easyResponsiveTabs({
		type: 'vertical',
		width: 'auto',
		fit: true
	});
	document.getElementById('decode-input').onchange = function(input) {
		var file    = document.getElementById('decode-input').files[0];
		document.getElementById('decode-button').setAttribute('class','hide-me');
		document.getElementById('overlay').setAttribute('class','');

		if ( file ) {
	    	
	        var FR= new FileReader();
	        FR.onload = function(e) {
	        	var password = prompt('Enter password (leave empty if none)');
				document.getElementById('overlay').setAttribute('class','hide-me');
				
				GhostPixels.decode(password,e.target.result).then(function(decodedMessage){
	    			document.getElementById('decoded-message').innerHTML = decodedMessage;
	    			document.getElementById('decoded-message').setAttribute('class','');
	        	});
	        	
	        };       
	        FR.readAsDataURL( file );
	    }
	};
	$('#encode-button').on('click', function () {
		
		var message,password,imgSRC;
		message = document.getElementById('message-input').value;
		password = document.getElementById('password-input').value;
		if(message.length === 0)
			return false;
		document.getElementById('overlay').setAttribute('class','');

		setTimeout(function(){

			var imgSRC = GhostPixels.encode(message,password);

			document.getElementById('image-output').setAttribute('src',imgSRC);
			document.getElementById('output-download').setAttribute('href',imgSRC);
			document.getElementById('output-download').setAttribute('download','encoded.png');
        	document.getElementById('image-output').setAttribute('class','output-image');
        	document.getElementById('overlay').setAttribute('class','hide-me');
        	
        	$("#encode-button,.encode-area form").fadeOut(1000);
        	
        	$("#reset-button,#instructions").removeClass('hide-me');
        	
        	$(".resp-tabs-container").scrollTop(0);
        	
		}, 1000);
		
	});
	document.getElementById('reset-button').onclick = function(){
		$(".encode-area form")[0].reset();
		$("#encode-button,.encode-area form").fadeIn(1000);
		document.getElementById('image-output').setAttribute('src','');
		document.getElementById('output-download').setAttribute('href','');
    	document.getElementById('image-output').setAttribute('class','hide-me');

    	$("#reset-button,#instructions").addClass('hide-me');
    	$(".resp-tabs-container").scrollTop(0);
	};
	$(".resp-tab-item>span>img").on("click",function(){
		$(".resp-tabs-container").scrollTop(0);
	});
	document.addEventListener("deviceready", onDeviceReady, false);
	function onDeviceReady() {
	    $(document).on('click', '#image-output', function(event) {
	        event.preventDefault();
	        var tmpSRC = $(this).attr('src');
	        
	        var canvas = canvas = document.createElement('canvas');
	    	canvas.width = GhostPixels.dimensions.width;
	    	canvas.height = GhostPixels.dimensions.height;
	    	var img = new Image();
	        img.onload = function() {
	            var ctx = canvas.getContext('2d');
	            ctx.canvas.width = img.width;
	            ctx.canvas.height = img.height;
	            ctx.drawImage(img, 0, 0);
	            
	            window.canvas2ImagePlugin.saveImageDataToLibrary(
		                function(msg){
		                    alert('File has been saved to gallery.');
		                },
		                function(err){
		                    alert('File could not be saved to gallery.');
		                },
		                canvas
		            );
	        };
	        img.src = tmpSRC;
	        
	    });
	}; //end onDeviceReady
});