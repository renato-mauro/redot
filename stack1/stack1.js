redot.include("stack1.css");

redot.stack = function(context, expression)
{
    console.log(context);
}

function Stack(d)
{    
    this.width    = 800;
    this.height   = 400;
               
    /*******************************************************
    <svg width="{this.width}" height="{this.height}">
        <g style="transform:translate(100px,20px)"> 
            <text x="0" y="0">Quantidade</text>
            <text x="100" y="0">Start</text>
            <text x="200" y="0">End</text>
        </g>
        <include template="StackElement" data="{d}" />
    </svg>
    ********************************************************/
}

function StackElement(d,i)
{       
    this.start = 0;
    this.end = 0;
    
    redot.stack(this, "d.qtd");

    /**********************************************************************************************
    <g style="transform:translate(100px,{40+i*16}px)"> 
        <text x="0" y="0">{d.qtd}</text>
        <text x="100" y="0">{d.start}</text>
        <text x="200" y="0">{d.end}</text>
    </g>
    **********************************************************************************************/
}

var data = [];
for(var i=0; i<20; i++)
{
    data.push({qtd:~~(Math.random()*50)+10});
}

redot.applyTemplate("#main", Stack, data);
