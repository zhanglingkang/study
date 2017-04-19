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