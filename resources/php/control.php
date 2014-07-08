<?php
	$con = mysqli_connect("localhost", "root", "p3rfecto", "f3");
	if (isset($_GET["action"])) $action = $_GET["action"];
	if (isset($_GET["page"])) $page = $_GET["page"];
	if (isset($_GET["offset"])) $offset = $_GET["offset"];
	if (isset($_GET["pageSize"])) $pageSize = $_GET["pageSize"];
	if (isset($_GET["postId"])) $postId = $_GET["postId"];
	if (isset($_POST["title"])) $title = mysqli_real_escape_string($con, $_POST["title"]);
	if (isset($_POST["content"])) $content = mysqli_real_escape_string($con, $_POST["content"]);
	if (isset($action)) $action();
	mysqli_close($con);

	function getPosts() {
		global $con;
		$pageSize = $_GET['pageSize'];
		if (isset($_GET['offset'])) {
			$offset = $_GET['offset'];
		} else {
			$offset = 0;
		}
		$rowCountQuery = "SELECT COUNT(*) AS rowCount FROM posts";
		$postsQuery = "SELECT * FROM posts ORDER BY id DESC LIMIT $pageSize OFFSET $offset";
		$rowCountResult = mysqli_query($con, $rowCountQuery);
		$postsResult = mysqli_query($con, $postsQuery);

		$rowCount = mysqli_fetch_assoc($rowCountResult);
		$posts = mysqli_fetch_assoc($postsResult);

		$xml = new DOMDocument("1.0", "UTF-8");
		$root = $xml->createElement('data');
		$info = $xml->createElement('info');
		$postsRoot = $xml->createElement('posts');
		$xml->appendChild($root);

		foreach ($rowCount as $key => $value) {
			$keyTag = $xml->createElement($key);
			$valueText = $xml->createTextNode($value);
			$keyTag->appendChild($valueText);
			$info->appendChild($keyTag);
	  	}

		foreach ($postsResult as $postsRow) {
			$postsTag = $xml->createElement('post');
			foreach ($postsRow as $key => $value) {
				$keyTag = $xml->createElement($key);
				$valueText = $xml->createTextNode($value);
				$keyTag->appendChild($valueText);
				$postsTag->appendChild($keyTag);
		  	}
		  	$postsRoot->appendChild($postsTag);
		}
		$root->appendChild($info);
		$root->appendChild($postsRoot);
		header('Content-type: application/xml');
		echo $xml->saveXML();	
	}

	function addPost() {
		global $con, $title, $content;
		$addPostQuery = "INSERT INTO posts (title, content) VALUES ('$title', '$content')";
		mysqli_query($con, $addPostQuery);
		header('Content-type: application/json');
		echo json_encode("addPost complete");
	}

	function editPost() {
		global $con, $postId, $title, $content;
		$editPostQuery = "UPDATE posts SET title = '$title', content = '$content' WHERE id = $postId";
		mysqli_query($con, $editPostQuery);
		header('Content-type: application/json');
		echo json_encode("editPost complete");
	}

	function deletePost() {
		global $con, $postId;
		$deletePostQuery= "DELETE FROM posts WHERE id = $postId";
		mysqli_query($con, $deletePostQuery);
		header('Content-type: application/json');
		echo json_encode("deletePost complete");
	}
?>