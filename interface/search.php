<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<title>"<?= $_GET['s'] ?>"的搜索结果</title> 
	<link rel="stylesheet" href="./main.css">
</head> 
<body>
	
	<div id="header">
		<form action="./search.php" method="GET" id="form">
			<a href="./index.php">
				<h3 id="header-title">Thesis Engine</h3>
			</a>
			<p class="form-row form-row-main">
				<input type="text" name="s" id="searchbox" value="<?= $_GET['s'] ?>">
				<input type="submit" id="submit" value="搜索">
			</p>
			<p class="form-row form-center">
				<span>
					<input type="checkbox" name="title" id="input-title">
					<label for="input-title" class="form-label">标题</label>
				</span>
				<span>
					<input type="checkbox" name="ab" id="input-ab">
					<label for="input-ab" class="form-label">摘要</label>
				</span>
				<span>
					<input type="checkbox" name="author_name" id="input-author_name">
					<label for="input-author_name" class="form-label">作者</label>
				</span>
				<span>
					<input type="checkbox" name="institute_name" id="input-institute_name">
					<label for="input-institute_name" class="form-label">机构</label>
				</span>
				<span>
					<input type="checkbox" name="journal_name" id="input-journal_name">
					<label for="input-journal_name" class="form-label">刊物/会议</label>
				</span>
				<span>
					<input type="checkbox" name="institute_name" id="input-institute_name">
					<label for="input-institute_name" class="form-label">日期</label>
				</span>
			</p>
		</form>
	</div>

	<div id="main">
<?php 
/* 
* Created on 2010-4-17 
* 
* Order by Kove Wong 
*/ 
error_reporting(E_ALL ^ E_DEPRECATED);
$link=MySQL_connect('localhost','root',''); 
mysql_select_db('ThesisEngine'); 
mysql_query('set names utf8'); 

$Page_size=10; 

$select_1= "article.id,article.title,article.abstract,article.link,article.issue,author.author_name,journal.journal_name,institute.institute_name";
$from_1 = "article natural join author natural join institute natural join journal";
$indix1 = 0;
if(isset($_GET['ID'])){
	if($indix1 == 0){
		$where_1 = "article.id like '%$_GET[s]%'";
		$indix1 = 1;	
	} 
}
if(isset($_GET['title'])){
	if($indix1 == 0){
		$where_1 = "article.title like '%$_GET[s]%'";
		$indix1 = 1;	
	}
	else{
		$where_1 = $where_1." or "."article.title like '%$_GET[s]%'";
	}
}
if(isset($_GET['ab'])){
	if($indix1 == 0){
		$where_1 = "article.abstract like '%$_GET[s]%'";
		$indix1 = 1;	
	}
	else{
		$where_1 = $where_1." or "."article.abstract like '%$_GET[s]%'";
	}
}
if(isset($_GET['link'])){
	if($indix1 == 0){
		$where_1 = "article.link like '%$_GET[s]%'";
		$indix1 = 1;	
	}
	else{
		$where_1 = $where_1." or "."article.link like '%$_GET[s]%'";
	}
}
if(isset($_GET['issue'])){
	if($indix1 == 0){
		$where_1 = "article.issue like '%$_GET[s]%'";
		$indix1 = 1;	
	}
	else{
		$where_1 = $where_1." or "."article.issue like '%$_GET[s]%'";
	}
}
if(isset($_GET['author_name'])){
	if($indix1 == 0){
		$where_1 = "author.author_name like '%$_GET[s]%'";
		$indix1 = 1;	
	}
	else{
		$where_1 = $where_1." or "."author.author_name like '%$_GET[s]%'";
	}
}
if(isset($_GET['journal_name'])){
	if($indix1 == 0){
		$where_1 = "journal.journal_name like '%$_GET[s]%'";
		$indix1 = 1;	
	}
	else{
		$where_1 = $where_1." or "."journal.journal_name like '%$_GET[s]%'";
	}
}
if(isset($_GET['institute_name'])){
	if($indix1 == 0){
		$where_1 = "institute.institute_name like '%$_GET[s]%'";
		$indix1 = 1;	
	}
	else{
		$where_1 = $where_1." or "."institute.institute_name like '%$_GET[s]%'";
	}
}
if($indix1 == 0){
$where_1 = "article.id like '%$_GET[s]%' or article.title like '%$_GET[s]%' or article.abstract like '%$_GET[s]%' or article.link like '%$_GET[s]%' or article.issue like '%$_GET[s]%' or author.author_name like '%$_GET[s]%' or journal.journal_name like '%$_GET[s]%' or institute.institute_name like '%$_GET[s]%' ";
	}

$result=mysql_query("select $select_1 from $from_1 where $where_1");
$count = mysql_num_rows($result); 
echo "<p class=\"main-count\">共搜索到 <span>$count</span> 条与 <span>\"$_GET[s]\"</span> 相关的信息</p>";
$page_count = ceil($count/$Page_size); 
$init=1; 
$page_len=7; 
$max_p=$page_count; 
$pages=$page_count; 

//判断当前页码 
if(empty($_GET['page'])||$_GET['page']<0){ 

$page=1; 
}else { 
$page=$_GET['page']; 
} 

$offset=$Page_size*($page-1); 

$sql="select $select_1 from $from_1 where $where_1 limit $offset,$Page_size"; 
$result=mysql_query($sql,$link); 
while ($row=mysql_fetch_array($result)) { 
?> 

<a class="item" id="<?php echo $row['id']?>" href="<?php echo $row['link']?>" target="_blank">
	<h3 class="item-title"><?php echo str_replace($_GET['s'], '<span class="key">' . $_GET['s'] . '</span>', $row['title'])?></h3>
	<h5 class="item-subtitle">
		<?php if ($row['author_name'] != 'null' && $row['author_name'] != '/') { 
			echo str_replace($_GET['s'], '<span class="key">' . $_GET['s'] . '</span>', $row['author_name']); 
		}?>
		<?php if ($row['institute_name'] != 'null' && $row['institute_name'] != '/') { 
			echo str_replace($_GET['s'], '<span class="key">' . $_GET['s'] . '</span>', $row['institute_name']); 
		}?>
	</h5>
	<h5 class="item-subtitle">
		<?php if ($row['journal_name'] != 'null' && $row['journal_name'] != '/') { 
			echo str_replace($_GET['s'], '<span class="key">' . $_GET['s'] . '</span>', $row['journal_name']); 
		}?>
		<?php if ($row['issue'] != 'null' && $row['issue'] != '/') { 
			echo str_replace($_GET['s'], '<span class="key">' . $_GET['s'] . '</span>', $row['issue']); 
		}?>
	</h5>
	<p class="item-content">
		<?php echo str_replace($_GET['s'], '<span class="key">' . $_GET['s'] . '</span>', $row['abstract'])?>...
	</p>
</a>
 
<?php 
} 
$page_len = ($page_len%2)?$page_len:$pagelen+1;//页码个数 
$pageoffset = ($page_len-1)/2;//页码个数左右偏移量 

$key='<div class="page">'; 
$key.="<span>第 $page/$pages 页 </span> "; //第几页,共几页 

if($page!=1){ 
$key.="<a href=\"".$_SERVER['PHP_SELF']."?".$_SERVER['QUERY_STRING']."&page=1\">首页</a> "; //第一页 
$key.="<a href=\"".$_SERVER['PHP_SELF']."?".$_SERVER['QUERY_STRING']."&page=".($page-1)."\">上一页</a>"; //上一页 
}else { 
$key.="首页";//第一页 
$key.="上一页"; //上一页 
} 

if($pages>$page_len){ 
//如果当前页小于等于左偏移 
if($page<=$pageoffset){ 
$init=1; 
$max_p = $page_len; 
}else{//如果当前页大于左偏移 
//如果当前页码右偏移超出最大分页数 
if($page+$pageoffset>=$pages+1){ 
$init = $pages-$page_len+1; 
}else{ 
//左右偏移都存在时的计算 
$init = $page-$pageoffset; 
$max_p = $page+$pageoffset; 
} 
} 
} 
for($i=$init;$i<=$max_p;$i++){ 
if($i==$page){ 
$key.=' <span>'.$i.'</span>'; 

} else { 
$key.=" <a href=\"".$_SERVER['PHP_SELF']."?".$_SERVER['QUERY_STRING']."&page=".$i."\">".$i."</a>"; 
} 
} 
if($page!=$pages){ 
$key.=" <a href=\"".$_SERVER['PHP_SELF']."?".$_SERVER['QUERY_STRING']."&page=".($page+1)."\">下一页</a> ";//下一页 ///////////////////////
$key.="<a href=\"".$_SERVER['PHP_SELF']."?".$_SERVER['QUERY_STRING']."&page={$pages}\">尾页</a>"; //最后一页 

}else { 
$key.="下一页 ";//下一页 
$key.="尾页"; //最后一页 
} 
$key.='</div>';
?>
<tr> 

	<div id="pagenation"><?php echo $key?></div>

	</div>

</body> 
</html> 