<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Thesis Engine</title>
	<style>
	*{
		margin: 0;
		padding: 0;
		border: none;
		outline: none;
		background: none;
		list-style: none;
		font-family: "Helvetica Neue", Helvetica, Arial, "微软雅黑", sans-serif;
		transition: all 0.3s;
	}
	#title {
		margin: 0.5em auto;
		text-align: center;
		color: #33b5e5;
		font-weight: bolder;
	}

	#form {
		width: 90%;
		max-width: 600px;
		height: 20em;
		padding: 1em;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		margin: auto;
	}

	#searchbox {
		width: 70%;
		height: 1.5em;
		padding: 0.5em 1em;
		border: 1px solid #aaa;
		font-size: 1em;
		color: #555;
	}
	#searchbox:focus {
		border: 1px solid #33b5e5;
		box-shadow: 0 0 1em #33b5e5;
	}

	#submit {
		width: 23%;
		height: 2.6em;
		display: block;
		float: right;
		padding: 0.5em 1em;
		font-size: 1em;
		background: #33b5e5;
		color: #fff;
		cursor: pointer;
	}
	#submit:hover {
		background: #4df;
	}
	#submit:active {
		background: #19c;
	}

	.form-row {
		margin: 0.5em auto;
		color: #333;
	}
	.form-center {
		text-align: center;
	}

	.form-row span {
		margin: 0 0.3em;
	}
	</style>
</head>
<body>

	<form action="./search.php" method="GET" id="form">
		<h1 id="title">Thesis Engine</h1>
		<p class="form-row form-row-main">
			<input type="text" name="s" id="searchbox">
			<input type="submit" id="submit" value="搜索">
		</p>
		<br>
		<p class="form-row form-center">搜索范围（默认为所有）：</p>
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

</body>
</html>