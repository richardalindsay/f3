<?php
	$postId = $_GET["postId"];
	$con = mysqli_connect("localhost", "root", "p3rfecto", "f3");
	$result = mysqli_query($con, "SELECT * FROM posts WHERE id = '$postId'");
	while($row = mysqli_fetch_array($result)) {
		$title = $row['title'];
		$content = $row['content'];
	}
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<link rel="stylesheet" type="text/css" href="../css/stylesheet.css">
		<title>f3</title>
	</head>
	<body>
		<div id="header">
			<h1>f3</h1>
		</div>
		<form id="editPost" method="post" action="control.php?action=editPost&postId=<?=$postId;?>">
			<input type="text" name="title" value="<?=$title;?>"><br>
			<textarea name="content"><?=$content;?></textarea><br>
			<input type="submit" name="submit" value="edit">
		</form>
	</body>
</html>