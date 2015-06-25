var request = require('request')
  , cheerio = require('cheerio')
  , mongoose = require('mongoose')
  , Brief = require('./models/Brief')

mongoose.connect('mongodb://localhost/ThesisEngine')

var urlSession = 'http://epub.cnki.net/KNS/request/SearchHandler.ashx?action=&NaviCode=*&ua=1.21&PageName=ASP.brief_result_aspx&DbPrefix=CJFQ&DbCatalog=%e4%b8%ad%e5%9b%bd%e5%ad%a6%e6%9c%af%e6%9c%9f%e5%88%8a%e7%bd%91%e7%bb%9c%e5%87%ba%e7%89%88%e6%80%bb%e5%ba%93&ConfigFile=CJFQ.xml&db_opt=%E4%B8%AD%E5%9B%BD%E5%AD%A6%E6%9C%AF%E6%9C%9F%E5%88%8A%E7%BD%91%E7%BB%9C%E5%87%BA%E7%89%88%E6%80%BB%E5%BA%93&db_value=%E4%B8%AD%E5%9B%BD%E5%AD%A6%E6%9C%AF%E6%9C%9F%E5%88%8A%E7%BD%91%E7%BB%9C%E5%87%BA%E7%89%88%E6%80%BB%E5%BA%93&year_type=echar'
  , urlMain = 'http://epub.cnki.net/KNS/brief/brief.aspx?RecordsPerPage=50&QueryID=0&ID=&turnpage=1&tpagemode=L&dbPrefix=CJFQ&Fields=&DisplayMode=custommode&PageName=ASP.brief_result_aspx&curpage='

var session
var page = 1, count = 0

init()

function init () {
  request(urlSession, function (err, res, body) {
    console.log(new Date() + ' -- refreshed session at page: ' + page)
    session = res.headers['set-cookie']
    crawl()
  })
}

function crawl () {
  request({
    uri : urlMain + page,
    headers : {
      Cookie : session
    }
  }, function (err, res, body) {
    if (body.indexOf('<P><label>验证码：</label>') >= 0) {
      page--
      init()
    } else if (page < 120) {
      save(decode(body))
      page++
      crawl()
    } else {
      console.log(new Date() + ' -- finished crawling 120 pages, total thesis number: ' + count)
    }
  })
}

function decode (body) {
  var result = []
  var $ = cheerio.load(body)
  var titles = $('.GridTitleDiv').find('a')
  var contents = $('.GridContentDiv')
  for (var i = 0; i < titles.length; i++) {
    var data = {}

    // get url
    var url = titles[i].attribs.href
    url = url.replace(/\&urlid\S*/, '')
    url = url.replace(/\/KNS/, 'http://www.cnki.net/KCMS')
    data.link = url

    // get title
    var text = $(titles[i]).text()
    data.title = text.substring(59, text.length - 6)

    // get authors and journals
    var green = $(contents[i]).find('.fontgreen').text().replace(/\s/g, '').split('，')
    data.author = green[0]
    data.institute = green[1]
    data.journal = green[2]
    data.issue = green[3]

    // get abstract
    var script = $($(contents[i]).find('script')[0]).text()
    if (script.indexOf('document.write') == 0) {
      data.abstract = script.substring(57, script.length - 6)
    } else {
      data.abstract = ''
    }

    result.push(data)
    count++
  }
  return result
}

function save (data) {
  for (var i = 0; i < data.length; i++) {
    var brief = new Brief(data[i])
    brief.save()
  }
}