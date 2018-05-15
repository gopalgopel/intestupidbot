/*  @datumbot buat entry data
 *  gopal -2016
 */

console.log("\n\n===========================================");
console.log("Start API telegram for intelebot tni AD.");
console.log("GopaL - 2016");
console.log("===========================================\n\n ");

// TELEGRAM API //
var TOKEN = '276359910:AAG5hmb-73DzKrur2MtlQiTJnegDIocmjUY';
var telegram = require('telegram-bot-api');
var api = new telegram({
	token: TOKEN, // @intele_bot token
	updates: {
		enabled: true,
		get_interval: 2000
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

var https = require('https');
var fs = require('fs');


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
	///////////////////////// LOKASI ///////////////////////////////////
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
		    console.log('data: ', data);
		    
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
		});
    } //END OF MESSAGE.LOCATION



    ///////////////////////// FOTO ///////////////////////////////////
    if(message.photo){

    	console.log(message.photo);			

    	var buff = message.caption.split(" ");	
		if ((buff[0] == ('/lapor'))&&(buff[1] !== undefined)){
			var pesan, dari, type, d, isi, foto, video, catg=[];		
			if (message.from.username == undefined){
				if(message.from.last_name == undefined){
					dari = message.from.first_name;
				} else dari = message.from.first_name +' '+message.from.last_name;
			} else dari = '@'+message.from.username;

			// ngambil hashtag
			if (message.caption.indexOf("#") === -1){catg = null;} 
			else {
				var re = /(?:^|\W)#(\w+)(?!\w)/g, match;
				while (match = re.exec(message.caption)) {
				  catg.push(match[1]);
				}
			}
			
			type = message.chat.type;
			d = new Date(message.date * 1000);
			isi = message.caption.replace('/lapor ','');

			// save foto
			client.get("https://api.telegram.org/bot"+TOKEN+"/getFile?file_id="+message.photo[message.photo.length-1].file_id,function(data,r){
				console.log('data: ', data);
				foto = data.result.file_path;
				var request = https.get("https://api.telegram.org/file/bot"+TOKEN+"/"+foto, function(response) {
				  	var file = fs.createWriteStream(foto);
					response.pipe(file);
				});
				video = null;

				// nyimpen ke var buffer global
				BUFFDARI = dari; 
				BUFFKATEG  = catg;
				BUFFPESAN = isi;

				pesan = {
		    		dari: dari, 
		    		type: type,
		    		date: d,
		    		category: catg,
		    		pesan: isi,
		    		foto: foto,
		    		video: video
			   	};

				var args = {
				    data: pesan,
				    headers: { "Content-Type": "application/json" }
				};
				 
				client.post(apindig+"/api/rawpesans/", args, function (data, response) {
				    console.log('data: ', data);	    
				    
				    if (data.message.indexOf("berhasil") >= 0){

				    	var s = data.message.search("_id:");
				    	var n = data.message.search(" } berhasil");
				    	s=s+5;
						BUFFID = data.message.substring(s, n);		    	

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
				});
			})
		}
    } //END OF MESSAGE.PHOTO



    ///////////////////////// VIDEO ///////////////////////////////////
    if(message.video){
    	console.log(message.video);			

    	var buff = message.caption.split(" ");	
		if ((buff[0] == ('/lapor'))&&(buff[1] !== undefined)){
			var pesan, dari, type, d, isi, foto, video, catg=[];		
			if (message.from.username == undefined){
				if(message.from.last_name == undefined){
					dari = message.from.first_name;
				} else dari = message.from.first_name +' '+message.from.last_name;
			} else dari = '@'+message.from.username;

			// ngambil hashtag
			if (message.caption.indexOf("#") === -1){catg = null;} 
			else {
				var re = /(?:^|\W)#(\w+)(?!\w)/g, match;
				while (match = re.exec(message.caption)) {
				  catg.push(match[1]);
				}
			}
			
			type = message.chat.type;
			d = new Date(message.date * 1000);
			isi = message.caption.replace('/lapor ','');

			// save video
			client.get("https://api.telegram.org/bot"+TOKEN+"/getFile?file_id="+message.video.file_id,function(data,r){
				console.log('data: ', data);
				video = data.result.file_path;
				var request = https.get("https://api.telegram.org/file/bot"+TOKEN+"/"+video, function(response) {
				  	var file = fs.createWriteStream(video);
					response.pipe(file);
				});
				foto = null;

				// nyimpen ke var buffer global
				BUFFDARI = dari; 
				BUFFKATEG  = catg;
				BUFFPESAN = isi;

				pesan = {
		    		dari: dari, 
		    		type: type,
		    		date: d,
		    		category: catg,
		    		pesan: isi,
		    		foto: foto,
		    		video: video
			   	};

				var args = {
				    data: pesan,
				    headers: { "Content-Type": "application/json" }
				};
				 
				client.post(apindig+"/api/rawpesans/", args, function (data, response) {
				    console.log('data: ', data);	    
				    
				    if (data.message.indexOf("berhasil") >= 0){

				    	var s = data.message.search("_id:");
				    	var n = data.message.search(" } berhasil");
				    	s=s+5;
						BUFFID = data.message.substring(s, n);		    	

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
				});
			})
		}
    } //END OF MESSAGE.VIDEO



	///////////////////////// TEXT ///////////////////////////////////
	if(message.text){
    	var buff = message.text.split(" ");	
		if ((buff[0] == ('/lapor'))&&(buff[1] !== undefined)){
			var pesan, dari, type, d, isi, foto, video,catg=[];		
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
	    		pesan: isi,
	    		foto: foto,
	    		video: video
		   	};

			var args = {
			    data: pesan,
			    headers: { "Content-Type": "application/json" }
			};
			 
			client.post(apindig+"/api/rawpesans/", args, function (data, response) {
			    console.log('data: ', data);	    
			    
			    if (data.message.indexOf("berhasil") >= 0){

			    	var s = data.message.search("_id:");
			    	var n = data.message.search(" } berhasil");
			    	s=s+5;
					BUFFID = data.message.substring(s, n);		    	

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
    } // END OF MESSAGE TEXT
	
		

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


