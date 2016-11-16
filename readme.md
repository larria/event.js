# event.js - JS事件体系模块

### 特性

- 支持事件委派（非focus、blur等不冒泡事件除外）
- 支持监听及手动触发自定义虚拟事件
- 支持封装tap、scrollend等自定义特殊事件
- 支持广播机制
- 基于原生js，无第三方依赖

### 资源引用

``` html
<script src="src/event.js"></script>
```

### API

#### 核心方法

##### on(element, event\[, selector\], fn) : 在element上监听event事件，当设定selector时为委派

```javascript
// 普通事件监听
evt.on(element, 'click', function (e) {
    alert('Got clicked on: ' + this.className);
});
// 委派事件监听
evt.on(wrap, 'click', '.child', function (e) {
    alert('Got clicked on: ' + this.className + ', from delegate');
});
```

##### off(element\[, event, selector, fn\]) : 为element解绑事件

```javascript
// 解除wrap节点上委派给子节点的click事件监听onclick
evt.off(wrap, 'click', '.child', onclick);
// 解除element节点上的click事件特定监听onclick
evt.off(element, 'click', onclick);
// 解除element节点上的所有click事件监听
evt.off(element, 'click');
// 解除element节点上的所有事件监听
evt.off(element);
```

##### trigger(element, event\[, eventFix\]) : 手动触发事件

`eventFix为对象类型，可用以为事件监听者补充必要数据（自定义虚拟和封装事件时使用较多），但禁用以下键名：target、type`

```javascript
// 在element上手动触发click事件，（可选）并补齐事件对象信息
evt.trigger(element, 'click', {
    pageX : 0,
    pageY : 0
});
// 自定义虚拟事件监听和触发
evt.on(element, 'custom', function (e) {
    alert('Got custom on: ' + this.className + ' , with message: ' + e.msg);
});
evt.trigger(child, 'custom', {
    msg : 'From a virtual event'
});
// 自定义虚拟事件委派监听和触发
evt.on(wrap, 'custom', '.child', function (e) {
    alert('Got custom on: ' + this.className + ', from delegate');
});
evt.trigger(child3, 'custom');
```

##### special : 封装复杂事件容器，用于封装tap等常用复杂事件、以及input、DOMSubtreeModified等事件的跨浏览器兼容

```javascript
// 封装一个tap事件
evt.special.tap = function (el) {
    var isTap = false,
        timeLimit;
    evt._addEvent(el, 'touchstart', function (e) {
        isTap = true;
        timeLimit = setTimeout(function () {
            isTap = false;
        }, 200);
    });
    evt._addEvent(el, 'touchmove', function (e) {
        isTap = false;
        timeLimit && clearTimeout(timeLimit);
    });
    evt._addEvent(el, 'touchend', function (e) {
        if(isTap) {
            evt._dispatch(el, 'tap', e);
        }
        timeLimit && clearTimeout(timeLimit);
    });
};
// 封装完成后，tap可像普通事件一样添加监听（和移除）
evt.on(element, 'tap', function () {
    alert('Got tapped on: ' + this.className);
});
// 也可委派
evt.on(wrap, 'tap', '.child', function () {
    alert('Got tapped on: ' + this.className + ', by delegate');
});
```

##### subscribe(event, fn) : 订阅广播

##### unsubscribe(event\[, fn\]) : 取消订阅广播

##### publish(event\[, data\]) : 发布广播

`data为对象类型，可用于为广播监听者补充必要数据，但禁用以下键名：target、type`

```javascript
// 广播机制综合实例
// NO.1订阅者
evt.subscribe('aMsg', aMsgHanderNO1);
function aMsgHanderNO1 (data) {
    alert('Subscriber NO1 got a broadcast named "' + data.type + '", with message: "' + data.msg + '"');
}
// NO.2订阅者
evt.subscribe('aMsg', function (data) {
    alert('Subscriber NO2 aslo got a broadcast named "' + data.type + '", with message: "' + data.msg + '"');
});
// 广播
evt.publish('aMsg', {
    msg : 'msg a'
});
// 可直接广播，不带信息
evt.publish('aMsg');
// 取消NO.1订阅者的订阅行为
evt.unsubscribe('aMsg', aMsgHanderNO1);
// 也可直接取消所有订阅者的订阅行为
evt.unsubscribe('aMsg');
```

#### 别名

- bind(element, event, fn) : 在element上监听event事件

- unbind(element\[, event, fn\]) : 解除element上event事件的监听

- delegate(element, event, deleQuery, fn) : 在element上委派监听event事件

- undelegate(element\[, event, deleQuery, fn\]) : 解除element上委派的event事件的监听