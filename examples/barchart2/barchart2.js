redot.include("barchart2.css");

function GraficoDeBarras()
{    
    this.width    = 1024;
    this.height   = 200;
    this.barWidth = "{width/data.length}";
    this.range    = null;
    this.yScale   = "{this.height/range.max}";

    this.init = function()
    {
        this.range = redot.domain(this.data,"qtd");
    }

    /*******************************************************
    <div>{range.min} *** {range.max}</div>
    <svg width="{width+50}" height="{height+50}">
        <g transform="translate(25,25)">
            <include template="Barra" data="{data}" />
        </g>
    </svg>
    ********************************************************/
}

function Barra()
{    
    this.color  = "skyblue";
    this.width  = "{parent.barWidth}";
    this.height = "{parent.yScale*data.qtd}";
    this.x      = "{i*width}";
    this.y      = "{parent.height-height}"
    
    /**********************************************************************************************
    <g class="bar" style="transform:translate({x}px,0);">
        <rect x="1" y="{y}" height="{height}" width="{width-2}" fill="{color}"/>
        <text x="{width/2}" y="{y-6}" dominant-baseline="middle">{data.qtd}</text> 
    </g>
    **********************************************************************************************/
}

var data = [];
for(var i=0; i<50; i++)
{
    data.push({qtd:~~(Math.random()*50)+10});
}
redot.applyTemplate("#main", GraficoDeBarras, data);

setTimeout(function(){data[5].qtd *= 80},3000);
setTimeout(function(){data[5].qtd /= 80},6000);

