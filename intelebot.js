/*  @datumbot buat entry data
 *  gopal -2016
 */

console.log("\n\n===========================================");
console.log("Start API telegram for intelebot.");
console.log("GopaL - 2016");
console.log("===========================================\n\n ");

// TELEGRAM API //
var telegram = require('telegram-bot-api');
var api = new telegram({
	token: '276359910:AAG5hmb-73DzKrur2MtlQiTJnegDIocmjUY', // @intele_bot token
	updates: {
		enabled: true,
		get_interval: 1000
	}
});
 
// RESTfull API client //
var Client = require('node-rest-client').Client;
var client = new Client();

// GLOBAL VAR // 
// var PENERIMA_LAPORAN = [165983450,4117519]; // penerima klo ada laporan masuk, 
var PENERIMA_LAPORAN = [4117519]; // penerima klo ada laporan masuk, 



////////////////// START! //////////////////

// behaviour klo nerima message 
api.on('message', function(message)
{
	// parsing message
	var buff = message.text.split(" ");
	

	if ((buff[0] == ('/lapor'))&&(buff[1] !== undefined)){

		var pesan, dari, type, d, isi;		
		if (message.from.username == undefined){
			if(message.from.last_name == undefined){
				dari = message.from.first_name;
			} else dari = message.from.first_name +' '+message.from.last_name;
		} else dari = '@'+message.from.username;

		type = message.chat.type;
		d = new Date(message.date * 1000);
		isi = message.text.replace('/lapor ','');

	    pesan = {
    		dari: dari, 
    		type: type,
    		date: d,
    		pesan: isi
	   	};

		var args = {
		    data: pesan,
		    headers: { "Content-Type": "application/json" }
		};
		 
		client.post("http://192.168.1.241:9099/api/rawpesans/", args, function (data, response) {
		    console.log('data: ', data);
		    // console.log('response: ', response);
		    
		 //    for (i=0; i<PENERIMA_LAPORAN.length; i++){
		 //    	api.sendMessage({
			// 		chat_id: PENERIMA_LAPORAN[i],
			// 		text: '<b>'+data.message+'</b>\noleh '+message.chat.id +' / '+dari,
			// 		parse_mode: 'HTML'
			// 	})
			// }
		});
	}

	if (message.text == ('/help')){  
		api.sendMessage({
			chat_id: message.chat.id,
			text: '<b>untuk menghindari salah posting,</b> maka input laporan diawali /lapor'+
				  '\n\n<b>Contoh:</b>'+
				  '\n/lapor ada kerusuhan di lembang. satu korban jiwa dan puluhan luka-luka disebabkan tawuran antar pedagang pasar',
			parse_mode: 'HTML'
		});
	}


}); // end of onMessage




api.on('inline.query', function(message)
{
	// Received inline query
    console.log(message);
});
 
api.on('inline.result', function(message)
{
	// Received chosen inline result
    console.log(message);
});
 
api.on('inline.callback.query', function(message)
{
	// New incoming callback query
    console.log(message);
});
 
api.on('update', function(message)
{
	// Generic update object
	// Subscribe on it in case if you want to handle all possible
	// event types in one callback
    console.log(message);
});








// ngirim notifikasi k gopal
api.sendMessage({
	chat_id: 4117519, //kirim k gopal pas pertama kali start service
	text: 'service nodeJS @intele_bot nyala!'
})
.then(function(data)
{
	// console.log(util.inspect(data, false, null));
})
.catch(function(err)
{
	console.log(err);
});


