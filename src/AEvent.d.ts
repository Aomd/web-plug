interface AEvent {
    new(): this
    _event:Object;
    _emit(eventName:string,arg:object):void;
    on(eventName:string,fun:Function):void | null;
    off(eventName:string,fun:Function):void | null;
}

declare var AEvent:AEvent
export{
    AEvent
}