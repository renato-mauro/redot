var global = { selectedItem: null };

var data = [];
for(var i=0; i<50; i++)
{
    data.push({qtd:~~(Math.random()*50)+10});
}
var d1 = redot.filter(data,"{d.qtd<30}");
var d2 = d1.notSelected();

setTimeout(function(){data.sort(function(a,b){return a.qtd-b.qtd});redot.changed(data)},5000);

function GraficoDeBarras()
{    
    this.width    = 1024;
    this.height   = 200;
    this.barWidth = "{width/d.length}";

    /*******************************************************
    <div>
        <svg width="{width+50}" height="{height+50}">
            <g transform="translate(25,25)">
                <include template="Barra" data="{d}" />
            </g>
        </svg>
    </div>
    ********************************************************/
}

function Barra()
{
    this.maxQtd = redot.agregate.max("{value}");
    this.yScale = "{parent.height/maxQtd}";
    this.width  = "{parent.barWidth}";
    this.height = "{yScale*d.qtd}";
    this.x      = "{i*width}";
    this.y      = "{parent.height-height}";
    this.value  = "{d.qtd}";
    this.color  = "{global.selectedItem == d ? 'blue' : 'orange'}"

    this.sel = function(d)
    {
        global.selectedItem = d;
    }
    
    /**********************************************************************************************
    <g class="bar" style="transform:translate({x}px,0);">
        <rect onclick="{sel(d)}" x="1" y="{y}" height="{height}" width="{width-2}" fill="{color}"/>
        <text x="{width/2}" y="{y-6}" dominant-baseline="middle">{d.qtd}</text> 
    </g>
    **********************************************************************************************/
}

redot.applyTemplate("#main", GraficoDeBarras, d1);
redot.applyTemplate("#main", GraficoDeBarras, d2);
redot.applyTemplate("#main", GraficoDeBarras, data);

