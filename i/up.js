var UP=function(W,D){
	if(!W.FileReader)
		return alert('浏览器环境不支持 file API');



	var 
	plan=D.createElement('span');
	plan.style.cssText='position:absolute;position:fixed;top:0;height:2px;background:red;z-index:9e9;';

	var 
	begin,
	upload,
	success,
	error=alert;

	var handleFile=function(files){
		if(files.length==0)
			return error('如果拖图像进来我会很高兴哟~');


		
		var 
		_i=0,
		_num=files.length,
		file,
		f=function(){
			file=files[_i];
				

			if(begin)
				begin(file);//W.URL.createObjectURL(file)

			console.log('上传中...('+_i+'/'+_num+')');

			var x=new XMLHttpRequest();

			if(x.upload)
				x.upload.onprogress=function(e){
					if(upload)
						upload(e.loaded/e.total);
					else
						plan.style.cssText+='width:'+e.loaded/e.total*100+'%';
				};
			

			x.onload=function(e){
				plan.style.cssText+='width:0';

				var r=x.responseText;

				if(error&&r.match(/error/))
					error(r);
				else if(success)
					success(r);


				_i++;
				if(_i<_num)
					f();
				else
					console.log('上传完成');
				
			};
			x.open('POST','x.php?up='+encodeURIComponent(F.ck(file.name)),true);
			x.send(file);
			

		};
		f();
	}

	var 
	UP={
		init:function(o){
			var 
			dom=o.dom||document.body;

			dom.ondragenter=function(e){
				this.style.cssText+='outline:2px solid red;';
			};
			dom.ondragleave=function(e){
				this.style.cssText+='outline:none;';
			};
			dom.ondragover=function(e){
				e.preventDefault();
			};
			dom.ondrop=function(e){
				e.preventDefault();
				handleFile(e.dataTransfer.files);
			};


			var A;
			if(A=o.input)
				A.onchange=function(){
					handleFile(this.files)
				};
			
			if(A=o.begin)
				begin=A;

			if(A=o.upload)
				upload=A;

			if(A=o.success)
				success=A;

			if(A=o.error)
				error=A;


		}
	};
	

	return UP;
}(this,document);