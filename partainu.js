/*  tutorial dari: 
 *  https://www.npmjs.com/package/telegram-bot-api
 *  di terminal: npm install telegram-api-bot
 *  
 *  gopal -2016
 */
console.log("     ");
console.log("     ");
console.log("     ");
console.log("===========================================");
console.log("Start API telegram for partaiNU bot.");
console.log("GopaL - 2016");
console.log("===========================================");
console.log("     ");
console.log("     ");

var telegram = require('telegram-bot-api');
var http = require('http-request');

// var idGopal = 4117519;
// var idDika = 165983450;
// var idGrupC2MS = -1001058748351;
// var idGrupInfo = -147591902;
// var idSKMchatbot = 215771470;

// pke token @skmchatbot 
var api = new telegram({
	token: '258938805:AAFuEb6OE0UdCpjHDv62Adyc1ElEIlyNZWw', // @partaaibot token
	updates: {
		enabled: true,
		get_interval: 1000
	}
});
 


// mongoDB
//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/partainu';
// var url = 'mongodb://192.168.1.117:27017/partainu';

// standard API dari telegram
api.getMe()
.then(function(data)
{
    //console.log("ini hasil dari getMe");
    console.log(data);
})
.catch(function(err)
{
	console.log(err);
});

// daftar STATE:
// 0 = default
// 1 = laporan
// 2 = hasil
// 3 = hasil detail part1
// 4 = hasil detail part2
// 5 = lapor gambar
// 6 = lapor lokasi

// init var GROBAL
var STATE = 0;
var TOKEN = '258938805:AAFuEb6OE0UdCpjHDv62Adyc1ElEIlyNZWw';
var HASILKATEGORI, HASILJANGKAWAKTU;



// behaviour klo nerima message 
api.on('message', function(message)
{
	var chat_id = message.chat.id;
	console.log(message);
	console.log('STATE', STATE);

		// NERIMA MESEJ JENIS APAPUN ASALKAN STATENYA BENER!!!!!!

	// LAPORAN
	if (STATE == 1){ 
		STATE = 0;
		console.log("STATE 1 masuk laporan");
		var dari, type, d, isi, analisa;		
		if (message.from.username == undefined){
			if(message.from.last_name == undefined){
				dari = message.from.first_name;
			} else dari = message.from.first_name +' '+message.from.last_name;
		} else dari = '@'+message.from.username;

		type = message.chat.type;
		d = new Date(message.date * 1000);
		isi = message.text;
		analisa = false;

		// saving to mongo db
		MongoClient.connect(url, function (err, db) {
		  if (err) {
		    console.log('Unable to connect to the mongoDB server. Error:', err);
		    api.sendMessage({
				chat_id: message.chat.id,
				text: 'gagal menyimpan laporan: '+err
			})
		  } else {
		    //HURRAY!! We are connected. :)
		    console.log('Connection established to', url);
		    var collection = db.collection('laporans');

		    //save laporan
		    var pesan; 
		    pesan = {dari: dari, type: type, date: d, pesan: isi, analyzed: analisa};
		    
			collection.insert(pesan, function (err, result) {
			      if (err) {
			        console.log(err);
			      } else {
			        console.log('Inserted %d documents into the "laporans" collection. The documents inserted with "_id" are:', result.length, result);
			      }
			      //Close connection
			      db.close();
		    }) //end of storing message to mongo	

			api.sendMessage({
				chat_id: message.chat.id,
				text: 'Laporan diterima. Terimakasih'
			})
			
		  } // end of klo ga error
		}) //end of mongoclient
	} //end if STATE = 1


	// HASILDETAIL part2
	if (STATE == 4){ 
		STATE = 0;
		console.log("STATE 4 meminta result filter");

		api.sendMessage({
			chat_id: message.chat.id,
			text: 'Silahkan tunggu untuk '+HASILKATEGORI+' dengan filter waktu '+HASILJANGKAWAKTU
		})
		.then(function(message)
		{

		})
		.catch(function(err)
		{
			console.log(err);
		});
		HASILKATEGORI = '';
		HASILJANGKAWAKTU = '';

		//minta hasil ke DB
		//minta hasil ke DB
		//minta hasil ke DB
		//minta hasil ke DB
		//minta hasil ke DB

		//post hasil ke telegram
		//post hasil ke telegram
		api.sendMessage({
			chat_id: message.chat.id,
			text: 'Laporan untuk '+HASILKATEGORI+' dengan filter waktu '+HASILJANGKAWAKTU+':'+
				  '\n10-02-2016:14.35 @gopalgopel: #usul perbaikan jalan di cihanjuang'+
				  '\n09-02-2016:11.42 @riyahdhi: #usul diadakan pasar sembako murah di KPAD'+
				  '\n08-02-2016:22.11 @sesdika: #usul membuat taman bayi di gegerkalong'+
				  '\n08-02-2016:15.51 @tulakboby: #usul pemasangan spanduk kampanye di per3an setiabudhi'
		})
		.then(function(message)
		{

		})
		.catch(function(err)
		{
			console.log(err);
		});
		//post hasil ke telegram
		//post hasil ke telegram
		

	} //end if STATE = 4

	// HASILDETAIL part1
	if (STATE == 3){ 
		STATE = 4;
		console.log("STATE 3 meminta jangka waktu hasildetail ");

		api.sendMessage({
			chat_id: message.chat.id,
			text: 'Silahkan pilih jangka waktu lebih detail : '+
				  '\n\n /HariIni - melihat laporan '+HASILKATEGORI+' hari ini'+
				  '\n\n /3HariKemarin - melihat laporan '+HASILKATEGORI+' 3hari kblkg'+
				  '\n\n /1MingguKemarin - melihat laporan '+HASILKATEGORI+' dari 1mggu lalu'+
				  '\n\n /Semua - melihat laporan '+HASILKATEGORI+' semua waktu'
		})
		.then(function(message)
		{

		})
		.catch(function(err)
		{
			console.log(err);
		});
	} //end if STATE = 3

	// foto
	if (STATE == 5){ 
		STATE = 0;
		console.log("STATE 5 simpan foto ");

		var dari, type, d, isi, analisa;		
		if (message.from.username == undefined){
			if(message.from.last_name == undefined){
				dari = message.from.first_name;
			} else dari = message.from.first_name +' '+message.from.last_name;
		} else dari = '@'+message.from.username;

		type = message.chat.type;
		d = new Date(message.date * 1000);
		isi = message.photo;
		analisa = false;

		// saving to mongo db
		MongoClient.connect(url, function (err, db) {
		  if (err) {
		    console.log('Unable to connect to the mongoDB server. Error:', err);
		    api.sendMessage({
				chat_id: message.chat.id,
				text: 'gagal connect DB: '+err
			})
		  } else {
		    //HURRAY!! We are connected. :)
		    console.log('Connection established to', url);
		    var collection = db.collection('fotos');

		    //save laporan
		    var pesan; 
		    pesan = {dari: dari, type: type, date: d, pesan: isi, analyzed: analisa};
		    
			collection.insert(pesan, function (err, result) {
			      if (err) {
			        // console.log(err);
			        api.sendMessage({
						chat_id: message.chat.id,
						text: 'gagal menyimpan foto: '+err
					})
			      } else {
			        api.sendMessage({
						chat_id: message.chat.id,
						text: 'Foto diterima. Terimakasih'
					})
			        // console.log('Inserted %d documents into the "laporans" collection. The documents inserted with "_id" are:', result.length, result);
			      }
			      //Close connection
			      db.close();
		    }) //end of storing message to mongo	

			// console.log('message.photo[2].file_id', message.photo[0].file_id);
			api.getFile(message.photo[0])
			.then(function(data)
			{
			    //console.log("ini hasil dari getMe");
			    // console.log(data);
			    console.log('foto disimpan di: https://api.telegram.org/file/bot'+TOKEN+'/'+data.file_path);
			    var options = {url: 'https://api.telegram.org/file/bot'+TOKEN+'/'+data.file_path};    
				http.get(options, '/home/kerja/partainu/files/'+data.file_path, function (error, result) {
				    if (error) {
				        console.error(error);
				    } else {
				        console.log('File downloaded at: ' + result.file);
				    }
				});

			 //    api.sendPhoto({
			 //    	chat_id: message.chat.id,
			 // 	// photo: 'https://api.telegram.org/file/bot'+TOKEN+'/'+data.file_path,
			 //    	photo: '/home/gopal/Pictures/baba.jpg',
			 //    	caption: 'ini foto yg disimpan'
			 //    })
			 //    .then(function(data)
				// {
				// 	console.log(util.inspect(data, false, null));
				// })
				// .catch(function(err)
				// {
				// 	console.log(err);
				// });

			})
			.catch(function(err)
			{
				console.log(err);
			});
			
		  } // end of klo ga error
		}) //end of mongoclient
	} //end if STATE = 5


	// lokasi
	if (STATE == 6){ 
		STATE = 0;
		console.log("STATE 6 simpan lokasi ");

		var dari, type, d, isi, analisa;		
		if (message.from.username == undefined){
			if(message.from.last_name == undefined){
				dari = message.from.first_name;
			} else dari = message.from.first_name +' '+message.from.last_name;
		} else dari = '@'+message.from.username;

		type = message.chat.type;
		d = new Date(message.date * 1000);
		isi = message.location;
		analisa = false;

		// saving to mongo db
		MongoClient.connect(url, function (err, db) {
		  if (err) {
		    console.log('Unable to connect to the mongoDB server. Error:', err);
		    api.sendMessage({
				chat_id: message.chat.id,
				text: 'gagal konek ke DB: '+err
			})
		  } else {
		    //HURRAY!! We are connected. :)
		    console.log('Connection established to', url);
		    var collection = db.collection('lokasis');

		    //save laporan
		    var pesan; 
		    pesan = {dari: dari, type: type, date: d, pesan: isi, analyzed: analisa};
		    
			collection.insert(pesan, function (err, result) {
			      if (err) {
			        // console.log(err);
			        api.sendMessage({
						chat_id: message.chat.id,
						text: 'gagal menyimpan lokasi: '+err
					})
			      } else {
			        // console.log('Inserted %d documents into the "laporans" collection. The documents inserted with "_id" are:', result.length, result);
			        api.sendMessage({
						chat_id: message.chat.id,
						text: 'lokasi diterima. Terimakasih'
					})
			      }
			      //Close connection
			      db.close();
		    }) //end of storing message to mongo	

			// do something after simpan lokasi
			
		  } // end of klo ga error
		}) //end of mongoclient
	} //end if STATE = 6


	// KHUSUS COMMAND

	// STARTSTARTSTARTSTARTSTARTSTARTSTARTSTART
	if (message.text == '/start'){ //memulai bot
		// START
  		api.sendMessage({
				chat_id: message.chat.id,
				text: 'Selamat datang, silahkan pilih: \n/laporan untuk memberikan info \n/hasil untuk melihat hasil singkat \n/hasildetail untuk melihat hasil detail dengan filternya'
		})
		.then(function(message)
		{

		})
		.catch(function(err)
		{
			console.log(err);
		});
	} else {

		// filter HASILKATEGORI
		if ((message.text == '/usulTwitter') && (STATE == 3)){
			message.text = HASILKATEGORI = '#usulTwitter';
		} else if((message.text == '/usulTelegram') && (STATE == 3)){
			message.text = HASILKATEGORI = '#usulTelegram';
		} else if((message.text == '/komplainTwitter') && (STATE == 3)){
			message.text = HASILKATEGORI = '#komplainTwitter';
		} else if((message.text == '/komplainTelegram') && (STATE == 3)){
			message.text = HASILKATEGORI = '#komplainTelegram';
		} else if((message.text == '/penguasaanWilayah') && (STATE == 3)){
			message.text = HASILKATEGORI = '#penguasaanWilayah';

		// filter HASILJANGKAWAKTU
		} else if ((message.text == '/HariIni') && (STATE == 4)){
			message.text = HASILJANGKAWAKTU = '#HariIni';
		} else if((message.text == '/3HariKemarin') && (STATE == 4)){
			message.text = HASILJANGKAWAKTU = '#3HariKemarin';
		} else if((message.text == '/1MingguKemarin') && (STATE == 4)){
			message.text = HASILJANGKAWAKTU = '#3HariKemarin';
		} else if((message.text == '/Semua') && (STATE == 4)){
			message.text = HASILJANGKAWAKTU = '#Semua';
		}


		// mulai dari "/"
		if (message.text.includes("/")){
	    	if ((message.text == '/laporan') && (STATE == 0)){
	    		STATE = 1;
	    		api.sendMessage({
					chat_id: message.chat.id,
					text: 'Silahkan masukan laporan dengan kategori: #usul atau #komplain atau #wilayah. \n\nContoh:'+
						  '\n\n#usul di daerah sariwangi perlu perbaikan jalan krn sudah bertahun2 rusak'+
						  '\n\n#komplain spanduk di simpang soeta dikomplain warga karena menghalangi rambu lalulintas'+
						  '\n\n#wilayah kecamatan x #oke'+
						  '\n\n#wilayah kecamatan x #tidak'+
						  '\n\n#wilayah kelurahan x #oke'+
						  '\n\n#wilayah kelurahan x #tidak'
				})

				.then(function(data)
				{
					console.log(util.inspect(data, false, null));
				})
				.catch(function(err)
				{
					console.log(err);
				});

	    	} else if ((message.text == '/hasil') && (STATE == 0)){
	    		STATE = 2;
	    		api.sendMessage({
					chat_id: message.chat.id,
					text: 'Hasil Laporan : '+
						  '\n\nTotal 26 mention @partaiNU di Twitter '+
						  '\n- 12 #usul '+
						  '\n- 8 #komplain '+
						  '\n- 6 tidak ada kategori '+
						  '\n\nTotal 15 laporan tim sukses via telegram '+
						  '\n- 4 #usul '+
						  '\n- 6 #komplain '+
						  '\n- 4 #wilayah '+
						  '\n- 1 tidak ada kategori'+
						  '\n\nDari total 5 kecamatan & 30 kelurahan terdata, '+
						  '\n- 3 kecamatan mendukung '+
						  '\n- 1 kecamatan tidak mendukung '+
						  '\n- 2 kecamatan tidak ada data '+
						  '\n- 12 kelurahan mendukung '+
						  '\n- 4 kelurahan tidak mendukung '+
						  '\n- 14 kelurahan tidak ada data '+
						  '\n\nKeterangan lebih detail bisa dilihat di /hasildetail '
						  
				})
				.then(function(message)
				{

				})
				.catch(function(err)
				{
					console.log(err);
				});
				//insert todo here	
				STATE = 0;

	    	} else if ((message.text == '/hasildetail') && (STATE == 0)){
	    		STATE = 3;
	    		api.sendMessage({
					chat_id: message.chat.id,
					text: 'Silahkan pilih kategori lebih detail : '+
						  '\n\n /usulTwitter - melihat semua usul yg masuk via twitter'+
						  '\n\n /usulTelegram - melihat semua usul yg masuk via telegram '+
						  '\n\n /komplainTwitter - melihat semua komplain yg masuk via twitter'+
						  '\n\n /komplainTelegram - melihat semua komplain yg masuk via telegram'+
						  '\n\n /penguasaanWilayah - untuk melihat resume penguasaan wilayah'
				})
				.then(function(message)
				{

				})
				.catch(function(err)
				{
					console.log(err);
				});

				//insert todo here

			} else if ((message.text == '/foto') && (STATE == 0)){
	    		STATE = 5;
	    		api.sendMessage({
					chat_id: message.chat.id,
					text: 'mangga attach foto laporan'
				})

				.then(function(data)
				{
					console.log(util.inspect(data, false, null));
				})
				.catch(function(err)
				{
					console.log(err);
				});

	    	} else if ((message.text == '/lokasi') && (STATE == 0)){
	    		STATE = 6;
	    		api.sendMessage({
					chat_id: message.chat.id,
					text: 'silakan attach lokasi'
				})

				.then(function(data)
				{
					console.log(util.inspect(data, false, null));
				})
				.catch(function(err)
				{
					console.log(err);
				});

	    	} else {
	    		api.sendMessage({
					chat_id: message.chat.id,
					text: 'Perintah tidak jelas. Silahkan pilih: \n/laporan untuk memberikan info \n/hasil untuk melihat hasil singkat \n/hasildetail untuk melihat hasil detail dengan filternya'
				})
				.then(function(message)
				{

				})
				.catch(function(err)
				{
					console.log(err);
				});
	    	}
	    } else { // bukan command, tapi isi. ntr diseleksi levelnya

	    } //end else bukan command

	} // STARTSTARTSTARTSTARTSTARTSTARTSTARTSTART

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
	text: 'service nodeJS @partaaibot si partaiNU udh nyala'
})
.then(function(data)
{
	console.log(util.inspect(data, false, null));
})
.catch(function(err)
{
	console.log(err);
});


