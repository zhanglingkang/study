#!/bin/sh

checkProcess(){
	if [ $1 = "" ];
	then 
		return 1;
	fi;
	processNum=`ps -ef|grep "$1"|grep -v grep|wc -l`;
	if [ $processNum -eq 1  ] ;
	then
		return 0;
	else 
		return 1;
	fi;

}

while [ 1 ] 
do
checkProcess node;
num=$?;
if [ $num -eq 1 ] ;
then 
echo start
#重启关闭的服务
nohup node /data/lib/yui-builder1.js > no & 
fi;
sleep 1;
done
