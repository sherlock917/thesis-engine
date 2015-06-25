var request = require('request')
  , cheerio = require('cheerio')
  , mongoose = require('mongoose')
  , Brief = require('./models/Brief')

mongoose.connect('mongodb://localhost/ThesisEngine')

var urlSession = 'http://epub.cnki.net/KNS/request/SearchHandler.ashx?action=&NaviCode=*&ua=1.21&PageName=ASP.brief_result_aspx&DbPrefix=IPFD&DbCatalog=%e5%9b%bd%e9%99%85%e4%bc%9a%e8%ae%ae%e8%ae%ba%e6%96%87%e5%85%a8%e6%96%87%e6%95%b0%e6%8d%ae%e5%ba%93&ConfigFile=IPFD.xml&db_opt=%E5%9B%BD%E9%99%85%E4%BC%9A%E8%AE%AE%E8%AE%BA%E6%96%87%E5%85%A8%E6%96%87%E6%95%B0%E6%8D%AE%E5%BA%93&db_value=%E5%9B%BD%E9%99%85%E4%BC%9A%E8%AE%AE%E8%AE%BA%E6%96%87%E5%85%A8%E6%96%87%E6%95%B0%E6%8D%AE%E5%BA%93&his=0'
  , urlMain = 'http://epub.cnki.net/KNS/brief/brief.aspx?RecordsPerPage=50&QueryID=52&ID=&turnpage=1&tpagemode=L&dbPrefix=IPFD&Fields=&DisplayMode=custommode&PageName=ASP.brief_result_aspx&curpage='

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
    data.title = text.substring(41, text.length - 5)

    // get authors and journals
    var green = $(contents[i]).find('.fontgreen').text().replace(/\s/g, '').split('，')
    data.author = green[0]
    // data.institute = green[1]
    data.journal = green[1]
    data.issue = green[2]

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
  // console.log(data)
  for (var i = 0; i < data.length; i++) {
    var brief = new Brief(data[i])
    brief.save()
  }
}