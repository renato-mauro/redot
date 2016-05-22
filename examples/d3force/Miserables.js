redot.include("Miserables.css");
redot.include("d3.min.js");

function d3_force_layout(context)
{
    var force = d3.layout.force()
        .nodes(context.data.nodes)
        .links(context.data.links)
    ;
    
    function registerProperty(p)
    {
        force[p](context[p]);
        redot.registerObserver(context,p,function(){force[p](context[p]).start()});    
    }
    
    for(var p in force)
    {
        if(context[p] !== undefined)
            registerProperty(p);
    }
    
    force.start();
    return force;
}

function d3_drag_setup(context)
{
    var force = context.parent.force;
    d3.select(redot.element).datum(context.data).call(force.drag);
}

function Miserables(d)
{    
    this.width    = 1024;
    this.height   = 600;    
    this.size     = "{[width,height]}";
    this.charge   = -120;
    this.radius   = 6;

    this.init = function()
    {
        this.force    = d3_force_layout(this);
        this.color    = d3.scale.category20();
    }

    /*********************************************************************************
    <div>
        <input type="range" min="-200" max="0" step="10" value="{this.charge}" oninput="{redot.inverse()}"/>
        <span>{charge}</span>
        <input type="range" min="2" max="10" step="1" value="{this.radius}" oninput="{redot.inverse()}"/>
        <span>{radius}</span>
        <br/>
        <svg width="{width}" height="{height}">
            <include template="MiserableLinks" data="{data.links}"/>
            <include template="MiserableNodes" data="{data.nodes}"/>
        </svg>
    </div>
    *********************************************************************************/
}

function MiserableNodes()
{    
    /**********************************************
    <circle
        onenter="{d3_drag_setup(this)}"
        class="node" 
        r="{parent.radius}" 
        cx="{data.x}" 
        cy="{data.y}" 
        fill="{parent.color(data.group)}" 
    />
    **********************************************/
}

function MiserableLinks()
{
    /**********************************************
    <line
        class="link"
        x1="{data.source.x}" 
        y1="{data.source.y}" 
        x2="{data.target.x}" 
        y2="{data.target.y}"
        style="stroke-width: {Math.sqrt(data.value)}"
    />
    **********************************************/
}

redot.applyTemplate('#main', Miserables, redot.json('Miserables.json'));
