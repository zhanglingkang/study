var eventSource=new EventSource("stream");
eventSource.onmessage=function(event){
    console.log("messsage");
    console.log(event.data);
};
eventSource.onopen=function(event){
    console.log("onopen");
//    debugger;
    console.log(event.data);
}
eventSource.onerror=function(event){
    console.log("onerror");
    console.log(new Date());
//    debugger;
    console.log(event.data);
}