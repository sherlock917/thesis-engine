var fs = require('fs'),
    util = require('util'),
    em =  require("events").EventEmitter,
    nodejieba = require("nodejieba"),
    mysql = require('mysql');


var sqlconn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'dblesson'
});

var id_list = [];

var abstract_assign_dic = {},
	abstract_cou_dic = {},
	abstract_val_dic = {},
	abstract_data = [];

var title_assign_dic = {},
	title_cou_dic = {},
	title_val_dic = {},
	title_data = [];

var finalres=[];


var reader = new em();

reader.start = function(){
	sqlconn.connect();
	sqlconn.query('SELECT * FROM ARTICLE', function(err, rows) {
		if(err){
			reader.emit('error');
			return;
		}
		reader.emit('readed',rows);
		return;
	});
	return;
}
	/*
	fs.readFile('cnki.txt','utf8',function(err,data){
		if(err){
			console.log("file_read error: "+ err);
			reader.emit('error');
		}
		else{
			file_data = data.split('\n');
			reader.emit('readed',file_data);
		}
	});*/


reader.on('error', function(){
	console.log("reader error");
	return;
});

reader.on('readed', function(data){
	var len = data.length;
	for(var i = 0; i<len;i++){
		console.log(i+1);
		var obj = data[i];
		id_list.push(obj.id);

		var res = [],thi = {};
		nodejieba.tag(obj.title).forEach(function(word){
			if(word.split(':')[1].match('^(eng|n|v)$')){
				var theword = word.split(':')[0];
				if(thi[theword]!=null)
					return;
				thi[theword] = 1;
				if(title_assign_dic[theword]==null){
					title_cou_dic[theword]=0;
					title_assign_dic[theword]=[];
				}
				title_cou_dic[theword]++;
				title_assign_dic[theword].push(i);
				res.push(theword);
			}
		});
		title_data.push(res);

		res = [];
		thi = {};
		nodejieba.tag(obj.abstract).forEach(function(word){
			if(word.split(':')[1].match('^(eng|n|v)$')){
				var theword = word.split(':')[0];
				if(thi[theword]!=null)
					return;
				thi[theword] = 1;
				if(abstract_assign_dic[theword]==null){
					abstract_cou_dic[theword]=0;
					abstract_assign_dic[theword]=[];
				}
				abstract_cou_dic[theword]++;
				abstract_assign_dic[theword].push(i);
				res.push(theword);
			}
		});
		abstract_data.push(res);
	}

	for(key in abstract_cou_dic){
		abstract_val_dic[key]=22.0/(abstract_cou_dic[key]+10);
	}
	for(key in title_cou_dic){
		title_val_dic[key]=22.0/(title_cou_dic[key]+10);
	}

	/*
	fs.writeFile('./dics',JSON.stringify(abstract_assign_dic),function(err){
	});
	fs.writeFile('./vals',JSON.stringify(abstract_val_dic),function(err){
	});
	fs.writeFile('./ress',JSON.stringify(abstract_data),function(err){
	});
	*/

	var len = abstract_data.length;
	for(var i = 0;i < len;i++){
		console.log(i+1);
		var rank = [],resrank = [];
		abstract_data[i].forEach(function(word){
			abstract_assign_dic[word].forEach(function(artiID){
				if(artiID == i)//repeat
					return;
				if(rank[artiID]==null){
					rank[artiID]={
						seq : artiID+1,
						tarid : id_list[artiID],
						val : 0.0
					};
				}
				rank[artiID].val += abstract_val_dic[word];
			});
		});
		title_data[i].forEach(function(word){
			title_assign_dic[word].forEach(function(artiID){
				if(artiID == i)//repeat
					return;
				if(rank[artiID] == null){
					rank[artiID]={
						seq : artiID+1,
						tarid : id_list[artiID],
						val : 0.0
					};
				}
				rank[artiID].val += title_val_dic[word] * 3;
			});
		});
		rank.sort(function(a,b){
			return b.val - a.val;
		});
		for(var j = 0; j <10;j++)
			resrank[j] = rank[j];
		finalres.push({
			seq : i+1,
			id : id_list[i],
			relevant : resrank
		});
		console.log({
			seq : i+1,
			id : id_list[i],
			relevant : resrank
		});
	}

	reader.emit('write');
	/*fs.writeFile('./result',JSON.stringify(finalres),function(err){
	});*/
});

reader.on('write',function (){
	finalres.forEach(function(res){
		var toinsert = {},tot=1;
		toinsert.id = res.id;
		res.relevant.forEach(function(data){
			if(data == undefined)
				return;
			toinsert['rel' + (tot++)] = data.tarid;
		});
		sqlconn.query('INSERT INTO relevant SET ?', toinsert, function(err, result) {
		});
	});

	sqlconn.end();
});

reader.start();

/*
create table relevant(id varchar(25) not null primary key, rel1 varchar(25), rel2 varchar(25),rel3 varchar(25),rel4 varchar(25), rel5 varchar(25),rel6 varchar(25),rel7 varchar(25), rel8 varchar(25), rel9 varchar(25), rel10 varchar(25));
*/

/*
SELECT out2.id,out2.title,out2.abstract,out2.link,out2.issue,out2.author_name,out2.journal_name,out2.institute_name,out2.relt1,out2.rell1,out2.relt2,out2.rell2,article.title as relt3,article.link as rell3 FROM (SELECT out1.id,out1.title,out1.abstract,out1.link,out1.issue,out1.author_name,out1.journal_name,out1.institute_name,out1.rel1,out1.rel2,out1.rel3,out1.relt1,out1.rell1,article.title as relt2,article.link as rell2 FROM (SELECT blend.id,blend.title,blend.abstract,blend.link,blend.issue,blend.author_name,blend.journal_name,blend.institute_name,blend.rel1,blend.rel2,blend.rel3,article.title as relt1,article.link as rell1 FROM(SELECT origin.id,origin.title,origin.abstract,origin.link,origin.issue,origin.author_name,origin.journal_name,origin.institute_name,relevant.rel1,relevant.rel2,relevant.rel3 FROM (SELECT article.id,article.title,article.abstract,article.link,article.issue,author.author_name,journal.journal_name,institute.institute_name FROM article natural join author natural join institute natural join journal LIMIT 10) AS origin natural join relevant) AS blend join article WHERE blend.rel1 = article.id) AS out1 join article WHERE out1.rel2 = article.id) AS out2 join article WHERE out2.rel3 = article.id*/

/*
SELECT out2.*, article.title as relt3, article.link as rell3 
FROM (
	SELECT out1.*, article.title as relt2, article.link as rell2 
	FROM (
		SELECT blend.*, article.title as relt1, article.link as rell1 
		FROM(
			SELECT origin.*,relevant.rel1,relevant.rel2,relevant.rel3 
			FROM (
				SELECT article.id,article.title,article.abstract,article.link,article.issue,author.author_name,journal.journal_name,institute.institute_name 
				FROM article natural join author natural join institute natural join journal 
				LIMIT 25
			) AS origin natural join relevant
		) AS blend join article 
		WHERE blend.rel1 = article.id
	) AS out1 join article 
	WHERE out1.rel2 = article.id
) AS out2 join article 
WHERE out2.rel3 = article.id
*/