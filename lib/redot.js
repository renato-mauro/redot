var redot = { };

/// DOCUMENT TEMPLATE ////////////////////////////////////////////////////////////////////////////////////

var enterQueue = [];

var inverseBindings = {};

redot.inverseForTagName = function(tagName, callback)
{
    inverseBindings[tagName] = callback;
}

function registerInverseForElement(element,attrs)
{
    var callback = inverseBindings[element.tagName];
    if(callback)
    {
        callback(element,attrs);
    }
}

redot.inverseForTagName("INPUT",function(element, attrs) 
{
    var attrValue = attrs["value"];
    if(attrValue.inverse)
    {
        element.inverseBind = function()
        {
            var context = element._context;
            attrValue.inverse.call(context,element.value);
        }
    }        
});
    
redot.inverse = function()
{
    if(redot.element.inverseBind)
    {
        redot.element.inverseBind();
    }
    else
    {
        // TODO: Throw an error, indicating attribute is not invertible
    }
}

function getTemplateFactory(f)
{
    if(f.template)
    {
        return f.template;
    }
    
    var replacement = {};
            
    // Extract Template between last /* and */ comments
    var reTemplate = /\/\*+\s*(([^*]|\*(?!\**\/))*)\*+\/\s*\}\s*$/g;
    var matches = reTemplate.exec(f.toString());
    if(!matches)
    {
        throw { message: 'template not found', source: f };
    }
    var templateText = "";
    if(matches.length > 1)
    {
        templateText = matches[1].trim();
    }
    if(templateText.length == 0)
    {
        throw { message: 'empty template', source: f };            
    }
    templateText = "<template>"+templateText+"</template>";
    
    // remove all code blocks from template before parse XML
    // we must accept {d.value<10&&d.value>30} and XML parser
    // will not accept <, and &&. Blocks are replaced by 
    // {a0}, {a1}, ... {ak-1} and the original block is stored in 
    // the replacement variable. Parse also allows brackets inside
    // strings like "{{{{{Hello}}}}}"
    var propertiesDescritor = {};
    var count = 0;
    var reBlocks = /\{((("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|[^}"'])*)\}/g;
    var templateText = templateText.replace(reBlocks,function(_,block){ 
        var key="{"+count+"}";
        replacement[key] = block;
        count++;
        return key;
    });
    
    // DOMParser not throws exception in the case of document error. Instead of,
    // it generates a XML document with error information. If there is a tag with name
    // parsererror, it indicates that the document was not parsed properly. Is so,
    // we try to grab error information from the xml generated, such as error message or
    // line and column where the parser detected the error.
    var p = new DOMParser();
    var templateDocument = p.parseFromString(templateText.trim(),"text/xml");
    var parserError = templateDocument.getElementsByTagName("parsererror");
    if(parserError.length > 0)
    {
        var errorInfo = /error on line ([0-9]+) at column ([0-9]+):\s*([^:]+)/.exec(parserError[0].textContent);
        throw { message: "template parse error - " + errorInfo[3], line: ~~errorInfo[1], column: ~~errorInfo[2] };
    }
            
    function processText(textContent,createInverse)
    {
        textContent = textContent.trim();
        if(textContent.length)
        {
            var reExpression = /\{[0-9]+\}/g;
            var match = reExpression.exec(textContent);
            var lastIndex = 0;
            var expressionParts = [];
            var hasBlock = false;
            while(match)
            {
                if(match.index > lastIndex)
                {
                    expressionParts.push(JSON.stringify(textContent.substring(lastIndex,match.index)));
                }
                expressionParts.push("("+replacement[match[0]]+")");
                hasBlock = true;
                lastIndex = reExpression.lastIndex;
                match = reExpression.exec(textContent);    
            }   
            if(textContent.length > lastIndex)
            {
                expressionParts.push(JSON.stringify(textContent.substring(lastIndex)));
            }

            var inverse = null;
            
            if(createInverse)
            {
                if(hasBlock)
                {
                    if(expressionParts.length == 1)
                    {
                        var reSimpleExpression = /^\(([a-zA-Z_]+(\.[a-zA-Z_0-9]+)+)\)$/g;
                        var match = reSimpleExpression.exec(expressionParts[0]);
                        if(match)
                        {
                            inverse = new Function("_", "with(this)"+match[1]+"=_");
                        }
                    }
                }
            }
            var resp = redot.createExpressionFunction(expressionParts.join("+"));
            resp.inverse = inverse;
            return resp;
        }
    }
    
    function createTextContentBind(element, context, attr)
    {
        var lastValue = undefined;

        function bind()
        {
            if(context.deleted)
            {
                attr.unregisterObserver(context,bind);
                return;
            }
            redot.element = element;
            var value = attr.apply(context);
            redot.element = null;
            if(lastValue !== value)
            {
                if(value !== null)
                {
                    element.textContent = value;
                }
                else
                {
                    element.textContent = "";
                }
                lastValue = value;
            }
        }     
     	attr.registerObserver(context,bind); 
        bind();
    }
    
    function createAttrBind(element, context, attrName, attrValue)
    {
        var lastValue = undefined;

        function bind()
        {
            if(context.deleted)
            {
                attrValue.unregisterObserver(context,bind);
                return;
            }

            redot.element = element;
            var value = attrValue.apply(context);
            redot.element = null;
            if(lastValue !== value)
            {
                if(value == null || value === "")
                {
                    element.removeAttribute(attrName);
                }
                else
                {
                    element.setAttribute(attrName, value);
                    lastValue = value;
                }
            }
        };

        attrValue.registerObserver(context,bind);
        bind();
    }
    
    function createStyleBind(element, context, style)
    {
        var lastValue = undefined;

        function bind()
        {
            if(context.deleted)
            {
                for(var sname in style)
                {
                    style[sname].unregisterObserver(context,bind);
                }
                return;
            }

            var aValue = [];
            for(var sname in style)
            {
                redot.element = element;
                var v = style[sname].apply(context);
                redot.element = null;
                if(v != null && v != "")
                {
                    aValue.push(sname,":",v,";");
                }
            }
            var value = "";
            if(aValue.length)
            {
                value = aValue.join("");
            }
            if(value != lastValue)
            {
                if(value.length)
                {
                    element.setAttribute("style",value);
                }
                else
                {
                    element.removeAttribute("style");
                }
                lastValue = value;
            }
        }
        
        for(var sname in style)
        {
        	style[sname].registerObserver(context,bind);
        }
        bind();
    }
            
    function createEventHandler(element, context, eventName, eventAttr)
    {
        function eventHandler(event)
        {
            redot.element = element;
            redot.event = event;
            eventAttr.call(context,context.d,context.i);
            redot.event = null;
            redot.element = null;
        }
        element.addEventListener(eventName,eventHandler);
    }
    
    function visit(node)
    {
        function createTextNodeFactory()
        {
            var attrText = processText(node.textContent);
            if(!attrText)
            {
                return null;
            }

            return function (parentElement, referenceNode, context)
            {
                var element = document.createTextNode("");
                element._context = context;
                parentElement.insertBefore(element, referenceNode);
                createTextContentBind(element, context, attrText);
                return element;
            }
        }

        function createElementNodeFactory()
        {                
            var attrs = { };
            var style = { };
            var events = { };

            for(var i=0; i<node.attributes.length; i++)
            {
                var attr = node.attributes[i];
                if(attr.name == "style")
                {
                    var styleRE = new RegExp(/;?\s*([^:]+):\s*([^;]+)/g);
                    var match;
                    while(match = styleRE.exec(attr.value))
                    {
                        style[match[1]] = processText(match[2]);
                    }
                }
                else
                {
                    var eventHandlerRE = /on([a-zA-Z0-9]+)/;
                    var match = eventHandlerRE.exec(attr.name);
                    if(match)
                    {
                        events[match[1]] = processText(attr.value);
                    }
                    else
                    {
                        attrs[attr.name] = processText(attr.value,true);
                    }
                }
            }

            var childrenFactory = [];

            for(var i=0; i<node.childNodes.length; i++)
            {
                var childNode = node.childNodes[i];
                var factory = visit(childNode);
                if(factory)
                {
                    childrenFactory.push(factory);
                }
            }

            return function (parentElement, referenceNode, context)
            {
                var ns = node.tagName == "svg" ? "http://www.w3.org/2000/svg" : parentElement.namespaceURI;
                var element = document.createElementNS(ns,node.tagName);
                element._context = context;
                for(var event in events)
                {
                    if(event == "enter")
                    {
                        enterQueue.push(element);
                    }
                    createEventHandler(element, context, event, events[event]);
                }
                parentElement.insertBefore(element, referenceNode);
                for(var i=0; i<childrenFactory.length; i++)
                {
                    childrenFactory[i](element,null,context);
                }
                for(var attrName in attrs)
                {
                    createAttrBind(element, context, attrName, attrs[attrName]);
                }
                registerInverseForElement(element,attrs);
                createStyleBind(element,context,style);
                return element;
            }
        }

        function createTemplateFactory()
        {
            var childrenFactory = [];

            for(var i=0; i<node.childNodes.length; i++)
            {
                var childNode = node.childNodes[i];
                var factory = visit(childNode);
                if(factory)
                {
                    childrenFactory.push(factory);
                }
            }

            return function (parentElement, referenceNode, context)
            {
                var resp = null;
                var e = null;
                for(var i=0; i<childrenFactory.length; i++)
                {
                    e = childrenFactory[i](parentElement, referenceNode, context);
                    if(resp == null)
                    {
                        resp = e;
                    }
                }
                if(resp)
                {
                    resp._end = e;
                }
                return resp;
            }
        }

        function createIncludeFactory()
        {
            var attrTemplate = null;
            var attrData = null;

            for(var i=0; i<node.attributes.length; i++)
            {
                var attr = node.attributes[i];
                if(attr.name == "template")
                {
                    attrTemplate = processText(attr.value);
                }
                else if(attr.name == "data")
                {
                    attrData = processText(attr.value);
                }
            }

            return function (parentElement, referenceNode, context)
            {
                var template = null;
                var data = null;
                if(attrTemplate != null)
                {
                    template = attrTemplate(context.d,context.i);
                    if(typeof template == "string")
                    {
                        console.log(this);
                        template = this[template];
                    }
                }
                if(template == null)
                {
                    throw { message: "Template Not Found - " + template };
                }
                data = attrData != null ? attrData.apply(context) : dataObject;
                return applyTemplateInternal(parentElement, referenceNode, template, data, context);
            }
        }

        if(node.nodeType == node.TEXT_NODE)
        {
            return createTextNodeFactory(); 
        }

        if(node.nodeType == node.ELEMENT_NODE)
        {
            if(node.tagName == "template")
            {
                return createTemplateFactory();
            }

            if(node.tagName == "include")
            {
                return createIncludeFactory();
            }

            return createElementNodeFactory();
        }

        return null;
    }
    
    f.template = visit(templateDocument.firstChild);
    return f.template;
}

function processEnterQueue()
{
    for(var i=0; i<enterQueue.length; i++)
    {
        var element = enterQueue[i];
        element.dispatchEvent(new CustomEvent("enter",{bubbles:false,cancelable:true}));
    }
    enterQueue = [];        
}


var waitingDocumentComplete = [];

function enqueueApplyTemplate(parent, templateFunction, data)
{
    waitingDocumentComplete.push(function(){redot.applyTemplate(parent, templateFunction, data)});
}

document.__scriptsLoading = 0;

function processWaitingDocumentComplete()
{
    if(document.readyState == "complete" && waitingDocumentComplete.length && document.__scriptsLoading == 0)
    {
        for(var i=0; i<waitingDocumentComplete.length; i++)
        {
            waitingDocumentComplete[i]();
        }        
    }    
}

document.onreadystatechange = processWaitingDocumentComplete;
document.__scriptsLoaded = processWaitingDocumentComplete;

redot.applyTemplate = function(parent, templateFunction, data)
{
    if(document.readyState != "complete")
    {
        enqueueApplyTemplate(parent,templateFunction,data);
        return;
    }
    if(document.__scriptsLoading)
    {
        enqueueApplyTemplate(parent,templateFunction,data);
        return;
    }
    if(typeof data == 'function')
    {
        data(function(data2){
            redot.applyTemplate(parent, templateFunction, data2);
        });
        return;
    }
    if(typeof parent == "string")
    {
        parent = document.querySelector(parent);
    }
    if(!parent)
    {
        throw { message: "parent element not defined" };
    }
    enterQueue = [];
    applyTemplateInternal(parent, null, templateFunction, [data]);
    processEnterQueue();
}

function applyTemplateInternal(parent, referenceNode, templateFunction, data, parentContext)
{
    var factory = getTemplateFactory(templateFunction);
    if(factory)
    {
        var beginOfList = document.createComment("{{{" + templateFunction.name);
        parent.insertBefore(beginOfList, referenceNode);
        var endOfList = document.createComment("}}}" + templateFunction.name);
        parent.insertBefore(endOfList, referenceNode);
        beginOfList._end = endOfList;
                           
        var data2 = redot.map(data,templateFunction);
                
        for(var i=0; i<data2.length; i++)
        {
            var obj = data2.item(i);
            obj.parent = parentContext;
            obj._g = factory(parent,endOfList,obj);
        }
        
        function rearrangeItens()
        {
            var currentElement = beginOfList.nextSibling;
            var range = null;
            enterQueue = [];
            for(var i=0; i<data2.length; i++)
            {
                var obj = data2.item(i);
                if(obj._g === undefined) // ENTER
                {
                    obj.parent = parentContext;
                    obj._g = factory(parent, currentElement, obj);
                }
                else
                {
                    if(obj._g == currentElement) // OK
                    {
                        currentElement = currentElement._end.nextSibling;
                    }
                    else // MOVE
                    {
                        if(!range)
                        {
                            range = document.createRange();
                        }
                        range.setStartBefore(obj._g);
                        range.setEndAfter(obj._g._end);
                        var fragment = range.extractContents();
                        currentElement.parentElement.insertBefore(fragment,currentElement);
                    }
                }
            }
            processEnterQueue();
            while(currentElement && currentElement != endOfList)
            {                    
                if(!range)
                {
                    range = document.createRange();
                }
                currentElement._context.deleted = true; // <------------------ stop listening??
                range.setStartBefore(currentElement);
                range.setEndAfter(currentElement._end);
                currentElement = currentElement._end.nextSibling;
                range.deleteContents();
            }
        }
        redot.observeArray(data2,rearrangeItens);
                    
        return beginOfList;
    }
}
/// AJAX AND EXTERNAL RESOURCES /////////////////////////////////////////////////////////////////////////

function getPathForResource(fileName,stackPosition)
{
    var error = new Error();
    var stack = error.stack.split("\n");
    var reErrorStack = /(((?:file|http[s]?):\/\/(?:[^/]*))(?:\/[^/]+)*\/)[^:]+:[0-9]+:[0-9]+/;        
    
    if(stack[0] == "Error") // Chrome
    {
        stack.shift();
    }
    
    var match = reErrorStack.exec(stack[stackPosition]);
    if(match)
    {
        if(fileName.charAt(0) == "/")
        {
            fileName = match[2]+fileName;
        }
        else
        {
            fileName = match[1]+fileName;
        }
        return fileName;
    }
    console.log(error.stack);
    return null;
}    


function preLoadScript(url,callback) 
{
    if(url == null)
    {
        callback(null);
    }
    if(document.__scriptsLoading === undefined)
    {
        document.__scriptsLoading = 1;
    }
    else
    {
        document.__scriptsLoading++;
    }
    
    var request = new XMLHttpRequest();            
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            if(request.status == 0 || request.status == 200)
            {
                callback(request.responseURL);
                document.__scriptsLoading--;
                if(document.__scriptsLoading == 0 && document.__scriptsLoaded)
                {
                    setTimeout(document.__scriptsLoaded,200);
                }
            }
        }
    }
    request.onerror = function errorHandler()
    {
        callback(null);
    }
    request.open('GET',url);
    request.send();                
}

function includeCss(fileName)
{
    function addCss(url)
    {
        if(url)
        {
            var link = document.createElement("link");
            link.setAttribute("rel","stylesheet");
            link.setAttribute("type","text/css");
            link.setAttribute("href",url);
            document.head.appendChild(link);                        
        }
        else
        {
            console.log("ERROR LOADING " + fileName);
        }
    }
    
    preLoadScript(getPathForResource(fileName,3), addCss);
}

function includeScript(fileName)
{
    function addScript(url)
    {
        if(url)
        {
            var script = document.createElement("script");
            script.setAttribute("type","text/javascript");
            document.head.appendChild(script);                        
            script.setAttribute("src",url);
        }
        else
        {
            console.log("ERROR LOADING " + fileName);
        }
    }
    
    preLoadScript(getPathForResource(fileName,3), addScript);
}

redot.include = function(fileName)
{
    var lName = fileName.toLowerCase();
    if(fileName.indexOf(".css") == fileName.length-4)
    {
        includeCss(fileName);
    }
    else if(fileName.indexOf(".js") == fileName.length-3)
    {
        includeScript(fileName);
    }
    else
    {
        throw new Error("Unknown extension in include - " + fileName);
    }
};

redot.json = function(fileName)
{
    var url = getPathForResource(fileName,2);
    return function(callback)
    {
        if(url == null)
        {
            callback(null);
            return;
        }
        var request = new XMLHttpRequest();
        request.onreadystatechange = function()
        {
            if(request.readyState == 4)
            {
                if(request.status == 0 || request.status == 200)
                {
                    callback(JSON.parse(request.responseText));
                }
            }
        };
        request.onerror = function()
        {
            console.log("ERROR!!");
        }

        request.open('GET',url);
        request.send();
    }
};

/// MAP AND REACTIVE OBJECTS //////////////////////////////////////////////////////////////////////////////////

(function MapAndReactiveObjectsSetup()
{
    var pendingUpdateQueue = []; // Callbacks registered to update dependent expressions.
    var timestamp = 1; // Frame count. Used to avoid duplicates in Update Queue.
    var updateScheduled = false; // Flag that controls if update is programmed or not.
    var postponeUpdate = false; // Flag indicating when update must be postponed or not. (1)

    // (1) When arrays are updated, new elements may be inserted, elements may be removed and
    // element may change position. As the visualments reflects the arrays structure, the update
    // must be performed in two frames: In the first frame the structure of DOM elements are changed
    // and in the second frame attributes and style updates. If both modifications are done in the
    // same annimation frame, css transitions does not work, because when a element is removed and then
    // inserted, it does not store its last position and the render will not be able to compute 
    // twin properly.

    // Request Animation Frame. If running in browser, use native
    // function. Otherwise, artificial callback (working in node).
    var raf;
    try 
    {
        raf = window.requestAnimationFrame;
    }
    catch(e) 
    {
        raf = function(callback){setTimeout(callback,100)};
    }

    // Insert in the update queue a callback that adjust a dependente
    // property. callbacks are inserted only once in the same frame.
    // Variable timestamp is used avoid unnecessary repetitions.
    // If update schedule is not set, 
    function registerPendingUpdate(observerCallback)
    {
        if(observerCallback.timestamp != timestamp)
        {
            pendingUpdateQueue.push(observerCallback);
            observerCallback.timestamp = timestamp;
            if(!updateScheduled)
            {
                updateScheduled = true;
                raf(processPendingUpdate);
            }
        }
    }

    // Process current pending update, where callbacks are called
    // to update dependent attributes. 
    function processPendingUpdate()
    {
        // Check if update must be postponed (1) and if so
        // re-schedule update for the next frame.
        if(postponeUpdate)
        {
            postponeUpdate = false;
            raf(processPendingUpdate);
            return;
        }
        updateScheduled = false;
        if(pendingUpdateQueue.length)
        {
            // Empty current queue and process pending updates
            var queue = pendingUpdateQueue;
            pendingUpdateQueue = [];
            timestamp++;
            for(var i=0; i<queue.length; i++)
            {
                queue[i]();
            }
        }
        // During the update, new updates may be trigged, so we have
        // to schedule next update
        if(pendingUpdateQueue.length > 1)
        {
            updateScheduled = true;
            raf(processPendingUpdate);
        }
    }

    var keywords = ["function","var","typeof","true","false","continue",
    "break","throw","return","new","null","undefined","NaN","Infinity"];

    var returnThis = function(){return this};

    // Like in assembly language, (N)o (OP)erator does nothing.
    var NOP = function(){};

    function createBoundProperty(targetObject, propertyName, observer)
    {
        var observers = [observer];
        var value = targetObject[propertyName];
        var getter, setter;

        getter = function() { return value };

        setter = function(newValue)
        {
            if(newValue != value)
            {
                value = newValue;
                for(var i=0; i<observers.length; i++)
                {
                    registerPendingUpdate(observers[i]);
                }
            }
        };

        getter.registerObserver = function(targetObject, observer)
        {
            observers.push(observer);
        }

        getter.unregisterObserver = function(targetObject, observer)
        {
            for(var i=observers.length-1; i>=0; i--)
            {
                if(observers[i]==observer)
                {
                    observers.splice(i,1);
                }
            }
        }

        Object.defineProperty(targetObject, propertyName, { get: getter, set: setter, configurable: false, enumerable: true });
    }

    function registerObserver(targetObject, propertyName, observer)
    {
        if(targetObject.constructor == Array && propertyName == "length")
        {
            observeArrayLength(targetObject, observer);
            return;
        }
        var desc = Object.getOwnPropertyDescriptor(targetObject, propertyName);
        if(desc == null)
        {
            desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(targetObject),propertyName);
            if(desc == null)
            {
                throw new Error("Object does not have property " + propertyName);
            }
        }
        if(desc.get && desc.get.registerObserver)
        {
            desc.get.registerObserver(targetObject,observer);
        }
        else if(!desc.get && !desc.set && desc.configurable)
        {
            createBoundProperty(targetObject, propertyName, observer);
        }
        else
        {
            throw new Error("Cannot register observer for " + propertyName);
        }
    }

    redot.registerObserver = registerObserver;

    function unregisterObserver(targetObject, propertyName, observer)
    {
        if(targetObject.constructor == Array && propertyName == "length")
        {
            unobserveArrayLength(targetObject, observer);
            return;
        }
        var desc = Object.getOwnPropertyDescriptor(targetObject, propertyName);
        if(desc == null)
        {
            desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(targetObject),propertyName);
        }
        if(desc && desc.get && desc.get.unregisterObserver)
        {
            desc.get.unregisterObserver(targetObject,observer);
        }
    }

    redot.createExpressionFunction = function(expression)
    {
        // dep is a dependence list. Each element is a pair. First element
        // is a function that returns an object used as scope for variable
        // name, the second element.
        var dep = []; 

        // f is a function that encapsulate the expression. It uses with 
        // block to expose current scope object attributes as if they were
        // ordinary variables. 
        var f = new Function("d","i","with(this)return("+expression+")");

        // removing strings from expression. It avoid to create false
        // dependencies, when string contents includes reference to
        // variables.
        expression = expression.split(/"(?:[^"\\]|\\.)*"/g).join("");
        // strings delimited with single quotes. 
        expression = expression.split(/'(?:[^'\\]|\\.)*'/g).join("");

        // variable regular expression, with prefix matching. Ex. abc.def.ghi prefix (abc.def) and variable (ghi)
        // prefix is optional. It also checks if the expression is a function, by matching an optional open
        // parenthesis in the end of expressions.
        var re = /(([a-zA-Z$_][a-zA-Z$_0-9]*(?:\.[a-zA-Z$_][a-zA-Z$_0-9]*)*)\.)?([a-zA-Z$_][a-zA-Z$_0-9]*)(\s*\()?/g;
        var match = re.exec(expression);
        while(match)
        {
            var prefix = match[2];
            var variable = match[3];
            var parenthesis = match[4];
            if(!parenthesis) // ignore function calls
            {
                if(!prefix) // simple variable
                {
                    if(keywords.indexOf(variable)==-1) // ignore keywords
                    {
                        // use this as variable scope resolution
                        dep.push([returnThis,variable]);
                    }
                }
                else
                {
                    // create a function that resolves prefix as scope for variable
                    dep.push([new Function("with(this)return " + prefix),variable]);
                }
            }
            match = re.exec(expression);
        }                                
        if(dep.length)
        {
            f.registerObserver = function(targetObject, observer)
            {
                for(var i=0; i<dep.length; i++)
                {
                    var referenceObj = dep[i][0];
                    var property = dep[i][1];
                    registerObserver(referenceObj.apply(targetObject),property,observer);
                }
            }

            f.unregisterObserver = function(targetObject, observer)
            {
                for(var i=0; i<dep.length; i++)
                {
                    var referenceObj = dep[i][0];
                    var property = dep[i][1];
                    unregisterObserver(referenceObj.apply(targetObject),property,observer);
                }
            }
        }
        else
        {
            f.registerObserver = NOP;
            f.unregisterObserver = NOP;
        }
        return f;
    };

    function createExpressionFunction(expression)
    {
        var fexpression = undefined;

        if(typeof expression == "string")
        {
            var match = /^\{(.*)\}$/.exec(expression);
            if(match)
            {
                fexpression = redot.createExpressionFunction(match[1]);
            }
        }

        if(!fexpression)
        {
            throw new Error("Error in agregate function: (" + expression + "). Tip: expressions must be enclosed by braces { }");
        }

        return fexpression;        
    }

    function stack(expression)
    {
        var fexpression = createExpressionFunction(expression);

        function mapSetup(map, agregateName)
        {
            function updateAgregate()
            {
                var currentValue = 0;
                for(var i=0; i<map.length; i++)
                {
                    var obj = map.item(i);
                    var range = obj[agregateName];
                    if(range == undefined)
                    {
                        obj[agregateName] = range = { };
                    }
                    range.begin = currentValue;
                    currentValue += fexpression.apply(obj);
                    range.end = currentValue;
                }
            }

            function onEnter(map, elements)
            {
                for(var i=0; i<elements.length; i++)
                {
                    var e = elements[i];
                    fexpression.registerObserver(e,updateAgregate);
                }
                updateAgregate(map);
            }

            function onExit(map, elements)
            {
                for(var i=0; i<elements.length; i++)
                {
                    var e = elements[i];
                    fexpression.unregisterObserver(e,updateAgregate);
                }
                updateAgregate(map);
            }

            map.onEnter(onEnter);
            map.onExit(onExit);
            redot.observeArray(map,updateAgregate);
        }

        function __agregateSetup(name, proto, mapSetupList)
        {
            mapSetupList.push(function(map){mapSetup(map,name)});
        }

        return __agregateSetup;
    }

    redot.stack = stack;

    function stack01(expression)
    {
        var fexpression = createExpressionFunction(expression);

        function mapSetup(map, agregateName)
        {
            function updateAgregate()
            {
                var sum = 0;
                for(var i=0; i<map.length; i++)
                {
                    var obj = map.item(i);
                    sum += fexpression.apply(obj);
                }
                var currentValue = 0;
                for(var i=0; i<map.length; i++)
                {
                    var obj = map.item(i);
                    var range = obj[agregateName];
                    if(range == undefined)
                    {
                        obj[agregateName] = range = { };
                    }
                    range.begin = currentValue/sum;
                    currentValue += fexpression.apply(obj);
                    range.end = currentValue/sum;
                }
            }

            function onEnter(map, elements)
            {
                for(var i=0; i<elements.length; i++)
                {
                    var e = elements[i];
                    fexpression.registerObserver(e,updateAgregate);
                }
                updateAgregate(map);
            }

            function onExit(map, elements)
            {
                for(var i=0; i<elements.length; i++)
                {
                    var e = elements[i];
                    fexpression.unregisterObserver(e,updateAgregate);
                }
                updateAgregate(map);
            }

            map.onEnter(onEnter);
            map.onExit(onExit);
            redot.observeArray(map,updateAgregate);
        }

        function __agregateSetup(name, proto, mapSetupList)
        {
            mapSetupList.push(function(map){mapSetup(map,name)});
        }

        return __agregateSetup;
    }

    redot.stack01 = stack01;


    function agregate(agregator, expression)
    {
        var fexpression = createExpressionFunction(expression);

        function mapSetup(map, agregateName)
        {
            function updateAgregate()
            {
                var oldValue = map.agregate[agregateName];
                var currentValue = undefined;
                for(var i=0; i<map.length; i++)
                {
                    currentValue = agregator(currentValue, fexpression.apply(map.item(i)));
                }
                if(currentValue != oldValue)
                {
                    map.agregate[agregateName] = currentValue;
                }
            }

            function onEnter(map, elements)
            {
                for(var i=0; i<elements.length; i++)
                {
                    var e = elements[i];
                    fexpression.registerObserver(e,updateAgregate);
                }
                updateAgregate(map);
            }

            function onExit(map, elements)
            {
                for(var i=0; i<elements.length; i++)
                {
                    var e = elements[i];
                    fexpression.unregisterObserver(e,updateAgregate);
                }
                updateAgregate(map);
            }

            map.agregate[agregateName] = undefined;
            map.onEnter(onEnter);
            map.onExit(onExit);
        }

        function __agregateSetup(name, proto, mapSetupList)
        {
            function getter()
            {
                return this._memberOf.agregate[name];
            }

            getter.registerObserver = function(targetObject, observer)
            {
                registerObserver(targetObject._memberOf.agregate,name,observer)
            }

            getter.unregisterObserver = function(targetObject, observer)
            {
                unregisterObserver(targetObject._memberOf.agregate,name,observer)
            }

            mapSetupList.push(function(map){mapSetup(map,name)});

            Object.defineProperty(proto,name,{get: getter,configurable:false,enumerable:false});
        }

        return __agregateSetup;
    }

    redot.agregate = agregate;

    redot.agregate.max = function(expression)
    {
        function agregator(lastValue, currentValue)
        {
            // first call
            if(lastValue == undefined)
            {
                return currentValue;
            }
            return lastValue < currentValue ? currentValue : lastValue;
        }
        
        return agregate(agregator, expression);
    };

    redot.agregate.min = function(expression)
    {
        function agregator(lastValue, currentValue)
        {
            // first call
            if(lastValue == undefined)
            {
                return currentValue;
            }
            return lastValue > currentValue ? currentValue : lastValue;
        }
        
        return agregate(agregator, expression);
    };

    redot.agregate.sum = function(expression)
    {
        function agregator(lastValue, currentValue)
        {
            // first call
            if(lastValue == undefined)
            {
                return currentValue;
            }
            return lastValue + currentValue;
        }
        
        return agregate(agregator, expression);
    };

    function getterMapElementAggregation(aggregationName)
    {
        return function()
        {
            return this._memberOf[aggregationName];
        }
    }

    function getPrototypeForTemplateObject(templateClass)
    {
        if(!templateClass._proto)
        {
            var inits = [];
            var mapSetupList = [];

            templateClass._mapSetupList = mapSetupList;

            function initSetter(initToAppend)
            {
                inits.push(initToAppend);
            }

            var metaProto = { };
            Object.defineProperty(metaProto, "init", { set: initSetter, configurable: false, enumerable: false});
            templateClass.apply(metaProto);

            var proto = { };
            templateClass._proto = proto;
            var names = Object.getOwnPropertyNames(metaProto);
            for(var i=0; i<names.length; i++)
            {
                var name = names[i];
                if(name == "init")
                {
                    proto.init = function() 
                    { 
                        for(var j=0; j<inits.length; j++)
                        {
                            inits[j].apply(this, [this.d, this.i]);
                        }
                    }
                    continue;
                }
                var property = Object.getOwnPropertyDescriptor(metaProto,name);
                var propertyValue = property.value;
                if(typeof propertyValue == "string")
                {
                    var match = /^\{(.*)\}$/.exec(propertyValue);
                    if(match)
                    {
                        Object.defineProperty(proto,name,{get:redot.createExpressionFunction(match[1]),configurable:false,enumerable:true});
                        continue;
                    }
                }
                else if(typeof propertyValue == "function")
                {
                    if(propertyValue.name == "__agregateSetup")
                    {
                        propertyValue(name,proto,mapSetupList);
                        continue;
                    }
                }
                proto[name] = property.value;
            }
        }
        return templateClass._proto;
    }

    var currentOid = Date.now();

    function getOid(obj)
    {
        if(typeof obj == "object")
        {
            var resp = obj._id;
            if(!resp)
            {
                Object.defineProperty(obj,'_id', { value: currentOid++, writable: false, enumerable: false, configurable: false });
                resp = obj._id;
            }
            return resp;
        }
        return obj;
    }

    redot.observeArray = function(array, callback)
    {
        var obs = array._observers;
        if(!obs)
        {
            array._observers = [callback];
        }
        else
        {
            obs.push(callback);
        }
    };

    function observeArrayLength(array, callback)
    {
        var obs = array._lengthObservers;
        if(!obs)
        {
            array._lengthObservers = [callback];
        }
        else
        {
            obs.push(callback);
        }
    }

    function unobserveArray(array, callback)
    {
        var obs = array._observers;
        if(obs)
        {
            for(var i=obs.length-1; i>=0; i--)
            {
                if(obs[i]==callback)
                {
                    obs.splice(i,1);
                }
            }
        }
    }

    function unobserveArrayLength(array, callback)
    {
        var obs = array._lengthObservers;
        if(obs)
        {
            for(var i=obs.length-1; i>=0; i--)
            {
                if(obs[i]==callback)
                {
                    obs.splice(i,1);
                }
            }
        }
    }

    function changed(array)
    {
        var lobs = array._lengthObservers;
        if(lobs)
        {
            for(var i=0; i<lobs.length; i++)
            {
                registerPendingUpdate(lobs[i]);
            }
        }
        var obs = array._observers;
        if(obs)
        {
            for(var i=0; i<obs.length; i++)
            {
                obs[i]();
            }
        }
    }

    redot.changed = changed;

    redot.filter = function(data, expression)
    {
        if(typeof data == "object" && data.constructor == Array && !data.item)
        {
            data.item = function(i) {return data[i]};
        }

        var fexpression = createExpressionFunction(expression);

        var selectedItens = [];
        var notSelectedItens = [];

        selectedItens.notSelected = function()
        {
            return notSelectedItens;
        }

        function update()
        {
            selectedItens.length = 0;
            notSelectedItens.length = 0;
            for(var i=0; i<data.length; i++)
            {
                var obj = data.item(i);
                if(fexpression.apply(obj,[obj,i]))
                {
                    selectedItens.push(obj);
                }
                else
                {
                    notSelectedItens.push(obj);
                }
            }
            postponeUpdate = true;
            changed(selectedItens);
            changed(notSelectedItens);
        }
        redot.observeArray(data, update);
        postponeUpdate = true;
        update();
        return selectedItens;
    }

    redot.map = function(data, templateClass)
    {
        if(typeof data == "object" && data.constructor == Array && !data.item)
        {
            data.item = function(i) {return data[i]};
        }

        function length()
        {
            return data.length;
        }

        var resp = { agregate: {} };
        var cache = { };
        var onEnterObservers = [];
        var onExitObservers = [];

        resp.onEnter = function(callback)
        {
            onEnterObservers.push(callback);
        }

        resp.onExit = function(callback)
        {
            onExitObservers.push(callback);
        }

        var protoItem = getPrototypeForTemplateObject(templateClass, resp);
        var mapSetupList = templateClass._mapSetupList;

        for(var i=0; i<mapSetupList.length; i++)
        {
            mapSetupList[i](resp)
        }

        resp.item = function(i)
        {
            var ownerObject = data.item(i);
            if(!ownerObject)
            {
                return undefined;
            }
            var oid = getOid(ownerObject);
            return cache[oid];
        }

        function update()
        {
            var enterList = [];
            var exitList = [];
            var moveList = [];
            var flagChanged = false;
            var oldCache = cache;
            cache = { };
            for(var i=0; i<data.length; i++)
            {
                var ownerObject = data.item(i);
                var oid = getOid(ownerObject);
                var scope = oldCache[oid];
                if(!scope)
                {
                    // ENTER
                    scope = Object.create(protoItem);
                    scope._memberOf = resp;
                    scope.i = i;
                    scope.d = ownerObject;
                    scope.init();
                    cache[oid] = scope;
                    flagChanged = true;
                    enterList.push(scope);
                }
                else
                {
                    // MOVE
                    if(scope.i!= i)
                    {
                        scope.i = i;
                        flagChanged = true;
                    }
                    cache[oid] = scope;
                    delete oldCache[oid];
                }
            }
            // EXIT
            for(var oid in oldCache)
            {
                var scope = oldCache[oid];
                exitList.push(scope);
                // scope.destroy();
                flagChanged = true;
            }

            if(flagChanged)
            {
                postponeUpdate = true;
                if(enterList.length && onEnterObservers.length)
                {
                    for(var j=0; j<onEnterObservers.length; j++)
                    {
                        onEnterObservers[j](resp,enterList);
                    }
                }
                if(exitList.length && onExitObservers.length)
                {
                    for(var j=0; j<onExitObservers.length; j++)
                    {
                        onExitObservers[j](resp,exitList);
                    }
                }
                changed(resp);
            }
        }

        redot.observeArray(data, update);
        Object.defineProperty(resp, 'length', { get: length, enumarable: false, configurable: false });
        postponeUpdate = true;
        update();
        return resp;
    };

})(); // END OF MAP AND REACTIVE OBJECTS //////////////////////////////////////////////////////////////////////

