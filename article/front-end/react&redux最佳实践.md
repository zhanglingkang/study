1. 快速切换菜单时，如果想取消点击前一个菜单时发起的action，如何实现?

* 设置mounted变量，在promise的回调里判断mounted
    
    
缺点：1. 没有取消ajax请求。2. 麻烦，每个组件都得设置这个变量  
   
* 存储所有的ajax请求，发送一个取消ajax请求的action   
        

2. 两个组件发起了相同的action，如何实现屏蔽掉前一个action?

* 在发起action的两个组件的父组件里发一次action

缺点：1.不够智能 2.发起的action与父组件没有什么直接关联

3. 在某个action之后执行另外一个action（比如编辑、删除、新增之后刷新列表），更优雅的方式?

* 前一个action的回调函数里执行第二个action

4. 数据竞争？

5. 使用redux-saga如何实现成功添加一条记录后刷新列表的功能

* 监听添加记录成功的action，然后刷新数据

6. 处理loading态

一个系统里loading的展现方式可能有很多种，但是对应的数据处理逻辑确实一样的
发请求前showLoading，请求完成（包括成功和失败）后hideLoading，如果不想一遍遍的写这个逻辑，怎么做，能否用面向切面的方式来完成。

7. 单向数据流的优势

保持逻辑简单清晰，出现了bug容易定位。

8. 使用redux-saga时处理action有两种方式

* saga处理action，执行某个动作
    
* reducer处理action，进行数据转换

9.痛恨重复性工作

* 处理loading的逻辑提取冲去，简单化
    
* 创建action的逻辑提取重复，简单化