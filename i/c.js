var F=function(W,D){
	var 
	ROOT='',
	body=D.body,
	ck=function(dir){
		if(ROOT)
			dir=ROOT+'/'+dir;

		return dir
			.replace(/^\//,'')
	},
	en=encodeURIComponent,
	x=function(arg){
		arg=$.toArr(arguments);
		arg[0]='x.php?'+arg[0];
		return $.x.apply(this,arg)
	},proxy=function(dir){
		if(dir.match(/php|html$/i))
			return 'x.php?read='+en(dir)

		if(dir.match(/mp4|aac|m4a|mp3|flv$/i))
			return 'video.html#'+dir
		return dir
	},reli=function(o){

		if(o.type==0){
			return ('<li class="path-file" dir="'+(o.name)+'">\
				<span class="check"></span>\
				<a href="'+proxy(ck(o.name))+'" target="_blank">\
					'+function(h,ext){
						
						if(o.name.match(/gif|jpeg|jpg|png$/i)&&o.size>1e4){
							if(o.image)
								h='<div class="cover img"><img src="'+o.image+'"></div>';
							else
								h='<div class="cover img"><img src="_thumb/'+ck(o.name).replace(/\//g,'_')+'.jpg" orsrc="'+ck(o.name)+'"></div>';
						}else if(o.name.match(/gif|jpeg|jpg|png|ico|svg$/i)){
							if(o.image)
								h='<div class="cover img"><img src="'+o.image+'"></div>';
							else
								h='<div class="cover img"><img src="'+proxy(en(ck(o.name)))+'"></div>';
						}else if(ext=o.name.match(/\.\w+$/)){
							h='<div class="cover">'+ext+'</div>';
						}else{
							h='<div class="cover empty"></div>';
						}
						return h
					}('')+'\
					<time>'+o.unix.reDate()+'</time>\
					<size>'+o.size.reSize()+'</size>\
					<h4>'+o.name+'</h4>\
				</a>\
			</li>');
		}else
			return ('<li  class="path-folder" dir="'+(o.name)+'">\
				<span class="check"></span>\
				<a href="#!'+ck(o.name)+'">\
					<div class="cover folder"></div>\
					<time>'+o.unix.reDate()+'</time>\
					<size>'+o.size.reSize()+'</size>\
					<h4>'+o.name+'</h4>\
				</a>\
			</li>');
	},getli=function(o){
		var 
		div=$.D('div');
		div.css('position:absolute;overflow:hidden;height:0;');
		div.innerHTML=reli(o);
		div.addTo();
		
		return $('li',div);
	},path=function(dir){

		var 
		h=[],
		path=dir.split('/'),
		all_path=[],
		now=path.pop();

		h.push(now?'<a href="#!">首页</a>':'<b>首页</b>');

		path.each(function(o){
			if(!o)
				return 1;

			all_path.push(o);
			h.push('<a href="#!'+all_path.join('/')+'">'+o+'</a>')
		})
		if(now)
			h.push('<b>'+now+'</b>');
		$('#path').innerHTML=h.join('<span>/</span>');

		x('path='+en(dir||''),function(r,h){
			if(r.error)
				return alert(r.error)&&path();

			h=[];
			r.each(function(o){
				if(!o.name)
					return 1

				h.push(reli(o));
			});
			$('#m').innerHTML=h.join('');

			$$('#m img[orsrc]').each(function(o,i){
				if(!o.onerror)o.onerror=function(){
					this.onerror=null
					var img=this;
					x('resize='+en(this.getAttribute('orsrc')),function(r){
						img.src=r
					});
				}
			})
		});
	
	},addfile=function(o){
		var li=getli(o);

		$('#m').add(li);
		return li;
	},upFile=function(name,file){
		x('up='+en(ck(name)),file);
		addfile({
			name:name,
			type:0
		});
	},mkdir=function(name){
		if(!name)
			name=prompt('请输入新建文件夹名称：','新建文件夹');
		x('mkdir='+en(ck(name)),function(r){
			if(r.error)
				return alert(r.error);

			addfile({
				name:name,
				type:1
			});
		});
		return false;

	},delFile=function(){
		$$('[check="yes"]').each(function(dom){
			if(confirm('确认删除 '+$('h4',dom).innerHTML+' 么？')){
				dom.del();
				var dir=dom.getAttribute('dir');
				x('delete='+en(ck(dir)));
			}
		})
	},rename=function(){
		$$('[check="yes"]').each(function(dom){
			var old=dom.getAttribute('dir');
			var now=prompt('新名字为？',old);
			if(!now)
				return;

			x('rename='+en(ck(old))+'&new='+en(ck(now)));

			$('h4',dom).innerHTML=now;
		});
	},showUrl=function(){
		var 
		h=[],
		o=$$('[check="yes"]'),
		url=location.protocol+'//'+location.host+'/';
		if(!o)
			return;

		o.each(function(dom){
			h.push(url+ck(dom.getAttribute('dir')));
		});
		prompt('文件真实地址如下:',h.join('\n'));
	},pitchAll=function(){
		$$('#m>li').each(function(dom){
			dom.setAttribute('check','yes')
		});
		return false;
	},pitchCancel=function(){
		$$('#m>li').each(function(dom){
			dom.setAttribute('check','no');
		});
		return false;
	};


	$('#m').onclick=function(e){
		e=e||W.e;
		var o=e.target;
		if(o.className=='check'){
			var pa=o.parentNode;
			if(pa.getAttribute('check')!='yes'){
				pa.setAttribute('check','yes');
			}else{
				pa.setAttribute('check','no');
			}
		}
	}

	var pop=function(){
		path(ROOT=decodeURIComponent(location.hash.substr(2)));
	};

	W.onhashchange=pop;

	pop();

	$.j('i/imenu.css');
	$.j('i/itorr.menu.js',function(){
		$.Menu.reg('body',[{
			text:'全选',
			key:'⌃+a/⌘+a',
			func:pitchAll
		},{
			text:'新建',
			child:[{
				text:'文件夹',
				key:'^+⇧+n/⌘+⇧+n'
			},{
				type:'hr'
			},{
				text:'文本',
				func:function(){
					upFile('新建文本.txt','新建文本文件');
				}
			},{
				text:'网页文件',
				func:function(){
					upFile('sample.html','<html>');
				}
			},{
				text:'层叠样式表',
				func:function(){
					upFile('1.css','html{}');
				}
			},{
				text:'JavaScript',
				func:function(){
					upFile('1.js','~1');
				}
			},{
				text:'PHP',
				func:function(){
					upFile('1.php','<?php');
				}
			}]
		}]).reg('.path-file',[{
			text:'获取文件链接',
			key:'⇧+↩',
			func:showUrl
		},{
			text:'重命名',
			key:'F2',
			func:rename
		},{
			text:'删除',
			key:'del',
			func:delFile
		}],{
			open:function(dom){
				if(dom.getAttribute('check')!='yes'){
					$$('[check="yes"]').each(function(dom){
						dom.setAttribute('check','no');
					})
				}
				dom.setAttribute('check','yes');
			}
		}).reg('.path-folder',[{
			text:'打开目录',
			func:function(dom){
				location.href=$('a',dom).href;
			}
		},{
			text:'重命名',
			key:'F2',
			func:rename
		},{
			text:'删除目录',
			key:'del',
			func:delFile
		}],{
			open:function(dom){
				if(dom.getAttribute('check')!='yes'){
					$$('[check="yes"]').each(function(dom){
						dom.setAttribute('check','no');
					})
				}
				dom.setAttribute('check','yes');
			}
		});
	});
	$('.path-mode').onclick=function(){
		
		var A;
		if(body.getAttribute('skin')!=2){
			A=2;
		}else{
			A=1;
		}

		$.stor('skin',A);
		body.setAttribute('skin',A);
	};
	body.setAttribute('skin',$.stor('skin')||1);

	$.j('i/jwerty.js',function(){
		jwerty.key('del',delFile);
		jwerty.key('F2',rename);
		jwerty.key('⇧+↩',showUrl);
		jwerty.key('^+⇧+n/⌘+⇧+n',mkdir);
		jwerty.key('⌃+a/⌘+a',pitchAll);
		jwerty.key('⌃+d/⌘+d',pitchCancel);
	});

	$.j('i/up.js',function(){
		var 
		uping_file,
		uping_plan;

		UP.init({
			dom:$('body'),
			//input:$('input[type="file"]'),
			begin:function(file){
				uping_file=addfile({
					name:file.name,
					type:0,
					image:W.URL.createObjectURL(file),
					size:file.size,
					unix:new Date().getTime()
				});

				uping_plan=$.D('span');
				uping_plan.className='up-plan';
				uping_file.add(uping_plan);
			},
			upload:function(r){
				uping_plan.style.cssText='height:'+(1-r)*100+'%';
			},
			error:function(){
				alert('上传出错，请重试或调试！');
				uping_file.add();
			},
			success:function(r){
				uping_plan.style.cssText='height:0%';
			}
		});
	});
	return {
		x:x,
		ck:ck,
		path:path,
	}
}(this,document);