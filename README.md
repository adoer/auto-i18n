# auto-i18n

Vue文件识别中文的规则	国际化前	国际化后
1、template部分		
       1）、	>含有中文的字符<	>{{$t('TRANSLATE_X')}}<
       2）、	next-text="下一页"	:next-text="$t('TRANSLATE_X')"
		
2、JS部分		
       1）、	'含有中文的字符'	this.$t('TRANSLATE_X')
		
3、其他		
       1）、	含有 // noAuto 注释	不做任何处理
       2）、	同一行代码中，只能有一个地方满足上面一个规则！	
