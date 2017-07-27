/*  @datumbot buat entry data
 *  gopal -2016
 */

console.log("\n\n===========================================");
console.log("Start API telegram for intelebot tni AD.");
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

var apindig = "http://192.168.1.241:9099";
// var apindig = "http://localhost:9099";

// RESTfull API client //
var Client = require('node-rest-client').Client;
var client = new Client();

// SOCKET.IO
var io = require('socket.io')();
io.on('connection', function(socket){
	console.log('ada yg konek nih');
	socket.on('notifpesanrealtime', function(data){

	});

  	socket.on('disconnect', function(){

  	});
});
io.listen(2999);


// GLOBAL VAR // 
// var PENERIMA_LAPORAN = [165983450,4117519]; // penerima klo ada laporan masuk, 
var PENERIMA_LAPORAN = [4117519]; // penerima klo ada laporan masuk, 
var BUFFID, BUFFDARI, BUFFKATEG, BUFFPESAN;


////////////////// START! //////////////////
// {
//   "_id": "5938e8ad62ec267c27000002",
//   "laporan": "testing #lokasi buat demo nanti",
//   "category": "lokasi",
//   "date": "2017-06-08T06:03:23.000Z",
//   "type": "private",
//   "dari": "@gopalgopel",
//   "__v": 0
// }

// behaviour klo nerima message 
api.on('message', function(message)
{
	// lokasi
	if (message.location){
    	console.log(message.location);

    	pesan = {
    		lokasi: message.location, 
    		pesan_id: BUFFID 
	   	};

		var args = {
		    data: pesan,
		    headers: { "Content-Type": "application/json" }
		};
    	// kirim ke API
    	client.put(apindig+"/api/rawpesans/"+BUFFID, args, function (data, response) {
		    // console.log(data);
		    // console.log(response);
		    console.log('data: ', data);
		    // console.log('response: ', response);
		    
		    
		    if (data.message.indexOf("updated") >= 0){
			    api.sendMessage({
		    		chat_id: message.chat.id,
					text: 'Lokasi berhasil disimpan. Laporan sempurna. Terimakasih',
					parse_mode: 'HTML'
				});
				//nambah minta lokasi
		    } else {
		    	api.sendMessage({
					chat_id: message.chat.id,
					text: 'lokasi gagal disimpan, '+data.message,
					parse_mode: 'HTML'
				});
		    }
		
		// ngirim pesan realtime via socket.io
		var soketiopesan = {
			dari: BUFFDARI,
		    kategori: BUFFKATEG,
		    isi: BUFFPESAN,
		    lokasi: message.location
		};
		console.log("ngirim pesan baru via soket:", soketiopesan)
		io.emit('pesanintelbaru',soketiopesan);

		 //    for (i=0; i<PENERIMA_LAPORAN.length; i++){
		 //    	api.sendMessage({
			// 		chat_id: PENERIMA_LAPORAN[i],
			// 		text: '<b>'+data.message+'</b>\noleh '+message.chat.id +' / '+dari,
			// 		parse_mode: 'HTML'
			// 	})
			// }
		});
    } 

    // NORMAL MESSAGE
	// parsing message
	var buff = message.text.split(" ");
	
	if ((buff[0] == ('/lapor'))&&(buff[1] !== undefined)){

		var pesan, dari, type, d, isi, catg=[];		
		if (message.from.username == undefined){
			if(message.from.last_name == undefined){
				dari = message.from.first_name;
			} else dari = message.from.first_name +' '+message.from.last_name;
		} else dari = '@'+message.from.username;

		// ngambil hashtag
		if (message.text.indexOf("#") === -1){catg = null;} 
		else {
			var re = /(?:^|\W)#(\w+)(?!\w)/g, match;
			while (match = re.exec(message.text)) {
			  catg.push(match[1]);
			}
		}
		
		type = message.chat.type;
		d = new Date(message.date * 1000);
		isi = message.text.replace('/lapor ','');

		// nyimpen ke var buffer global
		BUFFDARI = dari; 
		BUFFKATEG  = catg;
		BUFFPESAN = isi;

		pesan = {
    		dari: dari, 
    		type: type,
    		date: d,
    		category: catg,
    		pesan: isi
	   	};

		var args = {
		    data: pesan,
		    headers: { "Content-Type": "application/json" }
		};
		 
		// client.post("http://192.168.1.241:9099/api/rawpesans/", args, function (data, response) {
		client.post(apindig+"/api/rawpesans/", args, function (data, response) {
		    // console.log(data);
		    // console.log(response);
		    console.log('data: ', data);
		    // console.log('response: ', response);
		    
		    
		    if (data.message.indexOf("berhasil") >= 0){

		    	var s = data.message.search("_id:");
		    	var n = data.message.search(" } berhasil");
		    	s=s+5;
				BUFFID = data.message.substring(s, n);		    	

		    	{ message: 'pesan { __v: 0,\n  laporan: \'hyygd\',\n  category: null,\n  date: Thu Jun 08 2017 12:09:06 GMT+0700 (WIB),\n  type: \'private\',\n  dari: \'@gopalgopel\',\n  _id: 5938dbf3e9acae5b1d000015 } berhasil digenerate!' }

			    api.sendMessage({
					chat_id: message.chat.id,
					text: 'Laporan berhasil disimpan.\nKirim lokasi kejadian / lokasi anda dari menu: '+
						  '\n<i>attach --> location</i>',
					parse_mode: 'HTML'
				});
				//nambah minta lokasi
		    } else {
		    	api.sendMessage({
					chat_id: message.chat.id,
					text: 'laporan gagal disimpan, '+data.message,
					parse_mode: 'HTML'
				});
		    }
		
		// ngirim pesan realtime via socket.io
		// console.log("ngirim pesan baru via soket:", args)
		// io.emit('pesanintelbaru',args);

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
	console.log("AAAAAAAAAAAAAA inlinequery");
    console.log(message);
});
 
api.on('inline.result', function(message)
{
	// Received chosen inline result
	console.log("BBBBBBBBBBBB inlineresult");
    console.log(message);
});
 
api.on('inline.callback.query', function(message)
{
	// New incoming callback query
	console.log("CCCCCCCCCCC inlinecallbackquery");
    console.log(message);
   
});
 
api.on('update', function(message)
{
	// Generic update object
	// Subscribe on it in case if you want to handle all possible
	// event types in one callback

	console.log("DDDDDDDDDDDD update AWAL");
    console.log(message);
    console.log("DDDDDDDDDDDD update AKHR");

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


