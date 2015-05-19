<?php

function output($r){
	$r=defined('JSON_UNESCAPED_UNICODE')?json_encode($r,JSON_UNESCAPED_UNICODE):json_encode($r);
	//exit(print_r($r));
	if(isset($_GET['cb'])&&preg_match('/^[\w_\-\.$]{1,200}$/',$_GET['cb'])){
		header('Content-type: application/javascript;charset=utf-8');
		exit($_GET['cb'].'('.$r.')');
	}else{
		header('Content-type: application/json;charset=utf-8');
		header('Access-Control-Allow-Origin: *');
		exit($r);
	}
}
function deleteDir($dir){
	if(is_file($dir))
		$r=unlink($dir);
	
	else if(is_dir($dir)&&rmdir($dir)==false){
		if(!$dp=opendir($dir))
			err('Not permission');
			
		while(($file=readdir($dp))!=false)
			if($file!='.' && $file!='..')
				deleteDir($file);
		
		closedir($dp);
		
	}
}
function err($i='出错了！'){
	output(array('error'=>$i));
}

$ROOT='./';
//$ROOT='H:/';
$r=null;

function ck($fname,$exists=0){
	global $ROOT;

	$path=$ROOT.$fname;
	$path=str_replace('..','',$path);

	if($exists==1&&!file_exists($path))
		err('目录/或文件不存在');

	if($exists==2&&file_exists($path))
		err('目录/或文件已存在');

	return $path;
}


if(isset($_GET['path'])){
	$dir=ck($_GET['path'],1).'/';

	$dh=opendir($dir);
	$r=array();
	while(($file=readdir($dh))!=false){
		if(preg_match('/^(\.+|_thumb|\$RECYCLE\.BIN|System Volume Information|msdownld\.tmp|Config\.Msi|\.DS_Store|\.idea|\.svn|i|image\.resize\.php|x\.php|video\.html|index\.html|favicon\.ico)$/',$file))
			continue;

		$unix = filemtime($dir.$file);
		$type = is_dir($dir.$file)?1:0;
		$size = filesize($dir.$file);
		$r[]=array(
			'name'=>$file,
			'type'=>$type,
			'size'=>$size,
			'unix'=>$unix,
		);
	}
	closedir($dh);
}else if(isset($_GET['rename'])){
	$old=ck($_GET['rename'],1);
	$new=ck($_GET['new'],2);
	if($r=rename($old,$new))
		$r=$new;

}else if(isset($_GET['delete'])){
	$dir=ck($_GET['delete'],1);
	deleteDir($dir);



}else if(isset($_GET['up'])){
	$r=ck($_GET['up']);
	file_put_contents($r,file_get_contents('php://input'));
}else if(isset($_GET['read'])){
	$dir=ck($_GET['read']);
	//$r=file_get_contents($dir);
	preg_match('/\.\w+?$/',$dir,$ext);
	preg_match('/\/?[\w.]+?$/',$dir,$file_name);
	
	if($ext){
		$ext=substr($ext[0],1);
		//print_r($ext);
	}

	if($file_name){
		$file_name=$file_name[0];
	}
	$exts=array(
		'jpg'=>'image/jpeg',
		'jpeg'=>'image/jpeg',
		'gif'=>'image/png',
		'png'=>'image/png',
		'json'=>'application/json',
		'css'=>'text/css',
		'js'=>'text/javascript',
		'txt'=>'text/plain',
		'htm'=>'text/plain',
		'html'=>'text/plain',
		'php'=>'text/plain',
		'ico'=>'image/x-icon',
		'svg'=>'image/svg+xml',
	);
	//print_r($exts[$ext]);

	if(!in_array($ext,array_keys($exts))){
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename="'.$file_name.'"');
	}else
		header('Content-Type: '.$exts[$ext]);
		header('Content-Disposition: inline; filename="'.$file_name.'"');
	
	readfile($dir);
	exit();
}else if(isset($_GET['resize'])){
	require('image.resize.php');
	$dir=ck($_GET['resize'],1);
	//$thumb=preg_replace('/(\/)(.+?\.)(gif|png|jpg|jpeg)$/','$1_thumb/$2$3',$dir);
	$thumb=preg_replace('/\//','_',$_GET['resize']);
	$thumb=ck('_thumb/'.$thumb.'.jpg',0);
	$thumb=str_replace($ROOT,'',$thumb);

	// if(!file_exists('_thumb'))
	// 	mkdir('_thumb',0777,1);

	$resizeimage = new resizeimage($dir,'200','200',"0",$thumb);
	exit($thumb);
}else if(isset($_GET['mkdir'])){
	$dir=ck($_GET['mkdir'],2);
	$r=mkdir($dir,0777,1);
}

output($r);