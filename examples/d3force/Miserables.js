redot.include("Miserables.css");
redot.include("d3.min.js");

function d3_force_layout(context)
{
    var force = d3.layout.force()
        .nodes(context.d.nodes)
        .links(context.d.links)
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
    d3.select(redot.element).datum(context.d).call(force.drag);
}

function Miserables()
{    
    this.width    = 1024;
    this.height   = 600;    
    this.size     = "{[width,height]}";
    this.charge   = -120;
    this.radius   = 6;

    this.init = function(d,i)
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
        <svg width="{width+50}" height="{height}">
            <include template="MiserableLinks" data="{d.links}"/>
            <include template="MiserableNodes" data="{d.nodes}"/>
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
        cx="{d.x}" 
        cy="{d.y}" 
        fill="{parent.color(d.group)}" 
    />
    **********************************************/
}

function MiserableLinks()
{
    /**********************************************
    <line
        class="link"
        x1="{d.source.x}" 
        y1="{d.source.y}" 
        x2="{d.target.x}" 
        y2="{d.target.y}"
        style="stroke-width: {Math.sqrt(d.value)}"
    />
    **********************************************/
}

redot.applyTemplate('#main', Miserables, redot.json('Miserables.json'));
